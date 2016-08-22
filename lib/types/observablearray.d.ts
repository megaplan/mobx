import { Lambda } from "../utils/utils";
import { ValueMode } from "./modifiers";
import { IInterceptor } from "./intercept-utils";
export interface IObservableArray<T> extends Array<T> {
    spliceWithArray(index: number, deleteCount?: number, newItems?: T[]): T[];
    observe(listener: (changeData: IArrayChange<T> | IArraySplice<T>) => void, fireImmediately?: boolean): Lambda;
    intercept<T>(handler: IInterceptor<IArrayChange<T> | IArraySplice<T>>): Lambda;
    clear(): T[];
    peek(): T[];
    replace(newItems: T[]): T[];
    find(predicate: (item: T, index: number, array: IObservableArray<T>) => boolean, thisArg?: any, fromIndex?: number): T;
    remove(value: T): boolean;
}
export interface IArrayChange<T> {
    type: "update";
    object: IObservableArray<T>;
    index: number;
    newValue: T;
    oldValue: T;
}
export interface IArraySplice<T> {
    type: "splice";
    object: IObservableArray<T>;
    index: number;
    added: T[];
    addedCount: number;
    removed: T[];
    removedCount: number;
}
export interface IArrayWillChange<T> {
    type: "update";
    object: IObservableArray<T>;
    index: number;
    newValue: T;
}
export interface IArrayWillSplice<T> {
    type: "splice";
    object: IObservableArray<T>;
    index: number;
    added: T[];
    removedCount: number;
}
export declare class StubArray {
}
export declare class ObservableArray<T> extends StubArray {
    private $mobx;
    constructor(initialValues: T[], mode: ValueMode, name: string, owned?: boolean);
    intercept<T>(handler: IInterceptor<IArrayChange<T> | IArraySplice<T>>): Lambda;
    observe(listener: (changeData: IArrayChange<T> | IArraySplice<T>) => void, fireImmediately?: boolean): Lambda;
    clear(): T[];
    concat(...arrays: T[][]): T[];
    replace(newItems: T[]): T[];
    /**
     * Converts this array back to a (shallow) javascript structure.
     * For a deep clone use mobx.toJS
     */
    toJS(): T[];
    toJSON(): T[];
    peek(): T[];
    find(predicate: (item: T, index: number, array: ObservableArray<T>) => boolean, thisArg?: any, fromIndex?: number): T;
    splice(index: number, deleteCount?: number, ...newItems: T[]): T[];
    push(...items: T[]): number;
    pop(): T;
    shift(): T;
    unshift(...items: T[]): number;
    reverse(): T[];
    sort(compareFn?: (a: T, b: T) => number): T[];
    remove(value: T): boolean;
    toString(): string;
    toLocaleString(): string;
}
export declare function createObservableArray<T>(initialValues: T[], mode: ValueMode, name: string): IObservableArray<T>;
export declare function fastArray<V>(initialValues?: V[]): IObservableArray<V>;
export declare function isObservableArray(thing: any): thing is IObservableArray<any>;
