define([
    'app/config',
    'app/filters/FilterParent',
    'app/filters/FilterSelect',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/Evented',
    'dojo/on',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/templates/FilterContainer.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'bootstrap'
], function (
    config,
    FilterParent,
    FilterSelect,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    Evented,
    on,
    domClass,
    domConstruct,
    template,
    array,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
        // description:
        //      Control for managing the filter for the application

        templateString: template,
        baseClass: 'filter-container',
        widgetsInTemplate: true,
        filters: null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      init's all single filters and expandable parent containers.
            console.log('app/FilterContainer:postCreate', arguments);

            this.filters = [];

            var i = 0;
            config.filters.forEach(function (f) {
                i++;
                var tempFilter = null;

                if (f.children.length) {
                    var tempChildren = [];
                    f.children.forEach(function (c) {
                        tempChildren.push(
                            new FilterSelect({
                                name: c.name,
                                queryValue: c.queryValue})
                        );
                    }, this);
                    tempFilter = new FilterParent(
                        {
                            name: f.name,
                            toggleId: 'collapse' + i.toString(),
                            queryValue: f.queryValue,
                            childFilters: tempChildren
                        }, domConstruct.create('div', {}, this.filterPoint));
                } else {
                    tempFilter = new FilterSelect({
                        name: f.name,
                        queryValue: f.queryValue
                    }, domConstruct.create('div', {}, this.filterPoint));
                }
                tempFilter.on('changed', lang.hitch(this, 'onFilterChange'));
                this.own(tempFilter);
                this.filters.push(tempFilter);
            }, this);
        },
        onFilterChange: function () {
            // summary:
            //      Build a definition query when a filter changes.
            console.log('app/FilterContainer:onFilterChange', arguments);

            var queryValues = [];
            this.filters.forEach(function (f) {
                if (f.childFilters.length > 0) {
                    f.childFilters.forEach(function (c) {
                        if (c.selected) {
                            queryValues.push(c.queryValue);
                        }
                    });
                } else {
                    if (f.selected) {
                        queryValues.push(f.queryValue);
                    }
                }
            }, this);
            var query = '1 = 1';
            if (queryValues.length > 0) {
                query = config.fieldNames.facSubtype + ' IN (\'' + queryValues.join('\', \'') + '\')';
            }
            this.emit('filterChange', {queryFilter: query});
        }
    });
});
