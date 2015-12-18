/*global define:false*/
define(['kendo',
        'views/common/baseModalView',
        'models/assay/annotationSetDetails',
        'views/assay/parametersView',
        'hb!templates/assay/annotation-sets-details-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(
        kendo,
        BaseModalView,
    		AnnotationSetDetails,
    		ParametersView,
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var AnnotationSetsDetailsView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'assay.presets.annotationDetails',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},

		events: {
			'click #btnPrintDetails' : '_onPrint',
			'click #btnCloseDetails' : '_hide',
			'click #parametersTab li a' : '_onTabClick'
		},

        initialize: function(options) {
	        this.model = new AnnotationSetDetails({
	        	id : this.options.annotationSetId
	        });
	        BaseModalView.prototype.initialize.call(this, options);
        },

        delegateEvents: function() {
        	BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },

        render: function() {
        	var self=this;
		    this.model.fetch({
			    success: function(){
			    	BaseModalView.prototype.render.call(self);
				    self.$('#modalFooter').html(footerTemplate({
				    	closeKey: 'dialog.close',
				    	printId: 'btnPrintDetails',
		            	cancelId: 'btnCloseDetails'
		            }));
			    }
			});
            return this;
        }
    });

    return AnnotationSetsDetailsView;
});
