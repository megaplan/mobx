/**
 * During a transaction no views are updated until the end of the transaction.
 * The transaction will be run synchronously nonetheless.
 * @param action a function that updates some reactive state
 * @returns any value that was returned by the 'action' parameter.
 */
export declare function transaction<T>(action: () => T, thisArg?: any, report?: boolean): T;
export declare function transactionStart<T>(name: string, thisArg?: any, report?: boolean): void;
export declare function transactionEnd<T>(report?: boolean): void;
