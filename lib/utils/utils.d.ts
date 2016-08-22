export declare const EMPTY_ARRAY: any[];
export interface Lambda {
    (): void;
    name?: string;
}
export declare function getNextId(): number;
export declare function invariant(check: boolean, message: string, thing?: any): void;
export declare function deprecated(msg: string): void;
/**
 * Makes sure that the provided function is invoked at most once.
 */
export declare function once(func: Lambda): Lambda;
export declare const noop: () => void;
export declare function unique<T>(list: T[]): T[];
export declare function joinStrings(things: string[], limit?: number, separator?: string): string;
export declare function isPlainObject(value: any): boolean;
export declare function objectAssign(...objs: Object[]): Object;
export declare function valueDidChange(compareStructural: boolean, oldValue: any, newValue: any): boolean;
export declare function makeNonEnumerable(object: any, propNames: string[]): void;
export declare function addHiddenProp(object: any, propName: string, value: any): void;
export declare function addHiddenFinalProp(object: any, propName: string, value: any): void;
export declare function isPropertyConfigurable(object: any, prop: string): boolean;
export declare function assertPropertyConfigurable(object: any, prop: string): void;
export declare function getEnumerableKeys(obj: any): any[];
/**
 * Naive deepEqual. Doesn't check for prototype, non-enumerable or out-of-range properties on arrays.
 * If you have such a case, you probably should use this function but something fancier :).
 */
export declare function deepEquals(a: any, b: any): boolean;
