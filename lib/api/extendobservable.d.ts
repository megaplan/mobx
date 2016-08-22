import { ValueMode } from "../types/modifiers";
/**
 * Extends an object with reactive capabilities.
 * @param target the object to which reactive properties should be added
 * @param properties the properties that should be added and made reactive
 * @returns targer
 */
export declare function extendObservable<A extends Object, B extends Object>(target: A, ...properties: B[]): A & B;
export declare function extendObservableHelper(target: any, properties: any, mode: ValueMode, name: string): Object;
