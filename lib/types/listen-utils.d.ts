import { Lambda } from "../utils/utils";
export interface IListenable {
    changeListeners: Function[];
    observe(handler: (change: any, oldValue?: any) => void, fireImmediately?: boolean): Lambda;
}
export declare function hasListeners(listenable: IListenable): boolean;
export declare function registerListener<T>(listenable: IListenable, handler: Function): Lambda;
export declare function notifyListeners<T>(listenable: IListenable, change: T | T[]): void;
