/// <reference path="../typings/tsd.d.ts"/>

import fs = require('fs');
import path = require('path');
import AtomTsdView = require('./atom-tsd-view');
import CommandOutputView = require('./out-view');
import child_process = require('child_process');

import {CompositeDisposable} from 'atom';

class Tsd {
    public static install(out: (line: string) => void, path: string, query: string) {
        var cmd = child_process.spawn('tsd', ['query', query, '--action', 'install', '--save', '--resolve'], {cwd: path});

        cmd.stdout.on('data', (data) => {
            console.log('tsd stdout: ' + data);
            if (data.toString().match(/\- [^\n]+\/[^\n]+\.d\.ts/ig)) {
                var match = /\- ([^\n]+\/[^\n]+\.d\.ts)/ig.exec(data);
                out(match[1]);
            }
        });

        cmd.stderr.on('data ', function (data) {
            console.log('tsd stderr: ' + data);
        });

        cmd.on('close', function (code) {
            console.log('tsd child process exited with code ' + code);
        });
    }
}

class AtomTsd {
    atomTsdView: any;
    outView: any;
    modalPanel: any;
    subscriptions: EventKit.CompositeDisposable;
    private _items: { displayName: string; name: string; }[] = [];

    constructor() {
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
        return this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:install', () => this.install()));
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

    public install() {
        this.atomTsdView = new AtomTsdView(this._items, (def: any) => {
            console.log(def);
            var answer = atom.confirm({
                message: 'You really want to install the "' + def + '" file with all of its dependencies?',
                buttons: ["Yes", "Cancel"]
            });

            if (answer === 0) {
                if (this.outView) {
                    this.outView.detach();
                    this.outView.destroy();
                }

                this.outView = new CommandOutputView();
                this.outView.clean();
                this.outView.show();

                this.outView.setStatus('tsd:install...');

                Tsd.install((line) => { this.outView.addOutput(line); }, this.workingDirectory(), def);
            }
        });

        if (this._items.length > 0) {
            this.atomTsdView.toggle();
        }
    }
}

export = new AtomTsd;
