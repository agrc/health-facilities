define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMap',

    'sherlock/Sherlock',
    'sherlock/providers/WebAPI',

    'app/config',
    'app/FilterContainer',
    'app/download/Download',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom',
    'dojo/dom-style',
    'dojo/on',
    'dojo/text!app/templates/App.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/dijit/Print',
    'esri/geometry/Extent',
    'esri/layers/FeatureLayer',

    'ijit/widgets/layout/SideBarToggler',

    'layer-selector'
], function (
    FindAddress,
    MagicZoom,
    BaseMap,

    Sherlock,
    WebAPI,

    config,
    FilterContainer,
    Download,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    dom,
    domStyle,
    on,
    template,
    array,
    declare,
    lang,

    Print,
    Extent,
    FeatureLayer,

    SideBarToggler,

    BaseMapSelector
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        //facilitiesId
        //  layer ID for health facality points
        facilitiesId: 'Healthfacilities',
        facilityPoints: null,
        map: null,

        download: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            // this.version.innerHTML = config.version;

            this.initMap();
            //this.download = new Download({}, this.downloadDiv)
            //countiesProvider: Provider
            //      Provider for sherlock and zoom to city or county
            var countiesProvider = new WebAPI(
                config.apiKey,
                'SGID10.LOCATION.ZoomLocations',
                'NAME',
                {
                    wkid: 3857
                }
            );

            this.childWidgets.push(
                new SideBarToggler({
                    sidebar: this.sideBar,
                    map: this.map,
                    centerContainer: this.centerContainer
                }, this.sidebarToggle),
                new Sherlock({
                    provider: countiesProvider,
                    map: this.map,
                    maxResultsToDisplay: 10,
                    placeHolder: 'Enter location'
                }, this.cityNode),
                this.filter = new FilterContainer({}, this.facalityFilterNode),
                this.download = new Download({map: this.map}, this.downloadDiv)
            );

            this.inherited(arguments);

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      Fires when
            console.log('app.App::setupConnections', arguments);

            // on.once(this.egg, 'dblclick', lang.hitch(this, 'showLevel'));
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            array.forEach(this.childWidgets, function (widget) {
                console.log(widget.declaredClass);
                this.own(widget);
                widget.startup();
            }, this);

            this.filter.on('filterChange', lang.hitch(this, 'onFilter'));
            this.inherited(arguments);
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false,
                extent: new Extent({
                    xmax: -12010849.397533866,
                    xmin: -12898741.918094235,
                    ymax: 5224652.298632992,
                    ymin: 4422369.249751998,
                    spatialReference: {
                        wkid: 3857
                    }
                })
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    quadWord: config.quadWord,
                    baseLayers: ['Terrain', 'Hybrid', 'Lite']
                })
            );

            var urlfacilities = config.urls.facilities;
            this.facilityPoints = new FeatureLayer(urlfacilities, {
                id: this.facilitiesId,
                opacity: 0.75,
                outFields: ['TYPE', 'FACID', 'FACTYPE', 'NAME', 'ADDRESS', 'CITY', 'ZIP', 'TELEPHONE', 'COUNTY']
            });

            this.facilityPoints.on('mouse-over', lang.hitch(this, 'onFacPointHover'));
            this.facilityPoints.on('mouse-out', lang.hitch(this, 'onFacPointLeave'));

            this.map.addLayer(this.facilityPoints);
        },
        onFilter: function (e) {
            console.log('yapp.App::onFilter', e);
            this.facilityPoints.setDefinitionExpression(e.queryFilter);
        },
        onFacPointHover: function (evt) {
            console.log('yapp.App::onFacPointHover', evt);
            console.log('yapp.App::onFacPointHover', evt.graphic.attributes);
            var windowContent = [config.fieldNames.facType + ': ' + evt.graphic.attributes[config.fieldNames.facType],
                                 'FACID: ' + evt.graphic.attributes.FACID,
                                 'FACTYPE: ' + evt.graphic.attributes.FACTYPE,
                                 'COUNTY: ' + evt.graphic.attributes.COUNTY,
                                 'ADDRESS: ' + evt.graphic.attributes.ADDRESS + ', ' +
                                               evt.graphic.attributes.CITY + ' ' +
                                               evt.graphic.attributes.ZIP,
                                 'PHONE: ' + evt.graphic.attributes.TELEPHONE];
            this.map.infoWindow.resize(300, 150);
            this.map.infoWindow.setTitle(evt.graphic.attributes.NAME);
            this.map.infoWindow.setContent(windowContent.join('<br>'));
            this.map.infoWindow.show(evt.screenPoint, this.map.getInfoWindowAnchor(evt.screenPoint));
        },
        onFacPointLeave: function (evt) {
            console.log('yapp.App::onFacPointLeave', evt);
            this.map.infoWindow.hide();
        }
    });
});
