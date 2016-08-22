import { IObservable } from "./observable";
import { IDerivation } from "./derivation";
import { Lambda } from "../utils/utils";
import { SimpleSet } from "../utils/set";
export interface IComputedValue<T> {
    get(): T;
    set(value: T): void;
    observe(listener: (newValue: T, oldValue: T) => void, fireImmediately?: boolean): Lambda;
}
/**
 * A node in the state dependency root that observes other nodes, and can be observed itself.
 *
 * Computed values will update automatically if any observed value changes and if they are observed themselves.
 * If a computed value isn't actively used by another observer, but is inspect, it will compute lazily to return at least a consistent value.
 */
export declare class ComputedValue<T> implements IObservable, IComputedValue<T>, IDerivation {
    derivation: () => T;
    private scope;
    private compareStructural;
    isLazy: boolean;
    isComputing: boolean;
    staleObservers: IDerivation[];
    observers: SimpleSet<IDerivation>;
    observing: any[];
    diffValue: number;
    runId: number;
    lastAccessedBy: number;
    unboundDepsCount: number;
    __mapid: string;
    dependencyChangeCount: number;
    dependencyStaleCount: number;
    protected value: T;
    name: string;
    /**
     * Create a new computed value based on a function expression.
     *
     * The `name` property is for debug purposes only.
     *
     * The `compareStructural` property indicates whether the return values should be compared structurally.
     * Normally, a computed value will not notify an upstream observer if a newly produced value is strictly equal to the previously produced value.
     * However, enabling compareStructural can be convienent if you always produce an new aggregated object and don't want to notify observers if it is structurally the same.
     * This is useful for working with vectors, mouse coordinates etc.
     */
    constructor(derivation: () => T, scope: Object, compareStructural: boolean, name: string);
    peek(): any;
    onBecomeUnobserved(): void;
    onDependenciesReady(): boolean;
    /**
     * Returns the current value of this computed value.
     * Will evaluate it's computation first if needed.
     */
    get(): T;
    set(_: T): void;
    private trackAndCompute();
    observe(listener: (newValue: T, oldValue: T) => void, fireImmediately?: boolean): Lambda;
    toJSON(): T;
    toString(): string;
    whyRun(): string;
}
export declare enum RunReason {
    PEEK = 0,
    INVALIDATED = 1,
    REQUIRED = 2,
    NOT_RUNNING = 3,
}
export declare const runReasonTexts: {};
