/*global define:false*/
define(['jquery', 'underscore', 'models/customGetterSetterModel', 'linkedlist'], 
    function($, _, CustomGetterSetterModel, LinkedList) {
    'use strict';

    /**
     * A general purpose Wizard object for UI workflows. This encapsulates a set
     * of "pages" where a page consists of a tab and a view class.
     *
     * An example configuration of pages:
     * pages: [{
     *      tab: {
     *          identifier: 'FIRST',
     *          name: 'First',
     *          url: '#first'
     *      },
     *      view: FirstView
     * }, {
     *      tab: {
     *          identifier: 'SECOND',
     *          name: 'Second',
     *          url: '#second'
     *      },
     *      view: SecondView
     * }]
     *
     * @param options
     * @constructor
     */
    var Wizard = CustomGetterSetterModel.extend({

        constructor: function(attributes) {
            var attrs = attributes || {};

            this.cid = _.uniqueId('c');
            this.attributes = {};

            this.on('change:pages', this._updateSteps, this);
            
            this.set({
                model: attrs.model,
                cancelPath: attrs.cancelPath,
                pages: attrs.pages,
                options: attrs.options
            });
        },
        
        _updateSteps : function() {
            var steps = new LinkedList.linkedList();
            _.each(this.attributes.pages, function(page) {
                steps.insert(page);
            }, this);
            this.set('steps', steps);
        }

    });

    return Wizard;
});