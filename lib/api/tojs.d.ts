/**
    * Basically, a deep clone, so that no reactive property will exist anymore.
    */
export declare function toJS(source: any, detectCycles?: boolean, __alreadySeen?: [any, any][]): any;
export declare function toJSON(source: any, detectCycles?: boolean, __alreadySeen?: [any, any][]): any;
