/* eslint-disable no-unused-vars */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/packages',
                'app/run',
                'app/App',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/shape'
            ],
            targetStylesheet: 'app/resources/App.css',
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        },
        'ijit/widgets/authentication/UserAdmin': {
            exclude: ['dojo/dojo']
        }
    },
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api': 0,
        'dojo-log-api': 0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates': 0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader': 0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory': 0,

        // We aren’t loading tests in production
        'dojo-test-sniff': 0
    },
    plugins: {
        'xstyle/css': 'xstyle/build/amd-css'
    },
    packages: [{
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
            // don't bother with .hidden, tests, min, src, and templates
            ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates|dist)/]
        ]
    }, 'dgrid1', 'dstore', 'xstyle'],
    map: {
        ladda: {
            spin: 'ladda/dist/spin'
        },
        sherlock: {
            spinjs: 'spin'
        }
    },
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'layer-selector', 'sherlock']
    }
};
