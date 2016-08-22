import { IComputedValue } from "../core/computedvalue";
export interface IComputedValueOptions {
    asStructure: boolean;
}
/**
 * Decorator for class properties: @computed get value() { return expr; }.
 * For legacy purposes also invokable as ES5 observable created: `computed(() => expr)`;
 */
export declare function computed<T>(func: () => T, scope?: any): IComputedValue<T>;
export declare function computed(opts: IComputedValueOptions): (target: Object, key: string, baseDescriptor?: PropertyDescriptor) => void;
export declare function computed(target: Object, key: string | symbol, baseDescriptor?: PropertyDescriptor): void;
export declare function throwingComputedValueSetter(): void;
