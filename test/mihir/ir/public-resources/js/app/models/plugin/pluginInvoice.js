/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'models/analysis/purchaseOrder'],
    function ($,
              _,
              Backbone,
              PurchaseOrder) {

        'use strict';

        var PluginInvoice = Backbone.Model.extend({
            /**
             * Constructor
             *
             * @param attributes
             * @param options
             */
            initialize: function(attributes, options) {
                options = options || {};
                this._plugin = options.plugin;
                this._analysis = options.analysis;
                this._bom = options.bom;
            },

            /**
             * Model URL based on plugin ID
             *
             * @returns {string}
             */
            url: function() {
                return '/ir/secure/plugins/' + this._plugin.id + '/invoice/' + this._analysis.id;
            },

            /**
             * Customize AJAX options during fetch
             *
             * @param options
             */
            fetch: function(options) {
                return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, this._ajaxOptions()));
            },

            _ajaxOptions: function() {
                return {
                    type: 'POST',
                    contentType: 'text/plain',
                    data: JSON.stringify(this._bom)
                };
            },

            parse: function(resp) {
                resp.purchaseOrder = new PurchaseOrder(resp.purchaseOrder);
                return resp;
            },

            toJSON: function() {
                var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
                json.purchaseOrder = json.purchaseOrder.toJSON();
                json.analysis = this._analysis.toJSON();
                json.items = json.items && json.items.slice(0) || [];
                json.items = _.map(json.items, function(item){
                    return _.clone(item); 
                });
                return json;
            }


        });

        return PluginInvoice;
    }
);
