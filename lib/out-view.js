/// <reference path="../typings/tsd.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var spacePen = require("atom-space-pen-views");
var util = require('./util');
var CommandOutputView = (function (_super) {
    __extends(CommandOutputView, _super);
    function CommandOutputView() {
        _super.apply(this, arguments);
    }
    CommandOutputView.content = function () {
        return util.toHtmlEl("\n            <div class=\"command-runner\">\n                <header class=\"panel-heading\">\n                    <span>TSD: </span>\n                    <span class=\"status-name\"></span>\n                    <div class=\"pull-right\"\n                         style=\"width: 22px; display:inline-block\">\n                        <span class=\"heading-fold icon-remove-close\"\n                              style=\"cursor: pointer; display: none\"\n                              click=\"close\"></span>\n                    </div>\n                </header>\n                <div class=\"panel-body\">\n                    <pre class=\"command-output\"></pre>\n                </div>\n            </div>", this);
    };
    CommandOutputView.prototype.initialize = function () {
        this.panel = atom.workspace.addBottomPanel({
            item: this
        });
    };
    CommandOutputView.prototype.show = function () {
        this.panel.show();
    };
    CommandOutputView.prototype.close = function () {
        this.clean();
        this.cancelled();
    };
    CommandOutputView.prototype.cancelled = function () {
        return this.hide();
    };
    CommandOutputView.prototype.clean = function () {
        var el = this.element.querySelector('.command-output');
        el.innerHTML = '';
    };
    CommandOutputView.prototype.setStatus = function (status) {
        var el = this.element.querySelector('.status-name');
        el.textContent = status;
    };
    CommandOutputView.prototype.showCloseButton = function () {
        var el = this.element.querySelector('.icon-remove-close');
        el.style.display = 'block';
    };
    CommandOutputView.prototype.addOutput = function (data) {
        var span = document.createElement('span');
        var line = data;
        if (line.trim().indexOf('<') != 0) {
            line = '<span><image style="width:20px; padding-bottom: 3px;" src="atom://atom-tsd/styles/min-dt-logo.jpg"/>&nbsp;' + line + '</span>';
        }
        span.innerHTML = line;
        this.element.querySelector('.command-output').appendChild(span);
        this.element.querySelector('.command-output').appendChild(document.createElement('br'));
    };
    return CommandOutputView;
})(spacePen.View);
module.exports = CommandOutputView;
//# sourceMappingURL=out-view.js.map