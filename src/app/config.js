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

        // exportWebMapUrl: String
        //      print task url
        exportWebMapUrl: 'http://mapserv.utah.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',

        urls: {
            facilities: 'http://192.168.230.147/arcgis/rest/services/HealthFacalities/MapServer/0'
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
                        name: 'AMBULATORY SURGICAL CENTER - MEDICARE CERTIFIED',
                        queryValue: '151'},
                    {
                        name: 'AMBULATORY SURGICAL CENTER - PRIVATE PAY',
                        queryValue: '15A'}]
            },
            {
                name: 'ASSISTED LIVING FACILITY',
                queryValue: 'ASSISTED LIVING FACILITY',
                children: [
                    {
                        name: 'ASSISTED LIVING - TYPE I',
                        queryValue: '02A'},
                    {
                        name: 'ASSISTED LIVING - TYPE II',
                        queryValue: '02B'}]
            },
            {
                name: 'END STAGE RENAL DISEASE FACILITIES',
                queryValue: 'END STAGE RENAL DISEASE FACILITIES',
                children: []
            },
            {
                name: 'HOME HEALTH AGENCY',
                queryValue: 'HOME HEALTH AGENCY',
                children: [
                    {
                        name: 'HOME HEALTH AGENCIES - MEDICARE CERTIFIED',
                        queryValue: '051'},
                    {
                        name: 'HOME HEALTH AGENCIES - MEDICAID CERTIFIED',
                        queryValue: '052'},
                    {
                        name: 'HOME HEALTH AGENCY - PRIVATE PAY',
                        queryValue: '05B'}]
            },
            {
                name: 'PERSONAL CARE AGENCY',
                queryValue: 'PERSONAL CARE AGENCY',
                children: []
            },
            {
                name: 'HOSPICE',
                queryValue: 'HOSPICE',
                children: [
                    {
                        name: 'HOSPICE - MEDICARE CERTIFIED',
                        queryValue: '161'},
                    {
                        name: 'HOSPICE - PRIVATE PAY',
                        queryValue: '16A'}]
            },
            {
                name: 'HOSPITAL',
                queryValue: 'HOSPITAL',
                children: [
                    {
                        name: 'ACUTE (General)',
                        queryValue: '11'},
                    {
                        name: 'PSYCHIATRIC',
                        queryValue: '12'},
                    {
                        name: 'REHABILITATION',
                        queryValue: '13'},
                    {
                        name: 'CRITICAL ACCESS HOSPITALS',
                        queryValue: '14'},
                    {
                        name: 'LONG TERM CARE HOSPITAL',
                        queryValue: '15'},
                    {
                        name: 'CHILDRENS',
                        queryValue: '16'}]
            },
            {
                name: 'NURSING HOME',
                queryValue: 'NURSING HOME',
                children: [
                    {
                        name: 'SMALL HEALTH CARE - PRIVATE PAY (2 - 3 RESIDENTS)',
                        queryValue: 'S11'},
                    {
                        name: 'NURSING FACILITY',
                        queryValue: '024'},
                    {
                        name: 'SKILLED NURSING FACILITY/NURSING FACILITY - MEDICARE/MEDICAID',
                        queryValue: '021'},
                    {
                        name: 'SKILLED NURSING FACILITY - MEDICARE',
                        queryValue: '22'},
                    {
                        name: 'SKILLED NURSING FACILITY',
                        queryValue: '023'},
                    {
                        name: 'NURSING HOME - PRIVATE PAY',
                        queryValue: '02C'},
                    {
                        name: 'INTERMEDIATE CARE FACILITY FOR THE INTELLECTUALLY DISABLED',
                        queryValue: '111'}]
            },
            {
                name: 'BIRTHING CENTER',
                queryValue: 'BIRTHING CENTER',
                children: []
            },
            {
                name: 'PSYCHIATRIC RESIDENTIAL TREATMENT FACILITIES',
                queryValue: 'PSYCHIATRIC RESIDENTIAL TREATMENT FACILITIES',
                children: []
            },
            {
                name: 'PORTABLE X-RAY SUPPLIERS',
                queryValue: 'PORTABLE X-RAY SUPPLIERS',
                children: []
            },
            {
                name: 'OUTPATIENT PHYSICAL THERAPY/SPEECH PATHOLOGY SERVICES',
                queryValue: 'OUTPATIENT PHYSICAL THERAPY/SPEECH PATHOLOGY SERVICES',
                children: []
            },
            {
                name: 'RURAL HEALTH CLINICS',
                queryValue: 'RURAL HEALTH CLINICS',
                children: []
            },
            {
                name: 'COMPREHENSIVE OUTPATIENT REHABILITATION FACILITIES',
                queryValue: 'COMPREHENSIVE OUTPATIENT REHABILITATION FACILITIES',
                children: []
            },
            {
                name: 'ABORTION CLINIC',
                queryValue: 'ABORTION CLINIC',
                children: []
            }
        ]
    };

    if (has('agrc-build') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-F8424FE7767822';
        window.AGRC.quadWord = 'career-exhibit-panel-stadium';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.quadWord = '';
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
