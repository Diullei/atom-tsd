/// <reference path="../typings/tsd.d.ts"/>

import spacePen = require("atom-space-pen-views");

class CommandOutputView extends spacePen.View {
    element: HTMLDivElement;
    private panel: any;

    public static content() {
        return this.div({
                "class": 'command-runner'
            }, () => {
                return () => {
                    this.header({
                        "class": 'panel-heading'
                    }, () => {
                        this.span('TSD: ');
                        this.span({
                            "class": 'status-name',
                            outlet: 'header'
                        });
                        this.div({
                            "class": 'pull-right',
                            'style': "width22px; display:inline-block",
                            outlet: 'header'
                        }, () => {
                            this.span({
                                "class": 'heading-fold icon-remove-close',
                                'style': "cursor: pointer; display: none",
                                'click': "close",
                                outlet: 'div'
                            });
                        });
                    });
                    this.div({
                        "class": 'panel-body',
                        outlet: 'outputContainer'
                    }, function() {
                        this.pre({
                            "class": 'command-output',
                            outlet: 'output'
                        });
                    });
                };
            });
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

    public showCloseButton() {
        var el = <HTMLElement>this.element.querySelector('.icon-remove-close');
        el.style.display = 'block';
    }

    addOutput(data) {
        var span = document.createElement('span');

        var line = <string>data;

        if(line.trim().indexOf('<') != 0) {
            line = '<span><image style="width:20px; padding-bottom: 3px;" src="atom://atom-tsd/styles/min-dt-logo.jpg"/>&nbsp;' + line + '</span>';
        }

        span.innerHTML = line;

        this.element.querySelector('.command-output').appendChild(span);
        this.element.querySelector('.command-output').appendChild(document.createElement('br'));
    }
}

export = CommandOutputView;
