import { ObservableMap, IMapEntries, IKeyValueMap } from "../types/observablemap";
export declare enum ValueMode {
    Recursive = 0,
    Reference = 1,
    Structure = 2,
    Flat = 3,
}
/**
    * Can be used in combination with makeReactive / extendReactive.
    * Enforces that a reference to 'value' is stored as property,
    * but that 'value' itself is not turned into something reactive.
    * Future assignments to the same property will inherit this behavior.
    * @param value initial value of the reactive property that is being defined.
    */
export declare function asReference<T>(value: T): T;
/**
    * Can be used in combination with makeReactive / extendReactive.
    * Enforces that values that are deeply equalled identical to the previous are considered to unchanged.
    * (the default equality used by mobx is reference equality).
    * Values that are still reference equal, but not deep equal, are considered to be changed.
    * asStructure can only be used incombinations with arrays or objects.
    * It does not support cyclic structures.
    * Future assignments to the same property will inherit this behavior.
    * @param value initial value of the reactive property that is being defined.
    */
export declare function asStructure<T>(value: T): T;
/**
    * Can be used in combination with makeReactive / extendReactive.
    * The value will be made reactive, but, if the value is an object or array,
    * children will not automatically be made reactive as well.
    */
export declare function asFlat<T>(value: T): T;
export declare class AsReference {
    value: any;
    constructor(value: any);
}
export declare class AsStructure {
    value: any;
    constructor(value: any);
}
export declare class AsFlat {
    value: any;
    constructor(value: any);
}
export declare function asMap(): ObservableMap<any>;
export declare function asMap<T>(): ObservableMap<T>;
export declare function asMap<T>(entries: IMapEntries<T>, modifierFunc?: Function): ObservableMap<T>;
export declare function asMap<T>(data: IKeyValueMap<T>, modifierFunc?: Function): ObservableMap<T>;
export declare function getValueModeFromValue(value: any, defaultMode: ValueMode): [ValueMode, any];
export declare function getValueModeFromModifierFunc(func?: Function): ValueMode;
export declare function makeChildObservable(value: any, parentMode: ValueMode, name?: string): any;
export declare function assertUnwrapped(value: any, message: any): void;
