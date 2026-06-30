
    export type RemoteKeys = 'catalogRemote/CatalogApp';
    type PackageType<T> = T extends 'catalogRemote/CatalogApp' ? typeof import('catalogRemote/CatalogApp') :any;