type SendFunction = (event: string, payload: unknown) => void;
export declare function watchFocusedStore(instance: any, storeId: string, send: SendFunction): void;
export declare function stopWatchingFocusedStore(): void;
export {};
