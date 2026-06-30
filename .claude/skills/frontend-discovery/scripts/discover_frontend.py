"""Discover and inventory the structure of an existing frontend codebase.

Detects the framework, enumerates routes, counts components, identifies state
management libraries, and summarises data-fetching patterns. Outputs either a
human-readable markdown-style report or structured JSON.

Usage:
    python discover_frontend.py <project_dir> [--json] [--verbose]
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Framework detection
# ---------------------------------------------------------------------------

def detect_framework(project_dir: str) -> dict:
    """Detect the frontend framework used in the project.

    Reads ``package.json`` for well-known framework packages, then falls back
    to checking for config files when the dependency is ambiguous.

    Args:
        project_dir: Absolute or relative path to the project root.

    Returns:
        A dict with keys ``name`` (str), ``version`` (str), and
        ``rendering`` (str).  ``rendering`` is one of ``"SSR"``,
        ``"SSG"``, ``"CSR"``, ``"hybrid"``, or ``"unknown"``.

    Raises:
        SystemExit: If ``package.json`` is not found in ``project_dir``.
    """
    pkg_path = Path(project_dir) / "package.json"
    if not pkg_path.exists():
        print(
            f"ERROR: No package.json found in {project_dir!r}. "
            "Please confirm the correct project directory.",
            file=sys.stderr,
        )
        sys.exit(1)

    with pkg_path.open(encoding="utf-8") as fh:
        pkg = json.load(fh)

    all_deps: dict = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    root = Path(project_dir)

    # Next.js — check before generic React so it takes priority
    if "next" in all_deps:
        version = all_deps["next"]
        # App Router is available from Next 13+; Pages Router is the fallback
        app_dir = root / "app"
        src_app_dir = root / "src" / "app"
        if app_dir.exists() or src_app_dir.exists():
            rendering = "hybrid"  # App Router: mix of RSC (SSR) and CSR
        else:
            rendering = "SSR"  # Pages Router default
        return {"name": "Next.js", "version": version, "rendering": rendering}

    # Remix
    if "@remix-run/react" in all_deps or "@remix-run/node" in all_deps:
        version = all_deps.get("@remix-run/react", all_deps.get("@remix-run/node", "unknown"))
        return {"name": "Remix", "version": version, "rendering": "SSR"}

    # Create React App
    if "react-scripts" in all_deps:
        version = all_deps["react-scripts"]
        return {"name": "CRA", "version": version, "rendering": "CSR"}

    # Vite — check config file as well
    vite_config = list(root.glob("vite.config.*"))
    if "vite" in all_deps or vite_config:
        version = all_deps.get("vite", "unknown")
        return {"name": "Vite", "version": version, "rendering": "CSR"}

    # Plain React without a recognised bundler/framework
    if "react" in all_deps:
        version = all_deps["react"]
        return {"name": "React (unknown bundler)", "version": version, "rendering": "CSR"}

    return {"name": "unknown", "version": "unknown", "rendering": "unknown"}


# ---------------------------------------------------------------------------
# Route detection
# ---------------------------------------------------------------------------

def _infer_strategy(file_path: Path, framework_name: str) -> str:
    """Infer the rendering strategy of a single route file.

    Args:
        file_path: Path to the route source file.
        framework_name: Framework name as returned by ``detect_framework``.

    Returns:
        One of ``"SSR"``, ``"SSG"``, ``"RSC"``, ``"ISR"``, ``"CSR"``.
    """
    try:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return "CSR"

    if "getServerSideProps" in source:
        return "SSR"
    if "getStaticProps" in source:
        return "SSG"
    # App Router: absence of "use client" means Server Component
    if framework_name == "Next.js":
        if re.search(r'export\s+const\s+revalidate\s*=', source):
            return "ISR"
        if re.search(r'export\s+const\s+dynamic\s*=\s*["\']force-static["\']', source):
            return "SSG"
        if '"use client"' in source or "'use client'" in source:
            return "CSR"
        # In the app/ directory default is RSC (server)
        app_markers = ("app/", "src/app/")
        if any(m in str(file_path).replace("\\", "/") for m in app_markers):
            return "RSC"
    if framework_name == "Remix":
        if "export async function loader" in source or "export async function action" in source:
            return "SSR"
    return "CSR"


def _file_to_route_path(file_path: Path, base_dir: Path, framework_name: str) -> str:
    """Convert a filesystem path to a URL-style route path.

    Args:
        file_path: Absolute path to the route file.
        base_dir: The root directory that is the route base (e.g. ``pages/``).
        framework_name: Framework name used for Remix dot-notation handling.

    Returns:
        A URL-style route string such as ``/blog/[slug]``.
    """
    rel = file_path.relative_to(base_dir)
    parts = list(rel.parts)

    # Drop file extension
    stem = Path(parts[-1]).stem
    parts[-1] = stem

    # Remove index segments
    parts = [p for p in parts if p not in ("index", "page", "route", "layout")]

    # Remix dot-notation: blog.$slug → /blog/:slug
    if framework_name == "Remix":
        route_str = "/".join(parts)
        route_str = re.sub(r'\$(\w+)', r':\1', route_str)
        route_str = re.sub(r'_index', '', route_str)
    else:
        route_str = "/".join(parts)

    return "/" + route_str if route_str else "/"


def detect_routes(project_dir: str, framework: dict) -> list:
    """Walk known route directories and enumerate all routes.

    Supports Next.js Pages Router (``pages/``), Next.js App Router (``app/``),
    Vite/CRA (``src/pages/``), and Remix (``app/routes/``).  API routes are
    excluded from the inventory.

    Args:
        project_dir: Path to the project root.
        framework: Dict returned by ``detect_framework``.

    Returns:
        A list of dicts, each with keys ``path`` (str), ``file`` (str), and
        ``strategy`` (str).
    """
    root = Path(project_dir)
    name = framework["name"]
    routes: list = []

    # Candidate route base directories, in priority order
    candidates: list = []
    if name == "Next.js":
        candidates = [
            root / "pages",
            root / "src" / "pages",
            root / "app",
            root / "src" / "app",
        ]
    elif name == "Remix":
        candidates = [root / "app" / "routes"]
    else:
        # Vite / CRA / generic React
        candidates = [
            root / "src" / "pages",
            root / "src" / "routes",
            root / "pages",
        ]

    for base_dir in candidates:
        if not base_dir.exists():
            continue
        for dirpath, _dirnames, filenames in os.walk(base_dir):
            for fname in filenames:
                if not (fname.endswith(".tsx") or fname.endswith(".jsx")
                        or fname.endswith(".ts") or fname.endswith(".js")):
                    continue
                fpath = Path(dirpath) / fname
                rel_str = str(fpath.relative_to(root)).replace("\\", "/")
                # Skip API routes
                if "/api/" in rel_str:
                    continue
                route_path = _file_to_route_path(fpath, base_dir, name)
                strategy = _infer_strategy(fpath, name)
                routes.append({
                    "path": route_path,
                    "file": rel_str,
                    "strategy": strategy,
                })

    return routes


# ---------------------------------------------------------------------------
# Component counting
# ---------------------------------------------------------------------------

def count_components(project_dir: str) -> dict:
    """Count React component files and split them into shared vs page-level.

    Searches ``src/components/``, ``components/``, ``src/pages/``,
    ``pages/``, ``src/app/``, and ``app/`` for ``.tsx`` and ``.jsx`` files.

    Args:
        project_dir: Path to the project root.

    Returns:
        A dict with keys ``total`` (int), ``shared`` (int), and
        ``page_level`` (int).
    """
    root = Path(project_dir)
    shared_dirs = [
        root / "src" / "components",
        root / "components",
    ]
    page_dirs = [
        root / "src" / "pages",
        root / "pages",
        root / "src" / "app",
        root / "app",
        root / "src" / "routes",
    ]

    def _count_in(dirs: list) -> int:
        total = 0
        seen: set = set()
        for d in dirs:
            if not d.exists():
                continue
            for dirpath, _dn, filenames in os.walk(d):
                for fname in filenames:
                    if fname.endswith(".tsx") or fname.endswith(".jsx"):
                        full = Path(dirpath) / fname
                        if full not in seen:
                            seen.add(full)
                            total += 1
        return total

    shared = _count_in(shared_dirs)
    page_level = _count_in(page_dirs)
    return {"total": shared + page_level, "shared": shared, "page_level": page_level}


# ---------------------------------------------------------------------------
# State library detection
# ---------------------------------------------------------------------------

_STATE_PACKAGES = [
    "redux",
    "@reduxjs/toolkit",
    "zustand",
    "jotai",
    "recoil",
    "@tanstack/react-query",
    "swr",
    "mobx",
    "mobx-react-lite",
]

_STATE_IMPORT_PATTERNS: dict = {
    "redux": r"from\s+['\"]react-redux['\"]",
    "@reduxjs/toolkit": r"from\s+['\"]@reduxjs/toolkit['\"]",
    "zustand": r"from\s+['\"]zustand['\"]",
    "jotai": r"from\s+['\"]jotai['\"]",
    "recoil": r"from\s+['\"]recoil['\"]",
    "@tanstack/react-query": r"from\s+['\"]@tanstack/react-query['\"]",
    "swr": r"from\s+['\"]swr['\"]",
    "mobx": r"from\s+['\"]mobx['\"]",
    "mobx-react-lite": r"from\s+['\"]mobx-react-lite['\"]",
}


def _grep_src(project_dir: str, pattern: str) -> bool:
    """Return True if ``pattern`` matches any line in src/ JS/TS files.

    Args:
        project_dir: Path to the project root.
        pattern: Regular expression pattern to search for.

    Returns:
        ``True`` if at least one match is found, ``False`` otherwise.
    """
    src_root = Path(project_dir) / "src"
    if not src_root.exists():
        src_root = Path(project_dir)
    compiled = re.compile(pattern)
    for dirpath, _dn, filenames in os.walk(src_root):
        for fname in filenames:
            if not any(fname.endswith(ext) for ext in (".ts", ".tsx", ".js", ".jsx")):
                continue
            fpath = Path(dirpath) / fname
            try:
                text = fpath.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if compiled.search(text):
                return True
    return False


def detect_state_libraries(project_dir: str) -> list:
    """Detect state management and data-fetching libraries.

    Checks ``package.json`` dependencies and scans ``src/`` for import usage.

    Args:
        project_dir: Path to the project root.

    Returns:
        A list of dicts, each with keys ``name`` (str) and ``confidence``
        (str).  ``confidence`` is one of ``"package.json"``, ``"imports"``,
        or ``"both"``.
    """
    pkg_path = Path(project_dir) / "package.json"
    with pkg_path.open(encoding="utf-8") as fh:
        pkg = json.load(fh)

    all_deps: dict = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    results: list = []
    for lib in _STATE_PACKAGES:
        in_pkg = lib in all_deps
        pattern = _STATE_IMPORT_PATTERNS.get(lib, "")
        in_imports = _grep_src(project_dir, pattern) if pattern else False

        if in_pkg and in_imports:
            confidence = "both"
        elif in_pkg:
            confidence = "package.json"
        elif in_imports:
            confidence = "imports"
        else:
            continue

        results.append({"name": lib, "confidence": confidence})

    return results


# ---------------------------------------------------------------------------
# Data-fetching pattern detection
# ---------------------------------------------------------------------------

_FETCH_PATTERNS: list = [
    ("React Query", r"\buseQuery\b"),
    ("SWR", r"\buseSWR\b"),
    ("getServerSideProps", r"\bgetServerSideProps\b"),
    ("getStaticProps", r"\bgetStaticProps\b"),
    ("Server Actions", r'"use server"'),
    ("useEffect+fetch", r"useEffect[^}]*fetch\("),
]


def detect_data_fetching(project_dir: str) -> list:
    """Detect data-fetching patterns used across the codebase.

    Greps ``src/`` (and the project root if no ``src/`` exists) for known
    patterns associated with each data-fetching approach.

    Args:
        project_dir: Path to the project root.

    Returns:
        A list of pattern name strings for each detected pattern.
    """
    detected: list = []
    for label, pattern in _FETCH_PATTERNS:
        if _grep_src(project_dir, pattern):
            detected.append(label)
    return detected


# ---------------------------------------------------------------------------
# Report assembly
# ---------------------------------------------------------------------------

def build_report(
    framework: dict,
    routes: list,
    components: dict,
    state_libs: list,
    data_fetching: list,
) -> dict:
    """Assemble all discovery sections into a single report dict.

    Args:
        framework: Dict from ``detect_framework``.
        routes: List from ``detect_routes``.
        components: Dict from ``count_components``.
        state_libs: List from ``detect_state_libraries``.
        data_fetching: List from ``detect_data_fetching``.

    Returns:
        A dict with keys ``framework``, ``routes``, ``components``,
        ``state_libraries``, ``data_fetching_patterns``, and
        ``recommended_next_step``.
    """
    # Decide recommended next step
    is_legacy = framework["name"] in ("CRA", "unknown")
    has_ssr = any(r["strategy"] in ("SSR", "RSC", "ISR") for r in routes)

    if is_legacy or has_ssr:
        next_step = "frontend-architecture-planner"
    elif not routes:
        next_step = "frontend-nfr-gatherer"
    else:
        next_step = "frontend-stack-advisor"

    return {
        "framework": framework,
        "routes": routes,
        "components": components,
        "state_libraries": state_libs,
        "data_fetching_patterns": data_fetching,
        "recommended_next_step": next_step,
    }


# ---------------------------------------------------------------------------
# Text rendering
# ---------------------------------------------------------------------------

def format_text_report(report: dict, verbose: bool) -> str:
    """Render the report dict as a human-readable markdown-style string.

    Args:
        report: Dict from ``build_report``.
        verbose: When ``True``, include a full route-by-route file listing.

    Returns:
        A multi-line string formatted for terminal output.
    """
    lines: list = []
    fw = report["framework"]
    lines.append("# Frontend Discovery Report")
    lines.append("")
    lines.append("## Framework")
    lines.append(
        f"- **Name:** {fw['name']}  "
        f"**Version:** {fw['version']}  "
        f"**Rendering:** {fw['rendering']}"
    )
    if fw["name"] == "CRA":
        lines.append("- WARNING: CRA is legacy. Consider migrating to Vite.")

    lines.append("")
    lines.append("## Routes")
    routes = report["routes"]
    if not routes:
        lines.append("- No routes detected.")
    else:
        lines.append(f"- Total routes: {len(routes)}")
        strategy_counts: dict = {}
        for r in routes:
            strategy_counts[r["strategy"]] = strategy_counts.get(r["strategy"], 0) + 1
        for strategy, count in sorted(strategy_counts.items()):
            lines.append(f"  - {strategy}: {count}")

        if verbose:
            lines.append("")
            lines.append("| Route Path | File | Strategy |")
            lines.append("|---|---|---|")
            for r in routes:
                lines.append(f"| `{r['path']}` | `{r['file']}` | {r['strategy']} |")

    lines.append("")
    lines.append("## Components")
    comp = report["components"]
    lines.append(f"- Total: {comp['total']}")
    lines.append(f"- Shared (components/): {comp['shared']}")
    lines.append(f"- Page-level (pages/app/): {comp['page_level']}")
    if comp["total"] > 500:
        lines.append(
            "- NOTE: Component count exceeds 500 — deep nesting analysis skipped."
        )

    lines.append("")
    lines.append("## State Libraries")
    state_libs = report["state_libraries"]
    if not state_libs:
        lines.append("- None detected (possible React Context usage).")
    else:
        for lib in state_libs:
            lines.append(f"- **{lib['name']}** (confidence: {lib['confidence']})")

    lines.append("")
    lines.append("## Data-Fetching Patterns")
    patterns = report["data_fetching_patterns"]
    if not patterns:
        lines.append("- None detected.")
    else:
        for p in patterns:
            lines.append(f"- {p}")

    lines.append("")
    lines.append("## Recommended Next Step")
    lines.append(f"- `{report['recommended_next_step']}`")
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    """Parse arguments, run all detectors, and print the report."""
    parser = argparse.ArgumentParser(
        description="Discover and inventory an existing frontend codebase."
    )
    parser.add_argument(
        "project_dir",
        help="Path to the frontend project root (must contain package.json).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="output_json",
        help="Output the report as JSON instead of human-readable text.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Include file-level detail (full route table, etc.).",
    )
    args = parser.parse_args()

    framework = detect_framework(args.project_dir)
    routes = detect_routes(args.project_dir, framework)
    components = count_components(args.project_dir)
    state_libs = detect_state_libraries(args.project_dir)
    data_fetching = detect_data_fetching(args.project_dir)

    report = build_report(framework, routes, components, state_libs, data_fetching)

    if args.output_json:
        print(json.dumps(report, indent=2))
    else:
        print(format_text_report(report, verbose=args.verbose))


if __name__ == "__main__":
    main()
