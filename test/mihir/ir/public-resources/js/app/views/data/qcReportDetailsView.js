/* global define:false*/
define([
    'jquery',
    'backbone',
    'models/data/qcReportDetail',
    'hb!templates/data/qcReportDetails.html'
],
    function(
        $,
        Backbone,
        QcReportDetail,
        template) {
	'use strict';

    var QcReportDetailsView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            this.model = new QcReportDetail({
            	id: options.id
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	this.model.fetch({
        		success: function() {
        			self.$el.html(self._template(self.model.toJSON()));
        		}
        	});
        }
	
    });

    return QcReportDetailsView;
});
