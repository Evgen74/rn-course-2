interface StateViewerProps {
    state: unknown;
    env: unknown;
    methods: {
        name: string;
        kind: 'action' | 'flow' | 'method';
        arity: number;
    }[];
    storeId: string;
    onUpdateValue: (storeId: string, path: string, value: unknown) => void;
    onCallMethod: (storeId: string, methodName: string, parameters: unknown[]) => void;
}
export declare const StateViewer: ({ state, env, methods, storeId, onUpdateValue, onCallMethod, }: StateViewerProps) => import("react/jsx-runtime").JSX.Element;
export {};
