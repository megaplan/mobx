import { Lambda } from "../utils/utils";
import { IReactionPublic } from "../core/reaction";
/**
 * Creates a reactive view and keeps it alive, so that the view is always
 * updated if one of the dependencies changes, even when the view is not further used by something else.
 * @param view The reactive view
 * @param scope (optional)
 * @returns disposer function, which can be used to stop the view from being updated in the future.
 */
export declare function autorun(view: (r: IReactionPublic) => void, scope?: any): any;
/**
 * Creates a named reactive view and keeps it alive, so that the view is always
 * updated if one of the dependencies changes, even when the view is not further used by something else.
 * @param name The view name
 * @param view The reactive view
 * @param scope (optional)
 * @returns disposer function, which can be used to stop the view from being updated in the future.
 */
export declare function autorun(name: string, view: (r: IReactionPublic) => void, scope?: any): any;
/**
 * Similar to 'observer', observes the given predicate until it returns true.
 * Once it returns true, the 'effect' function is invoked an the observation is cancelled.
 * @param name
 * @param predicate
 * @param effect
 * @param scope (optional)
 * @returns disposer function to prematurely end the observer.
 */
export declare function when(name: string, predicate: () => boolean, effect: Lambda, scope?: any): any;
/**
 * Similar to 'observer', observes the given predicate until it returns true.
 * Once it returns true, the 'effect' function is invoked an the observation is cancelled.
 * @param predicate
 * @param effect
 * @param scope (optional)
 * @returns disposer function to prematurely end the observer.
 */
export declare function when(predicate: () => boolean, effect: Lambda, scope?: any): any;
export declare function autorunUntil(predicate: () => boolean, effect: (r: IReactionPublic) => void, scope?: any): any;
export declare function autorunAsync(name: string, func: (r: IReactionPublic) => void, delay?: number, scope?: any): any;
export declare function autorunAsync(func: (r: IReactionPublic) => void, delay?: number, scope?: any): any;
/**
 *
 * Basically sugar for computed(expr).observe(action(effect))
 * or
 * autorun(() => action(effect)(expr));
 */
export declare function reaction<T>(name: string, expression: () => T, effect: (arg: T, r: IReactionPublic) => void, fireImmediately?: boolean, delay?: number, scope?: any): any;
/**
 *
 * Basically sugar for computed(expr).observe(action(effect))
 * or
 * autorun(() => action(effect)(expr));
 */
export declare function reaction<T>(expression: () => T, effect: (arg: T, r: IReactionPublic) => void, fireImmediately?: boolean, delay?: number, scope?: any): any;
