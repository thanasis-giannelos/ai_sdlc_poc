
    export type RemoteKeys = 'accountRemote/AccountApp' | 'accountRemote/LoginPage' | 'accountRemote/AccountPage';
    type PackageType<T> = T extends 'accountRemote/AccountPage' ? typeof import('accountRemote/AccountPage') :T extends 'accountRemote/LoginPage' ? typeof import('accountRemote/LoginPage') :T extends 'accountRemote/AccountApp' ? typeof import('accountRemote/AccountApp') :any;