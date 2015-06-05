/// <reference path="../atom/atom.d.ts" />

declare module AtomEventKit {
    interface ICompositeDisposable {
        dispose(): void;
        add(disposable: any): void;
        remove(disposable: any): void;
        clear();
    }
}

declare module "atom" {
    class CompositeDisposable implements AtomEventKit.ICompositeDisposable {
        dispose(): void;
        add(disposable: any): void;
        remove(disposable: any): void;
        clear();
    }
}
