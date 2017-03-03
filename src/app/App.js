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

        // facilitiesId
        //  layer ID for health facality points
        facilitiesId: 'Healthfacilities',
        facilityPoints: null,
        map: null,

        download: null,

        sherlock: null,
        county: null,
        city: null,

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

            this.initMap();
            // countiesProvider: Provider
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
                this.sherlock = new Sherlock({
                    provider: countiesProvider,
                    map: this.map,
                    maxResultsToDisplay: 10,
                    placeHolder: 'Enter location'
                }, this.cityNode),
                this.filter = new FilterContainer({}, this.facalityFilterNode),
                this.download = new Download({ map: this.map }, this.downloadDiv)
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
            this.sherlock.on('zoomed', lang.hitch(this, function (graphic) {
                var name = graphic.attributes.NAME;
                if (name.indexOf('County') === -1) {
                    this.county = null;
                } else {
                    this.county = name.replace(' County', '').toUpperCase();
                }
                if (config.cities.indexOf(name.toUpperCase()) === -1) {
                    this.city = null;
                } else {
                    this.city = name.toUpperCase();
                }
                console.log('Sherlock app zoom', this.county);
            }));
            this.inherited(arguments);
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false
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
                outFields: [
                    'Name', 'TYPE', 'AdminFirst',
                    'AdminLast', 'Address', 'City',
                    'ZipCode', 'Beds', 'CurrentLicense',
                    'LicenseExperiation', 'LicNumber', 'Phone']
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
            var nullToEmpty = function (fieldValue) {
                return fieldValue === null ? '' : fieldValue;
            };
            console.log('yapp.App::onFacPointHover', evt);
            console.log('yapp.App::onFacPointHover', evt.graphic.attributes);
            var windowContent = [
                'Type: ' + nullToEmpty(evt.graphic.attributes[config.fieldNames.facType]),
                'Contact: ' + nullToEmpty(evt.graphic.attributes.AdminFirst) + ' ' +
                nullToEmpty(evt.graphic.attributes.AdminLast),
                'ADDRESS: ' + nullToEmpty(evt.graphic.attributes.Address) + ', ' +
                                               nullToEmpty(evt.graphic.attributes.City) + ' ' +
                                               nullToEmpty(evt.graphic.attributes.ZipCode),
                'Beds: ' + nullToEmpty(evt.graphic.attributes.Beds),
                'License Date: ' + nullToEmpty(evt.graphic.attributes.CurrentLicense),
                'License Expiration: ' + nullToEmpty(evt.graphic.attributes.LicenseExperiation),
                'License Number: ' + nullToEmpty(evt.graphic.attributes.LicNumber),
                'Phone Number: ' + nullToEmpty(evt.graphic.attributes.Phone)];
            this.map.infoWindow.resize(400, 200); // eslint-disable-line no-magic-numbers
            this.map.infoWindow.setTitle(evt.graphic.attributes.Name);
            this.map.infoWindow.setContent(windowContent.join('<br>'));
            this.map.infoWindow.show(evt.screenPoint, this.map.getInfoWindowAnchor(evt.screenPoint));
        },
        onFacPointLeave: function (evt) {
            console.log('yapp.App::onFacPointLeave', evt);
            this.map.infoWindow.hide();
        }
    });
});
