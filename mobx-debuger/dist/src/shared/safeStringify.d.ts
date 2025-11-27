type SanitizeOptions = {
    depth?: number;
    seen?: WeakSet<object>;
    trackComputed?: boolean;
};
export declare function sanitizeForJson(input: unknown, options?: SanitizeOptions): unknown;
export declare function safeStringify(value: unknown, options?: SanitizeOptions): string;
export {};
