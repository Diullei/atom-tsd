/// <reference path="../typings/tsd.d.ts"/>

import fs = require('fs');
import path = require('path');

import {CompositeDisposable} from 'atom';

import AtomTsdView = require('./atom-tsd-view');
import CommandOutputView = require('./out-view');
import util = require('./util');
import Tsd = require('./tsd');

class AtomTsd {

    atomTsdView: any;
    outView: any;
    modalPanel: any;
    subscriptions: EventKit.CompositeDisposable;
    private _items: { displayName: string; name: string; }[] = [];

    constructor() {
        this.loadCatalog();
    }

    private loadCatalog() {
        var defs = require('./repository.json');

        defs.content.forEach((def) => {
            if(def.project == def.name) {
                this._items.push({displayName: def.project + ' - ' + def.info.projectUrl, name: def.name});
            } else {
                this._items.push({displayName: def.name + ' (' + def.project + ') - ' + def.info.projectUrl, name: def.name});
            }
        });
    }

    public activate(state: any) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:install', () => this.install()));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:reinstall', () => this.reinstall()));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:update', () => this.update()));
    }

    public deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.atomTsdView.destroy();
    }

    public serialize() {
        return {
            atomTsdViewState: this.atomTsdView.serialize()
        };
    }

    homeDirectory() {
        return process.env['HOME'] || process.env['USERPROFILE'] || '/';
    }

    workingDirectory() {
        var activePath, editor, ref, relative;

        editor = atom.workspace.getActiveTextEditor();
        activePath = editor != null ? editor.getPath() : void 0;
        relative = atom.project.relativizePath(activePath);

        if (activePath != null) {
            return relative[0] || path.dirname(activePath);
        } else {
            return ((ref = atom.project.getPaths()) != null ? ref[0] : void 0) || this.homeDirectory();
        }
    }

    public tsdIsMissing() {
        var answer = atom.confirm({
            message: 'TSD: It seems that you do not have installed TSD :(\n\nPlease install with:\n\n    npm install -g tsd',
            buttons: ['Ok']
        });
    }

    public reinstall() {
        var answer = atom.confirm({
            message: 'TSD: You really want to reinstall the typings?',
            buttons: ["Yes", "Cancel"]
        });

        if (answer === 0) {
            if (this.outView) {
                this.outView.detach();
            }

            this.outView = new CommandOutputView();
            this.outView.clean();
            this.outView.show();

            var waitMessage = util.cycleMessage('reinstalling', (msg: string) => {
                this.outView.setStatus(msg);
            });

            Tsd.update((line) => {
                if (line != '--finish--') {

                    if (line === '--missing-tsd--') {
                        waitMessage.cancel();
                        this.outView.close();
                        this.tsdIsMissing();
                    } else {
                        this.outView.addOutput(line);
                    }
                } else {
                    waitMessage.cancel();
                    this.outView.setStatus('All types have been reinstalled!');
                    this.outView.showCloseButton();
                }
            }, this.workingDirectory());
        }
    }

    public update() {
        var answer = atom.confirm({
            message: 'TSD: You really want to update the typings?',
            buttons: ["Yes", "Cancel"]
        });

        if (answer === 0) {
            if (this.outView) {
                this.outView.detach();
            }

            this.outView = new CommandOutputView();
            this.outView.clean();
            this.outView.show();

            var waitMessage = util.cycleMessage('updating', (msg: string) => {
                this.outView.setStatus(msg);
            });

            Tsd.update((line) => {
                if (line != '--finish--') {
                    if (line === '--missing-tsd--') {
                        waitMessage.cancel();
                        this.outView.close();
                        this.tsdIsMissing();
                    } else {
                        this.outView.addOutput(line);
                    }
                } else {
                    waitMessage.cancel();
                    this.outView.setStatus('All types have been updated!');
                    this.outView.showCloseButton();
                }
            }, this.workingDirectory());
        }
    }

    public install() {
        this.atomTsdView = new AtomTsdView(this._items, (def: any) => {
            var answer = atom.confirm({
                message: 'TSD: You really want to install the "' + def + '" typing with all of its dependencies?',
                buttons: ["Yes", "Cancel"]
            });

            if (answer === 0) {
                if (this.outView) {
                    this.outView.detach();
                }

                this.outView = new CommandOutputView();
                this.outView.clean();
                this.outView.show();

                var waitMessage = util.cycleMessage('installing', (msg: string) => {
                    this.outView.setStatus(msg);
                });

                Tsd.install((line) => {
                    if (line != '--finish--') {
                        if (line === '--missing-tsd--') {
                            waitMessage.cancel();
                            this.outView.close();
                            this.tsdIsMissing();
                        } else {
                            this.outView.addOutput(line);
                        }
                    } else {
                        waitMessage.cancel();
                        this.outView.setStatus('All types have been installed!');
                        this.outView.showCloseButton();
                    }
                }, this.workingDirectory(), def);
            }
        });

        if (this._items.length > 0) {
            this.atomTsdView.toggle();
        }
    }
}

export = new AtomTsd;
