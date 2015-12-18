/*global define:false*/
define(['jquery',
        'underscore', 
        'backbone', 
        'i18n', 
        'views/formView', 
        'views/errorsView',
        'models/sample/sampleModel',
        'hb!templates/data/sample-details-view.html'
       ]
	.concat(
    	'bootstrap.modal', 
    	'bootstrap.modalmanager'),
    function($,
    		_, Backbone,
    		i18n, 
    		FormView, 
    		ErrorsView,
    		SampleModel, 
    		template) {
    "use strict";

    var SampleDetailsView = FormView.extend({

        id: 'sampleDetailsModal',

        tagName: 'div',

        className: 'modal fade',
        
        cancelButtonSelector: '.btn-secondary',

        initialize: function(options) {
        	this.sampleId = options.sampleId;
	        this.grid = options.grid;
	        this.model = new SampleModel({
	        	sampleId : this.sampleId
	        });
	        this.errorsView = new ErrorsView({
                model: this.model
            });
        },

        events: {
            'click #closeAssayDetailsBtn' : 'close'
        },
        
        delegateEvents: function() {
            FormView.prototype.delegateEvents.apply(this, arguments);
        },

		bindData: function(){
			this.$el.html(template(this.model.toJSON()));
		},

        render: function() {
			var self=this;
		    this.model.fetch({
			   success: function(){
			        self.$el.html(template(self.model.toJSON()));
			        self.renderSubView(self.errorsView, "#errors");
			        self.$el.modal({
		                show: true,
		                backdrop: 'static',
		                attentionAnimation: null,
		                keyboard: false
			        });
			}});
            return this;
        },

    });

    return SampleDetailsView;
});
