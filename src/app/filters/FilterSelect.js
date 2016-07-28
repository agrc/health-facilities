define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/Evented',
    'dojo/on',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/text!app/filters/templates/FilterSelect.html',

    'bootstrap'
], function (
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTempalteMixin,

    Evented,
    on,
    domConstruct,
    domClass,
    declare,
    lang,
    template

) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTempalteMixin, Evented], {
        // description:
        //      A class fo subtype filters.
        templateString: template,
        baseClass: 'filter-select',
        widgetsInTemplate: true,
        //selected: boolean
        //      Flag to signal when this filter has been selected
        selected: false,
        childFilters: [],
        // Properties to be sent into constructor
        // name: String
        //      The string that shows up in the button content.
        name: null,
        //queryValue: String
        //      This filters addition to the facility definition query
        queryValue: null,

        constructor: function () {
            // summary:
            //      apply some defaults
            console.log('app/filters/FilterSelect:constructor', arguments);

            this.selected = false;
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/filters/FilterSelect:postCreate', arguments);

            this.inherited(arguments);
        },
        selectCategory: function () {
            // summary:
            //      Fires when this subtype filter has been selected.
            console.log('app/filters/FilterSelect:selectCategory', arguments);

            this.selected = !this.selected;

            this.emit('changed', {bubbles: true, cancelable: false});
        },
        select: function () {
            // summary:
            //      Fires when this subtype filter has been selected by a select all in parent.
            console.log('app/filters/FilterSelect:select', arguments);

            this.selected = true;
            domClass.add(this.filterButton, 'active');
        },
        unSelect: function () {
            // summary:
            //      Fires when this subtype filter has been unselected by a unselect all in parent.
            console.log('app/filters/FilterSelect:unSelect', arguments);

            this.selected = false;
            domClass.remove(this.filterButton, 'active');
        }
    });
});
