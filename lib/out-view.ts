/// <reference path="../typings/tsd.d.ts"/>

import spacePen = require("atom-space-pen-views");

class CommandOutputView extends spacePen.View {
    element: HTMLDivElement;
    private panel: any;

    public static content() {
        return (<any>this).div({
                "class": 'command-runner'
            }, (function(_this) {
                return function() {
                    _this.header({
                        "class": 'panel-heading'
                    }, function() {
                        _this.span('Status: ');
                        _this.span({
                            "class": 'status-name',
                            outlet: 'header'
                        });
                        _this.div({
                            "class": 'pull-right',
                            'style': "width22px; display:inline-block",
                            outlet: 'header'
                        }, function() {
                            _this.span({
                                "class": 'heading-fold icon-remove-close',
                                'style': "cursor: pointer",
                                'click': "close",
                                outlet: 'div'
                            });
                        });
                    });
                    _this.div({
                        "class": 'panel-body',
                        outlet: 'outputContainer'
                    }, function() {
                        _this.pre({
                            "class": 'command-output',
                            outlet: 'output'
                        });
                    });
                };
            })(this));
    }

    public initialize() {
        this.panel = atom.workspace.addBottomPanel({
            item: this
        });
    }

    show() {
        this.panel.show();
    }

    public close() {
        this.clean();
        this.cancelled();
    }

    public cancelled() {
        return this.hide();
    }

    clean() {
        var el = <HTMLElement>this.element.querySelector('.command-output');
        el.innerHTML = '';
    }

    public setStatus(status: string) {
        var el = <HTMLElement>this.element.querySelector('.status-name');
        el.textContent = status;
    }

    addOutput(data) {
        var span = document.createElement('span');

        var line = <string>data;

        if(line.trim().indexOf('<') != 0) {
            line = '<span>' + line + '</span>';
        }

        span.innerHTML = line;

        this.element.querySelector('.command-output').appendChild(span);
        this.element.querySelector('.command-output').appendChild(document.createElement('br'));
    }
}

export = CommandOutputView;
