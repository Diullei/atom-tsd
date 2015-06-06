// ref: https://github.com/david-driscoll/atom-yeoman/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typings/tsd.d.ts"/>
var spacePen = require("atom-space-pen-views");
var _ = require('lodash');
var AtomTsdView = (function (_super) {
    __extends(AtomTsdView, _super);
    function AtomTsdView(_items, invokeNext) {
        _super.call(this);
        this._items = _items;
        this.invokeNext = invokeNext;
        this.keyBindings = null;
    }
    AtomTsdView.content = function () {
        var _this = this;
        return this.div({}, function () {
            _this.p({
                outlet: 'message'
            }, '');
            spacePen.SelectListView.content.call(_this);
        });
    };
    AtomTsdView.prototype.initialize = function () {
        spacePen.SelectListView.prototype.initialize.call(this);
        this.addClass('generator');
    };
    AtomTsdView.prototype.getFilterKey = function () {
        return 'displayName';
    };
    AtomTsdView.prototype.cancelled = function () {
        return this.hide();
    };
    AtomTsdView.prototype.toggle = function () {
        if (this.panel && this.panel.isVisible()) {
            this.cancel();
        }
        else {
            this.show();
        }
    };
    AtomTsdView.prototype.show = function () {
        if (this.panel == null) {
            this.panel = atom.workspace.addModalPanel({ item: this });
        }
        this.panel.show();
        this.storeFocusedElement();
        if (this.previouslyFocusedElement[0] && this.previouslyFocusedElement[0] !== document.body) {
            this.eventElement = this.previouslyFocusedElement[0];
        }
        else {
            this.eventElement = atom.views.getView(atom.workspace);
        }
        this.keyBindings = atom.keymaps.findKeyBindings({
            target: this.eventElement
        });
        var commands = _.sortBy(this._items, 'displayName');
        this.setItems(commands);
        this.focusFilterEditor();
    };
    AtomTsdView.prototype.hide = function () {
        this.panel && this.panel.hide();
        this.panel.destroy();
        this.panel = null;
    };
    AtomTsdView.prototype.viewForItem = function (item) {
        var keyBindings = this.keyBindings;
        return spacePen.$$(function () {
            var _this = this;
            return this.li({
                'class': 'event',
                'data-event-name': item.name
            }, function () {
                return _this.span(item.displayName, {
                    title: item.name
                });
            });
        });
    };
    AtomTsdView.prototype.confirmed = function (item) {
        this.cancel();
        if (this.invokeNext) {
            this.invokeNext(item.name);
        }
        return null;
    };
    return AtomTsdView;
})(spacePen.SelectListView);
module.exports = AtomTsdView;
//# sourceMappingURL=atom-tsd-view.js.map