import { BaseAtom } from "../core/atom";
import { ValueMode } from "./modifiers";
import { Lambda } from "../utils/utils";
import { IInterceptable, IInterceptor } from "./intercept-utils";
import { IListenable } from "./listen-utils";
export interface IValueWillChange<T> {
    object: any;
    type: "update";
    newValue: T;
}
export declare type IUNCHANGED = {};
export declare const UNCHANGED: IUNCHANGED;
export interface IObservableValue<T> {
    get(): T;
    set(value: T): void;
    intercept(handler: IInterceptor<IValueWillChange<T>>): Lambda;
    observe(listener: (newValue: T, oldValue: T) => void, fireImmediately?: boolean): Lambda;
}
export declare class ObservableValue<T> extends BaseAtom implements IObservableValue<T>, IInterceptable<IValueWillChange<T>>, IListenable {
    protected mode: ValueMode;
    hasUnreportedChange: boolean;
    interceptors: any;
    changeListeners: any;
    protected value: T;
    constructor(value: T, mode: ValueMode, name?: string, notifySpy?: boolean);
    set(newValue: T): void;
    prepareNewValue(newValue: any): T | IUNCHANGED;
    setNewValue(newValue: T): void;
    get(): T;
    intercept(handler: IInterceptor<IValueWillChange<T>>): Lambda;
    observe(listener: (newValue: T, oldValue: T) => void, fireImmediately?: boolean): Lambda;
    toJSON(): T;
    toString(): string;
}
