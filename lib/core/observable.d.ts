import { IDerivation } from "./derivation";
import { SimpleSet } from "../utils/set";
export interface IDepTreeNode {
    name: string;
    observers?: SimpleSet<IDerivation>;
    observing?: IObservable[];
}
export interface IObservable extends IDepTreeNode {
    diffValue: number;
    /**
     * Id of the derivation *run* that last accesed this observable.
     * If this id equals the *run* id of the current derivation,
     * the dependency is already established
     */
    lastAccessedBy: number;
    staleObservers: IDerivation[];
    observers: SimpleSet<IDerivation>;
    onBecomeUnobserved(): any;
}
export declare function addObserver(observable: IObservable, node: IDerivation): void;
export declare function removeObserver(observable: IObservable, node: IDerivation): void;
export declare function reportObserved(observable: IObservable): void;
export declare function propagateStaleness(observable: IObservable | IDerivation): void;
export declare function propagateReadiness(observable: IObservable | IDerivation, valueDidActuallyChange: boolean): void;
