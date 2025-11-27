export type MethodInfo = {
    name: string;
    kind: 'action' | 'flow' | 'method';
    arity: number;
};
export declare function collectMethods(instance: any): MethodInfo[];
