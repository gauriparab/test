/*global define:false*/
define(['jquery', 
        'underscore', 
        'backbone', 
        'views/formView', 
        'models/data/auditResultModel', 
        'hb!templates/data/audit-trail-details.html']
	.concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function($,
    		_, 
    		Backbone, 
    		FormView, 
    		AuditResultModel, 
    		template) {
    "use strict";

    var AuditTrailDetailsView = FormView.extend({

        id: 'auditTrailDetailsModal',

        tagName: 'div',

        className: 'modal fade',

        // FormView
        //submitButtonSelector: '#addAttributeBtn',
        cancelButtonSelector: '.btn-secondary',

        initialize: function(options) {
        	this.model = new AuditResultModel(options.data);
        },

        events: {
        },
        
        delegateEvents: function() {
            FormView.prototype.delegateEvents.apply(this, arguments);
        },

        render: function() {
	    var self = this;
	    this.model.fetch({
		success: function() {
		    self.$el.html(template(self.model.toJSON()));
            	    self.$el.modal({
                        show: true,
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false
            	    });
		}
	    });
            return this;
        },
    });

    return AuditTrailDetailsView;
});
