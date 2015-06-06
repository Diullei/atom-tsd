interface IAtomTsdView {
    serialize(): void;
    destroy(): void;
    getElement(): HTMLDivElement;
}


declare module 'loophole' {
    export var allowUnsafeEval: any;
    export var allowUnsafeNewFunction: any;
}
