import { Lambda } from "../utils/utils";
export declare type IInterceptor<T> = (change: T) => T;
export interface IInterceptable<T> {
    interceptors: IInterceptor<T>[];
    intercept(handler: IInterceptor<T>): Lambda;
}
export declare function hasInterceptors(interceptable: IInterceptable<any>): boolean;
export declare function registerInterceptor<T>(interceptable: IInterceptable<T>, handler: IInterceptor<T>): Lambda;
export declare function interceptChange<T>(interceptable: IInterceptable<T>, change: T): T;
