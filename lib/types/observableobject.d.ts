import { ObservableValue } from "./observablevalue";
import { ComputedValue } from "../core/computedvalue";
import { ValueMode } from "./modifiers";
import { Lambda } from "../utils/utils";
import { IInterceptable } from "./intercept-utils";
import { IListenable } from "./listen-utils";
export interface IObjectChange {
    name: string;
    object: any;
    type: "update" | "add";
    oldValue?: any;
    newValue: any;
}
export interface IObjectWillChange {
    object: any;
    type: "update" | "add";
    name: string;
    newValue: any;
}
export declare class ObservableObjectAdministration implements IInterceptable<IObjectWillChange>, IListenable {
    target: any;
    name: string;
    mode: ValueMode;
    values: {
        [key: string]: ObservableValue<any> | ComputedValue<any>;
    };
    changeListeners: any;
    interceptors: any;
    constructor(target: any, name: string, mode: ValueMode);
    /**
        * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
        * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
        * for callback details
        */
    observe(callback: (changes: IObjectChange) => void, fireImmediately?: boolean): Lambda;
    intercept(handler: any): Lambda;
}
export interface IIsObservableObject {
    $mobx: ObservableObjectAdministration;
}
export declare function asObservableObject(target: any, name: string, mode?: ValueMode): ObservableObjectAdministration;
export declare function setObservableObjectInstanceProperty(adm: ObservableObjectAdministration, propName: string, value: any): void;
export declare function defineObservableProperty(adm: ObservableObjectAdministration, propName: string, newValue: any, asInstanceProperty: boolean): void;
export declare function generateObservablePropConfig(propName: any): any;
export declare function generateComputedPropConfig(propName: any): any;
export declare function setPropertyValue(instance: any, name: string, newValue: any): void;
export declare function isObservableObject(thing: any): boolean;
