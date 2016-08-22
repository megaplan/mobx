import { IObservable, IDepTreeNode } from "./observable";
import { SimpleSet, ISetEntry } from "../utils/set";
/**
 * A derivation is everything that can be derived from the state (all the atoms) in a pure manner.
 * See https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
 */
export interface IDerivation extends IDepTreeNode, IObservable, ISetEntry {
    observing: IObservable[];
    staleObservers: IDerivation[];
    observers: SimpleSet<IDerivation>;
    dependencyStaleCount: number;
    dependencyChangeCount: number;
    onDependenciesReady(): boolean;
    /**
     * Id of the current run of a derivation. Each time the derivation is tracked
     * this number is increased by one. This number is globally unique
     */
    runId: number;
    /**
     * amount of dependencies used by the derivation in this run, which has not been bound yet.
     */
    unboundDepsCount: number;
}
export declare function isComputingDerivation(): boolean;
export declare function checkIfStateModificationsAreAllowed(): void;
/**
 * Notify a derivation that one of the values it is observing has become stale
 */
export declare function notifyDependencyStale(derivation: IDerivation): void;
/**
 * Notify a derivation that one of the values it is observing has become stable again.
 * If all observed values are stable and at least one of them has changed, the derivation
 * will be scheduled for re-evaluation.
 */
export declare function notifyDependencyReady(derivation: IDerivation, dependencyDidChange: boolean): void;
/**
 * Executes the provided function `f` and tracks which observables are being accessed.
 * The tracking information is stored on the `derivation` object and the derivation is registered
 * as observer of any of the accessed observables.
 */
export declare function trackDerivedFunction<T>(derivation: IDerivation, f: () => T): T;
export declare function clearObserving(derivation: IDerivation): void;
export declare function untracked<T>(action: () => T): T;
export declare function untrackedStart(): boolean;
export declare function untrackedEnd(prev: boolean): void;
