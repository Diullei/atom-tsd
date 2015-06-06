/// <reference path="../typings/tsd.d.ts"/>
var path = require('path');
var AtomTsdView = require('./atom-tsd-view');
var CommandOutputView = require('./out-view');
var child_process = require('child_process');
var atom_1 = require('atom');
var Tsd = (function () {
    function Tsd() {
    }
    Tsd.install = function (out, path, query) {
        this.execTsdCommand(out, path, ['query', query, '--action', 'install', '--save', '--resolve']);
    };
    Tsd.reinstall = function (out, path) {
        this.execTsdCommand(out, path, ['reinstall', '--save', '--overwrite']);
    };
    Tsd.update = function (out, path) {
        this.execTsdCommand(out, path, ['update', '--save', '--overwrite']);
    };
    Tsd.execTsdCommand = function (out, path, args) {
        var tsdMissing = false;
        var isWin = /^win/.test(process.platform);
        var cmd = child_process.spawn((isWin ? 'tsd.cmd' : 'tsd'), args, { cwd: path });
        cmd.on('error', function (err) {
            if (err.code === 'ENOENT' && err.syscall === 'spawn tsd' && err.path === 'tsd') {
                tsdMissing = true;
                out('--missing-tsd--');
            }
            else {
                throw err;
            }
        });
        cmd.stdout.on('data', function (data) {
            if (data.toString().match(/\- [^\n]+\/[^\n]+\.d\.ts/ig)) {
                var regex = /\- ([^\n]+\/[^\n]+\.d\.ts)/igm;
                var match = regex.exec(data);
                while (match != null) {
                    out(match[1]);
                    match = regex.exec(data);
                }
            }
        });
        cmd.stderr.on('data ', function (data) {
            console.log('tsd stderr: ' + data);
        });
        cmd.on('close', function (code) {
            console.log('tsd child process exited with code ' + code);
            if (!tsdMissing) {
                out('--finish--');
            }
        });
    };
    return Tsd;
})();
var AtomTsd = (function () {
    function AtomTsd() {
        var _this = this;
        this._items = [];
        var defs = require('./repository.json');
        defs.content.forEach(function (def) {
            if (def.project == def.name) {
                _this._items.push({ displayName: def.project + ' - ' + def.info.projectUrl, name: def.name });
            }
            else {
                _this._items.push({ displayName: def.name + ' (' + def.project + ') - ' + def.info.projectUrl, name: def.name });
            }
        });
    }
    AtomTsd.prototype.activate = function (state) {
        var _this = this;
        this.subscriptions = new atom_1.CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:install', function () { return _this.install(); }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:reinstall', function () { return _this.reinstall(); }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'tsd:update', function () { return _this.update(); }));
    };
    AtomTsd.prototype.deactivate = function () {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.atomTsdView.destroy();
    };
    AtomTsd.prototype.serialize = function () {
        return {
            atomTsdViewState: this.atomTsdView.serialize()
        };
    };
    AtomTsd.prototype.homeDirectory = function () {
        return process.env['HOME'] || process.env['USERPROFILE'] || '/';
    };
    AtomTsd.prototype.workingDirectory = function () {
        var activePath, editor, ref, relative;
        editor = atom.workspace.getActiveTextEditor();
        activePath = editor != null ? editor.getPath() : void 0;
        relative = atom.project.relativizePath(activePath);
        if (activePath != null) {
            return relative[0] || path.dirname(activePath);
        }
        else {
            return ((ref = atom.project.getPaths()) != null ? ref[0] : void 0) || this.homeDirectory();
        }
    };
    AtomTsd.prototype.tsdIdMissing = function () {
        var answer = atom.confirm({
            message: 'TSD: It seems that you do not have installed TSD :(\n\nPlease install with:\n\n    npm install -g tsd',
            buttons: ['Ok']
        });
    };
    AtomTsd.prototype.reinstall = function () {
        var _this = this;
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
            var cycle = [
                'reinstalling.',
                'reinstalling..',
                'reinstalling...',
                'reinstalling....',
                'reinstalling.....'
            ];
            var cycleIndex = 0;
            var fnWaiting = function () {
                if (cycleIndex > 4) {
                    cycleIndex = 0;
                }
                _this.outView.setStatus(cycle[cycleIndex++]);
            };
            var id = window.setInterval(fnWaiting, 500);
            Tsd.update(function (line) {
                if (line != '--finish--') {
                    if (line === '--missing-tsd--') {
                        window.clearInterval(id);
                        _this.outView.close();
                        _this.tsdIdMissing();
                    }
                    else {
                        _this.outView.addOutput(line);
                    }
                }
                else {
                    window.clearInterval(id);
                    _this.outView.setStatus('All types have been reinstalled!');
                    _this.outView.showCloseButton();
                }
            }, this.workingDirectory());
        }
    };
    AtomTsd.prototype.update = function () {
        var _this = this;
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
            var cycle = [
                'updating.',
                'updating..',
                'updating...',
                'updating....',
                'updating.....'
            ];
            var cycleIndex = 0;
            var fnWaiting = function () {
                if (cycleIndex > 4) {
                    cycleIndex = 0;
                }
                _this.outView.setStatus(cycle[cycleIndex++]);
            };
            var id = window.setInterval(fnWaiting, 500);
            Tsd.update(function (line) {
                if (line != '--finish--') {
                    if (line === '--missing-tsd--') {
                        window.clearInterval(id);
                        _this.outView.close();
                        _this.tsdIdMissing();
                    }
                    else {
                        _this.outView.addOutput(line);
                    }
                }
                else {
                    window.clearInterval(id);
                    _this.outView.setStatus('All types have been updated!');
                    _this.outView.showCloseButton();
                }
            }, this.workingDirectory());
        }
    };
    AtomTsd.prototype.install = function () {
        var _this = this;
        this.atomTsdView = new AtomTsdView(this._items, function (def) {
            var answer = atom.confirm({
                message: 'TSD: You really want to install the "' + def + '" typing with all of its dependencies?',
                buttons: ["Yes", "Cancel"]
            });
            if (answer === 0) {
                if (_this.outView) {
                    _this.outView.detach();
                }
                _this.outView = new CommandOutputView();
                _this.outView.clean();
                _this.outView.show();
                var cycle = [
                    'installing.',
                    'installing..',
                    'installing...',
                    'installing....',
                    'installing.....'
                ];
                var cycleIndex = 0;
                var fnWaiting = function () {
                    if (cycleIndex > 4) {
                        cycleIndex = 0;
                    }
                    _this.outView.setStatus(cycle[cycleIndex++]);
                };
                var id = window.setInterval(fnWaiting, 500);
                Tsd.install(function (line) {
                    if (line != '--finish--') {
                        if (line === '--missing-tsd--') {
                            window.clearInterval(id);
                            _this.outView.close();
                            _this.tsdIdMissing();
                        }
                        else {
                            _this.outView.addOutput(line);
                        }
                    }
                    else {
                        window.clearInterval(id);
                        _this.outView.setStatus('All types have been installed!');
                        _this.outView.showCloseButton();
                    }
                }, _this.workingDirectory(), def);
            }
        });
        if (this._items.length > 0) {
            this.atomTsdView.toggle();
        }
    };
    return AtomTsd;
})();
module.exports = new AtomTsd;
