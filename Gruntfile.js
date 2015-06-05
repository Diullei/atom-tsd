'use strict';
module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        ts: {
            build: {
                src: ['lib/**/*.ts', 'spec/**/*.ts'],
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
                src: ['lib/**/*.ts', 'spec/**/*.ts']
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
        }
    });

    grunt.registerTask('default', ['ts:build']);
};
