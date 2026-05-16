declare module 'branch-sdk' {
    interface BranchInitCallback {
        (err: any, data: any): void;
    }

    interface Branch {
        init(key: string, callback?: BranchInitCallback): void;
        data(callback: (err: any, data: any) => void): void;
        link(data: any, callback: (err: any, url: string) => void): void;
        setIdentity(identity: string, callback?: BranchInitCallback): void;
        logout(callback?: () => void): void;
        track(event: string, data?: any): void;
    }

    const branch: Branch;
    export default branch;
}
