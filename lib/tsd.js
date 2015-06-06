var child_process = require('child_process');
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
module.exports = Tsd;
//# sourceMappingURL=tsd.js.map