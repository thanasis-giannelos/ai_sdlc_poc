
    export type RemoteKeys = 'cartRemote/CartApp' | 'cartRemote/CartPage';
    type PackageType<T> = T extends 'cartRemote/CartPage' ? typeof import('cartRemote/CartPage') :T extends 'cartRemote/CartApp' ? typeof import('cartRemote/CartApp') :any;