'use strict';
module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        ts: {
            build: {
                src: ['src/**/*.ts', 'spec/**/*.ts'],
                options: {
                    target: 'es3',
                    module: 'commonjs',
                    sourceMap: true,
                    declaration: false,
                    removeComments: true,
                    compiler: './node_modules/typescript/bin/tsc'
                },
            }
        },
        tslint: {
            options: {
                configuration: grunt.file.readJSON('tslintrc.json')
            },
            all: {
                src: ['src/**/*.ts', 'spec/**/*.ts']
            }
        },
        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec'
            },
            all: ['spec/']
        },
        clean: {
            lib: ['lib']
        },
        copy: {
            lib: {
                files: [
                    {expand: true, cwd: 'src/', src: ['**/*.js', 'repository.json'], dest: 'lib/'}
                ]
            }
        }
    });

    grunt.registerTask('default', ['ts:build', 'clean:lib', 'copy:lib']);
};
