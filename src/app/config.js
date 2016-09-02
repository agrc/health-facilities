/* jshint maxlen:false */
define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/config'
], function (
    has,
    xhr,

    esriConfig
) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('basemaps.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');
    // esriConfig.defaults.io.corsEnabledServers.push('192.168.230.138');

    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '1.0.0',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        urls: {
            facilities: 'http://192.168.230.152/arcgis/rest/services/HealthFacilities/MapServer/0',
            download: 'http://192.168.230.152/arcgis/rest/services/CreateCsv/GPServer/Download'
        },
        parameterNames: {
            output: 'output' // download service
        },
        fieldNames: {
            facType: 'TYPE', // Health facilities type
            facSubtype: 'FACTYPE' // Health facilities subtype
        },
        featureClassNames: {
            counties: 'SGID10.Boundaries.Counties',
            municipalities: 'SGID10.Boundaries.Municipalities',
            landOwnership: 'SGID10.Cadastre.LandOwnership',
            nationalGrid: 'SGID10.Indices.NationalGrid'
        },

        filters: [
            {
                name: 'AMBULATORY SURGICAL CENTER',
                queryValue: 'AMBULATORY SURGICAL CENTER',
                children: [
                    {
                        name: 'MEDICARE CERTIFIED',
                        queryValue: '151'},
                    {
                        name: 'PRIVATE PAY',
                        queryValue: '15A'}]
            },
            {
                name: 'ASSISTED LIVING',
                queryValue: 'ASSISTED LIVING FACILITY',
                children: [
                    {
                        name: 'TYPE I',
                        queryValue: '02A'},
                    {
                        name: 'TYPE II',
                        queryValue: '02B'}]
            },
            {
                name: 'END STAGE RENAL DISEASE',
                queryValue: '091',
                children: []
            },
            {
                name: 'HOME HEALTH AGENCY',
                queryValue: 'HOME HEALTH AGENCY',
                children: [
                    {
                        name: 'MEDICARE CERTIFIED',
                        queryValue: '051'},
                    {
                        name: 'MEDICAID CERTIFIED',
                        queryValue: '052'},
                    {
                        name: 'PRIVATE PAY',
                        queryValue: '05B'}]
            },
            {
                name: 'PERSONAL CARE AGENCY',
                queryValue: 'S71',
                children: []
            },
            {
                name: 'HOSPICE',
                queryValue: 'HOSPICE',
                children: [
                    {
                        name: 'MEDICARE CERTIFIED',
                        queryValue: '161'},
                    {
                        name: 'PRIVATE PAY',
                        queryValue: '16A'}]
            },
            {
                name: 'HOSPITAL',
                queryValue: 'HOSPITAL',
                children: [
                    {
                        name: 'ACUTE (General)',
                        queryValue: '011'},
                    {
                        name: 'PSYCHIATRIC',
                        queryValue: '012'},
                    {
                        name: 'REHABILITATION',
                        queryValue: '013'},
                    {
                        name: 'CRITICAL ACCESS',
                        queryValue: '014'},
                    {
                        name: 'LONG TERM CARE',
                        queryValue: '015'},
                    {
                        name: 'CHILDRENS',
                        queryValue: '016'}]
            },
            {
                name: 'NURSING HOME',
                queryValue: 'NURSING HOME',
                children: [
                    {
                        name: 'SMALL HEALTH CARE - PRIVATE PAY (2 - 3 RESIDENTS)',
                        queryValue: 'S11'},
                    {
                        name: 'NURSING',
                        queryValue: '024'},
                    {
                        name: 'SKILLED NURSING / NURSING - MEDICARE/MEDICAID',
                        queryValue: '021'},
                    {
                        name: 'SKILLED NURSING - MEDICARE',
                        queryValue: '22'},
                    {
                        name: 'SKILLED NURSING',
                        queryValue: '023'},
                    {
                        name: 'NURSING HOME - PRIVATE PAY',
                        queryValue: '02C'},
                    {
                        name: 'INTERMEDIATE CARE FOR THE INTELLECTUALLY DISABLED',
                        queryValue: '111'}]
            },
            {
                name: 'BIRTHING CENTER',
                queryValue: 'S41',
                children: []
            },
            {
                name: 'PSYCHIATRIC RESIDENTIAL TREATMENT',
                queryValue: '061',
                children: []
            },
            {
                name: 'PORTABLE X-RAY SUPPLIERS',
                queryValue: '071',
                children: []
            },
            {
                name: 'OUTPATIENT PHYSICAL THERAPY/SPEECH PATHOLOGY SERVICES',
                queryValue: '081',
                children: []
            },
            {
                name: 'RURAL HEALTH CLINICS',
                queryValue: '121',
                children: []
            },
            {
                name: 'COMPREHENSIVE OUTPATIENT REHABILITATION',
                queryValue: '141',
                children: []
            },
            {
                name: 'ABORTION CLINIC',
                queryValue: 'S51',
                children: []
            }
        ]
    };

    if (has('agrc-build') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-F8424FE7767822';  // make a new one
        window.AGRC.quadWord = 'career-exhibit-panel-stadium';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.quadWord = 'opera-event-little-pinball';
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            window.AGRC.quadWord = secrets.quadWord;
            window.AGRC.apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    return window.AGRC;
});
