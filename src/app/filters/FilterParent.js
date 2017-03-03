define([
    'app/filters/FilterSelect',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/Evented',
    'dojo/on',
    'dojo/text!app/filters/templates/FilterParent.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'bootstrap'
], function (
  FilterSelect,

  _TemplatedMixin,
  _WidgetBase,
  _WidgetsInTempalteMixin,

  domClass,
  domConstruct,
  Evented,
  on,
  template,
  declare,
  lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTempalteMixin, Evented], {
        // description:
        //      A class for filters that contain subtype filters.
        templateString: template,
        baseClass: 'filter-parent',
        widgetsInTemplate: true,
        // selected: boolean
        //      Flag to signal when any child filter has been selected
        selected: false,
        // Properties to be sent into constructor
        // name: String
        //      The string that shows up in the button content.
        name: null,
        // toggleId: String
        //      the id that controls panel collapsing
        toggleId: null,
        // childFilters: []
        //      Array of child subtype filters for this container
        childFilters: null,
        // queryValue: String
        //      This filters addition to the facility definition query
        queryValue: null,

        constructor: function () {
            // summary:
            //      apply some defaults
            console.log('app/filters/FilterParent:constructor', arguments);

            this.childFilters = [];
        },
        postCreate: function () {
            // summary:
            //      Place child subtype filters in the panel
            console.log('app/filters/FilterParent:postCreate', arguments);

            this.childFilters.forEach(function (c) {
                domConstruct.place(c.domNode, this.buttonContainer);
                c.startup();
                c.on('changed', lang.hitch(this, 'selectSubCategory'));
                this.own(c);
            }, this);

            this.inherited(arguments);
        },
        selectSubCategory: function () {
            // summary:
            //      Fires when any child subtype filter from this parent is selected.
            console.log('app/filters/FilterParent:selectSubCategory', arguments);

            var selectedCount = 0;
            this.selected = this.childFilters.forEach(function (c) {
                if (c.selected) {
                    selectedCount++;
                }
            });
            // Change parent selected style base on number of selected children.
            if (!selectedCount) {
                domClass.remove(this.filterHeader, 'partial-select');
                domClass.remove(this.filterHeader, 'full-select');
            } else if (selectedCount === this.childFilters.length) {
                this.selected = true;
                domClass.add(this.filterHeader, 'full-select');
            } else {
                this.selected = true;
                domClass.add(this.filterHeader, 'partial-select');
                domClass.remove(this.filterHeader, 'full-select');
            }

            this.emit('changed', {
                bubbles: true,
                cancelable: false });
        },
        clear: function () {
          // summary:
          //      Fires when clear all is selected and unselects all children.
            console.log('app/filters/FilterParent:clear', arguments);

            this.childFilters.forEach(function (c) {
                c.unSelect();
            });

            this.selected = false;

            domClass.remove(this.filterHeader, 'partial-select');
            domClass.remove(this.filterHeader, 'full-select');

            this.emit('changed', {
                bubbles: true,
                cancelable: false });
        },
        selectAll: function () {
          // summary:
          //      Fires when select all is clicked and selects all children.
            console.log('app/filters/FilterParent:selectAll', arguments);

            this.childFilters.forEach(function (c) {
                c.select();
            });

            this.selected = true;
            domClass.add(this.filterHeader, 'full-select');

            this.emit('changed', {
                bubbles: true,
                cancelable: false });
        }
    });
});
