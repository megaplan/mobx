import { IObservableValue } from "../types/observablevalue";
import { IObservableArray } from "../types/observablearray";
/**
 * Turns an object, array or function into a reactive structure.
 * @param value the value which should become observable.
 */
export declare function observable<T>(): IObservableValue<T>;
export declare function observable(target: Object, key: string, baseDescriptor?: PropertyDescriptor): any;
export declare function observable<T>(value: T[]): IObservableArray<T>;
export declare function observable<T, S extends Object>(value: () => T, thisArg?: S): IObservableValue<T>;
export declare function observable<T extends string | number | boolean | Date | RegExp | Function | void>(value: T): IObservableValue<T>;
export declare function observable<T extends Object>(value: T): T;
export declare enum ValueType {
    Reference = 0,
    PlainObject = 1,
    ComplexObject = 2,
    Array = 3,
    ViewFunction = 4,
    ComplexFunction = 5,
}
export declare function getTypeOfValue(value: any): ValueType;
