import { MethodInfo } from '../collectMethods';
type Props = {
    storeId: string;
    methods: MethodInfo[];
    invoke: (name: string, args: unknown[]) => Promise<{
        ok?: boolean;
        result?: unknown;
        error?: string;
    }>;
};
export declare const MethodsPanel: ({ methods, invoke }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
