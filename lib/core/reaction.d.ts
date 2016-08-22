import { IDerivation } from "./derivation";
import { Lambda } from "../utils/utils";
import { SimpleSet } from "../utils/set";
export interface IReactionPublic {
    dispose: () => void;
}
export declare class Reaction implements IDerivation, IReactionPublic {
    name: string;
    private onInvalidate;
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
    isDisposed: boolean;
    _isScheduled: boolean;
    _isTrackPending: boolean;
    _isRunning: boolean;
    constructor(name: string, onInvalidate: () => void);
    onBecomeUnobserved(): void;
    onDependenciesReady(): boolean;
    schedule(): void;
    isScheduled(): boolean;
    /**
     * internal, use schedule() if you intend to kick off a reaction
     */
    runReaction(): void;
    track(fn: () => void): void;
    dispose(): void;
    getDisposer(): Lambda & {
        $mosbservable: Reaction;
    };
    toString(): string;
    whyRun(): string;
}
export declare function runReactions(): void;
