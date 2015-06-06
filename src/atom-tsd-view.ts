// ref: https://github.com/david-driscoll/atom-yeoman/

/// <reference path="../typings/tsd.d.ts"/>

import spacePen = require("atom-space-pen-views");

import util = require('./util');

var _ = require('lodash');

class AtomTsdView extends spacePen.SelectListView {
    element: HTMLDivElement;

    private panel: any;
    private previouslyFocusedElement: Node;
    private eventElement: any;
    public message: JQuery;

    constructor(private _items: { displayName: string; name: string; }[], private invokeNext: (result: any) => void) {
        super();
    }

    public static content() {
        return util.toHtmlEl('<div><p></p></div>', this, () => {
            /*TS issue*/
            (<any>spacePen.SelectListView).content.call(this);
        });
    }

    public keyBindings = null;

    public initialize() {
        // TS 1.4 issue
        (<any>spacePen.SelectListView).prototype.initialize.call(this);
        this.addClass('generator');
    }

    public getFilterKey() {
        return 'displayName';
    }

    public cancelled() {
        return this.hide();
    }

    public toggle() {
        if (this.panel && this.panel.isVisible()) {
            this.cancel();
        } else {
            this.show();
        }
    }

    public show() {
        if (this.panel == null) {
            this.panel = (<any>atom.workspace).addModalPanel({ item: this });
        }
        this.panel.show();
        this.storeFocusedElement();

        if (this.previouslyFocusedElement[0] && this.previouslyFocusedElement[0] !== document.body) {
            this.eventElement = this.previouslyFocusedElement[0];
        } else {
            this.eventElement = (<any>atom).views.getView(atom.workspace);
        }


        this.keyBindings = (<any>atom.keymaps).findKeyBindings({
            target: this.eventElement
        });

        // infer the generator somehow? based on the project information?  store in the project system??
        var commands = _.sortBy(this._items, 'displayName');
        this.setItems(commands);
        this.focusFilterEditor();
    }

    public hide() {
        this.panel && this.panel.hide();
        this.panel.destroy();
        this.panel = null;
    }

    public viewForItem(item: { displayName: string; name: string; }) {
        return spacePen.$$(function() {
            return util.toHtmlEl(`
                <li class="event" data-event-name="${item.name}">
                    <span title="${item.name}">
                        ${item.displayName}
                    </span>
                </li>`, this);
        });
    }

    public confirmed(item?: any): spacePen.View {
        this.cancel();

        if (this.invokeNext) {
            this.invokeNext(item.name);
        }

        return null;
    }
}

export = AtomTsdView;
