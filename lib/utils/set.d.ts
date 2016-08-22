export interface ISetEntry {
    __mapid: string;
}
export declare class SimpleSet<T extends ISetEntry> {
    size: number;
    data: {};
    length: number;
    asArray(): T[];
    /**
     * @param {T} value
     * @returns {number} new length
     */
    add(value: T): void;
    remove(value: T): void;
}
