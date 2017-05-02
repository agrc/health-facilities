
define([
    'dojo/text!./templates/Download.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/topic',
    'dojo/dom-attr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'ijit/modules/_ErrorMessageMixin',

    'agrc/modules/Formatting',

    'esri/tasks/Geoprocessor',

    'app/config'
], function (
    template,

    declare,
    lang,
    domClass,
    topic,
    domAttr,

    _WidgetBase,
    _TemplatedMixin,

    _ErrorMessageMixin,

    formatting,

    Geoprocessor,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _ErrorMessageMixin], {
        // description:
        //      Hooks up to the search results grid and makes requests to a
        //      geoprocessing service to download data. issue #143

        templateString: template,
        baseClass: 'download',

        _setCountAttr: {
            node: 'countNode',
            type: 'innerHTML'
        },

        // noFormatMsg: String
        noFormatMsg: 'Please select a download format below!',

        // genericErrMsg: String
        genericErrMsg: 'There was an error getting the download data!',

        // count: String
        //      The total number of selected features as a string with commas
        count: null,

        // downloadFeatures: Object
        //      A container holding the ids of the selected result features
        //      {
        //          featureClassName: ['C040', 'C039'],
        //          anotherFeatureClassName: ['1', '2', '3']
        //      }
        downloadFeatures: null,

        map: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.download.Download::postCreate', arguments);

            // this.setupConnections();

            this.inherited(arguments);
        },
        download: function () {
            // summary:
            //      sends download request to gp tool if there are any selected features
            console.log('app/download/Download:download', arguments);

            this.hideErrMsg();
            var defQuery = this.map.getLayer('Healthfacilities').getDefinitionExpression();
            if (!defQuery) {
                defQuery = '1 = 1';
            }
            if (config.app.city) {
                defQuery = defQuery + (' AND City = \'' + config.app.city + '\'');
            } else if (config.app.county) {
                defQuery = defQuery + (' AND County = \'' + config.app.county + '\'');
            }
            console.log('app/download/Download:download', defQuery);

            this.showLoader();
            this.hideDownloadLink();

            if (!this.gp) {
                var that = this;
                this.gp = new Geoprocessor(config.urls.download);
                this.own(
                    this.gp.on('error', function () {
                        that.showErrMsg(that.genericErrMsg);
                        that.hideLoader();
                    }),
                    this.gp.on('job-complete', lang.hitch(this, 'onGPComplete')),
                    this.gp.on('get-result-data-complete', lang.hitch(this, 'showDownloadLink'))
                );
            }

            var params = {
                filterQuery: JSON.stringify({ query: defQuery })
            };

            this.gp.submitJob(params);
            config.app.city = null;
            config.app.county = null;

            return params;
        },
        showLoader: function () {
            // summary:
            //      description
            console.log('app/download/Download:showLoader', arguments);

            this.downloadBtn.innerHTML = 'Processing Data';
            domAttr.set(this.downloadBtn, 'disabled', true);
            this.map.showLoader();
        },
        hideLoader: function () {
            // summary:
            //      description
            console.log('app/download/Download:hideLoader', arguments);

            this.downloadBtn.innerHTML = 'Process Download';
            domAttr.set(this.downloadBtn, 'disabled', false);
            this.map.hideLoader();
        },
        onGPComplete: function (response) {
            // summary:
            //      description
            // response: Object
            console.log('app/download/Download:onGPComplete', arguments);

            if (response.jobInfo.jobStatus === 'esriJobSucceeded') {
                this.gp.getResultData(response.jobInfo.jobId, config.parameterNames.output);
            } else {
                this.showErrMsg(this.genericErrMsg);
                this.hideLoader();
            }
        },
        showDownloadLink: function (response) {
            // summary:
            //      description
            // response: Object
            console.log('app/download/Download:showDownloadLink', arguments);

            this.downloadAnchor.href = response.result.value.url;
            domClass.remove(this.downloadAnchorContainer, 'hidden');
            this.hideLoader();
        },
        hideDownloadLink: function () {
            // summary:
            //      description
            console.log('app/download/Download:hideDownloadLink', arguments);

            domClass.add(this.downloadAnchorContainer, 'hidden');
        }
    });
});
