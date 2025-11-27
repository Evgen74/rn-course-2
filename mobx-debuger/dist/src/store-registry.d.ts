import { IReactionDisposer } from 'mobx';
export interface RegisteredStore {
    id: string;
    name: string;
    store: any;
    state: any;
    fields?: Record<string, any>;
    methods: {
        name: string;
        kind: 'action' | 'flow' | 'method';
        arity: number;
    }[];
    disposer?: IReactionDisposer;
}
export interface StoreDump {
    id: string;
    meta: {
        name: string;
    };
    state?: any;
    fields?: Record<string, any>;
    methods?: {
        name: string;
        kind: 'action' | 'flow' | 'method';
        arity: number;
    }[];
}
declare class StoreRegistry {
    private stores;
    private listeners;
    private currentFocusedStoreId;
    private sendFunction;
    setSendFunction(sendFn: (event: string, payload: any) => void): void;
    private extractMethods;
    register(name: string, store: any): () => void;
    getStores(): RegisteredStore[];
    getStore(id: string): RegisteredStore | undefined;
    updateStoreValue(id: string, path: string, value: any): {
        ok: boolean;
        error: string;
    } | {
        ok: boolean;
        error?: undefined;
    };
    focusStore(storeId: string): void;
    unfocusStore(): void;
    getStoreDump(id: string): StoreDump | null;
    callStoreMethod(id: string, methodName: string, parameters: any[]): Promise<{
        ok: boolean;
        error: string;
        result?: undefined;
    } | {
        ok: boolean;
        result: unknown;
        error?: undefined;
    }>;
    subscribe(listener: () => void): () => boolean;
    private notifyListeners;
    clear(): void;
}
export declare const storeRegistry: StoreRegistry;
export declare const connectStore: (name: string, store: any) => () => void;
export {};
