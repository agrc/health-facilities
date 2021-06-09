/* jshint camelcase:false */
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsAppFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html'
    ];
    var gruntFile = 'GruntFile.js';
    var internFile = 'tests/intern.js';
    var jsFiles = [jsAppFiles, gruntFile, internFile, 'profiles/**/*.js'];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];
    var deployFiles = [
        '**',
        '!**/*.uncompressed.js',
        '!**/*consoleStripped.js',
        '!**/bootstrap/less/**',
        '!**/bootstrap/test-infra/**',
        '!**/tests/**',
        '!build-report.txt',
        '!components-jasmine/**',
        '!favico.js/**',
        '!jasmine-favicon-reporter/**',
        '!jasmine-jsreporter/**',
        '!stubmodule/**',
        '!util/**'
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat('src/ChangeLog.html'),
                push: false
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy']
        },
        compress: {
            main: {
                options: {
                    archive: 'deploy/deploy.zip'
                },
                files: [
                    {
                        src: deployFiles,
                        dest: './',
                        cwd: 'dist/',
                        expand: true
                    }
                ]
            }
        },
        connect: {
            main: {
                options: {
                    port: 80,
                    base: 'src'
                }
            }
            // uses_defaults: {port: 80}
        },
        copy: {
            main: {
                files: [{ expand: true,
                    cwd: 'src/',
                    src: ['*.html'],
                    dest: 'dist/' }]
            }
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: [
                        'profiles/prod.build.profile.js',
                        'profiles/build.profile.js'
                    ] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: [
                        'profiles/stage.build.profile.js',
                        'profiles/build.profile.js'
                    ] // Profile for build
                }
            },
            options: {
                // You can also specify options to be used in all your tasks
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                requires: ['src/app/packages.js', 'src/app/run.js'], // Optional: Module to require for the
                // build (Default: nothing)
                basePath: './src'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc',
                fix: true
            },
            main: {
                src: jsFiles
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        // exclude tests because some images in dojox throw errors
                        src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                        dest: 'src/'
                    }
                ]
            }
        },
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/packages.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        parallel: {
            options: {
                grunt: true
            },
            assets: {
                tasks: ['eslint:main', 'stylus', 'jasmine:main:build']
            },
            buildAssets: {
                tasks: ['eslint:main', 'clean:build', 'newer:imagemin:main', 'stylus']
            }
        },
        processhtml: {
            options: {},
            main: {
                files: {
                    'dist/index.html': ['src/index.html'],
                    'dist/user_admin.html': ['src/user_admin.html']
                }
            }
        },
        stylus: {
            main: {
                options: {
                    compress: false
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['app/**/*.styl'],
                        dest: 'src/',
                        ext: '.css'
                    }
                ]
            }
        },
        verbosity: {
            main: {
                options: { mode: 'normal' },
                tasks: ['saucelabs-jasmine']
            }
        },
        watch: {
            eslint: {
                files: jsFiles,
                tasks: ['newer:eslint:main', 'jasmine:main:build']
            },
            src: {
                files: jsFiles.concat(otherFiles),
                options: { livereload: true }
            },
            stylus: {
                files: 'src/app/**/*.styl',
                tasks: ['newer:stylus']
            }
        }
    });

    grunt.registerTask('default', ['parallel:assets', 'connect', 'watch']);
    grunt.registerTask('build-prod', [
        'parallel:buildAssets',
        'dojo:prod',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);
    grunt.registerTask('build-stage', [
        'parallel:buildAssets',
        'dojo:stage',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);
    grunt.registerTask('sauce', [
        'jasmine:main:build',
        'connect',
        'saucelabs-jasmine'
    ]);
    grunt.registerTask('travis', [
        'verbosity:main',
        'eslint:main',
        'sauce',
        'build-prod'
    ]);
};
