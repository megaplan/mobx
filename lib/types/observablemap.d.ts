import { Lambda } from "../utils/utils";
import { IInterceptable, IInterceptor } from "./intercept-utils";
import { IListenable } from "./listen-utils";
import { Iterator } from "../utils/iterable";
export interface IKeyValueMap<V> {
    [key: string]: V;
}
export declare type IMapEntry<V> = [string, V];
export declare type IMapEntries<V> = IMapEntry<V>[];
export interface IMapChange<T> {
    object: ObservableMap<T>;
    type: "update" | "add" | "delete";
    name: string;
    newValue?: any;
    oldValue?: any;
}
export interface IMapWillChange<T> {
    object: ObservableMap<T>;
    type: "update" | "add" | "delete";
    name: string;
    newValue?: any;
}
export declare class ObservableMap<V> implements IInterceptable<IMapWillChange<V>>, IListenable {
    $mobx: {};
    private _data;
    private _hasMap;
    private _valueMode;
    name: string;
    private _keys;
    interceptors: any;
    changeListeners: any;
    constructor(initialData?: IMapEntries<V> | IKeyValueMap<V>, valueModeFunc?: Function);
    private _has(key);
    has(key: string): boolean;
    set(key: string, value: V): void;
    delete(key: string): void;
    private _updateHasMapEntry(key, value);
    private _updateValue(name, newValue);
    private _addValue(name, newValue);
    get(key: string): V;
    keys(): string[] & Iterator<string>;
    values(): V[] & Iterator<V>;
    entries(): IMapEntries<V> & Iterator<IMapEntry<V>>;
    forEach(callback: (value: V, key: string, object: IKeyValueMap<V>) => void, thisArg?: any): void;
    /** Merge another object into this object, returns this. */
    merge(other: ObservableMap<V> | IKeyValueMap<V>): ObservableMap<V>;
    clear(): void;
    size: number;
    /**
     * Returns a shallow non observable object clone of this map.
     * Note that the values migth still be observable. For a deep clone use mobx.toJS.
     */
    toJS(): IKeyValueMap<V>;
    toJs(): IKeyValueMap<V>;
    toJSON(): IKeyValueMap<V>;
    private isValidKey(key);
    private assertValidKey(key);
    toString(): string;
    /**
     * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
     * for callback details
     */
    observe(listener: (changes: IMapChange<V>) => void, fireImmediately?: boolean): Lambda;
    intercept(handler: IInterceptor<IMapWillChange<V>>): Lambda;
}
/**
 * Creates a map, similar to ES6 maps (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map),
 * yet observable.
 */
export declare function map<V>(initialValues?: IMapEntries<V> | IKeyValueMap<V>, valueModifier?: Function): ObservableMap<V>;
export declare function isObservableMap(thing: any): thing is ObservableMap<any>;
