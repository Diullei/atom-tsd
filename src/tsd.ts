import child_process = require('child_process');

class Tsd {

    public static install(out: (line: string) => void, path: string, query: string) {
        this.execTsdCommand(out, path, ['query', query, '--action', 'install', '--save', '--resolve']);
    }

    public static reinstall(out: (line: string) => void, path: string) {
        this.execTsdCommand(out, path, ['reinstall', '--save', '--overwrite']);
    }

    public static update(out: (line: string) => void, path: string) {
        this.execTsdCommand(out, path, ['update', '--save', '--overwrite']);
    }

    public static execTsdCommand(out: (line: string) => void, path: string, args: string[]) {
        var tsdMissing = false;
        var isWin = /^win/.test(process.platform);

        var cmd = child_process.spawn((isWin ? 'tsd.cmd' : 'tsd'), args, {cwd: path});

        cmd.on('error', function(err) {
            if (err.code === 'ENOENT' && err.syscall === 'spawn tsd' && err.path === 'tsd') {
                tsdMissing = true;
                out('--missing-tsd--');
            } else {
                throw err;
            }
        });

        cmd.stdout.on('data', (data) => {
            // console.log('tsd stdout: ' + data);
            if (data.toString().match(/\- [^\n]+\/[^\n]+\.d\.ts/ig)) {
                var regex = /\- ([^\n]+\/[^\n]+\.d\.ts)/igm;
                var match = regex.exec(data);
                while(match != null) {
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
    }
}

export = Tsd;
