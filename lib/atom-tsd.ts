/// <reference path="../typings/tsd.d.ts"/>

import util = require('util');
import fs = require('fs');
import path = require('path');
import AtomTsdView = require('./atom-tsd-view');
import {CompositeDisposable} from 'atom';

import EventKit = require('event-kit');

import child_process = require('child_process');

class Tsd {
    public static install(path: string, query: string) {
        var cmd = child_process.spawn('tsd', ['query', query, '--action', 'install', '--save', '--resolve'], {cwd: path});

        cmd.stdout.on('data', (data) => {
            console.log('stdout: ' + data);
        });

        cmd.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        cmd.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    }
}

class AtomTsd {
    atomTsdView: any;
    modalPanel: any;
    subscriptions: EventKit.CompositeDisposable;

    public activate(state: any) {
        // this.atomTsdView = new AtomTsdView(state.atomTsdState);
        // this.modalPanel = (<any>atom.workspace).addModalPanel({item: this.atomTsdView.getElement(), visible: false});

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
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
        console.log('AtomTSD was toggled!');


        var list = [];

        var defs = require('./repository.json');

        defs.content.forEach((def) => {
            if(def.project == def.name) {
                list.push({displayName: def.project + ' - ' + def.info.projectUrl, name: def.name});
            } else {
                list.push({displayName: def.name + ' (' + def.project + ') - ' + def.info.projectUrl, name: def.name});
            }
        });

        this.atomTsdView = new AtomTsdView(list, (def: any) => {
            console.log(def);
            var answer = atom.confirm({
                message: 'You really want to install the "' + def + '" file with all of its dependencies?',
                buttons: ["Yes", "Cancel"]
            });

            console.log(answer);
            console.log(this.workingDirectory());

            Tsd.install(this.workingDirectory(), def);
        });

        if (list.length > 0) {
            this.atomTsdView.toggle();
        }
    }
}

export = new AtomTsd;
