export interface PluginEvents extends Record<string, unknown> {
    'stores-list': {
        stores: {
            id: string;
            name: string;
        }[];
    };
    'select-store': {
        storeId: string;
        options?: unknown;
    };
    'request-store-snapshot': {
        storeId?: string;
    };
    'store-snapshot': {
        storeId: string;
        state: unknown;
    };
    STORE_DUMP: {
        storeId: string;
        state: unknown;
    };
    'focus-store': {
        storeId: string;
    };
    'invoke-method': {
        storeId: string;
        name: string;
        args?: unknown[];
    };
    'patch-state': {
        storeId: string;
        path: string;
        value: unknown;
    };
    'request-methods': {
        storeId: string;
    };
    'store-methods': {
        storeId: string;
        methods: {
            name: string;
            kind: 'action' | 'flow' | 'method';
            arity: number;
        }[];
    };
    'method-result': {
        storeId: string;
        name: string;
        result: {
            ok: boolean;
            result?: unknown;
            error?: string;
        };
    };
    'patch-result': {
        storeId: string;
        path: string;
        result: {
            ok: boolean;
            error?: string;
        };
    };
    'request-env': {
        storeId: string;
    };
    'store-env': {
        storeId: string;
        env: unknown;
    };
}
declare const MobXDebuggerPanel: () => import("react/jsx-runtime").JSX.Element;
export default MobXDebuggerPanel;
