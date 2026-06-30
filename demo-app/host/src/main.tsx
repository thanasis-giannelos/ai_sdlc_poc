// Dynamic import defers React mount until the MF shared-dep manifest is resolved,
// preventing the "Shared module not available for eager consumption" bootstrap error.
import('./bootstrap');
