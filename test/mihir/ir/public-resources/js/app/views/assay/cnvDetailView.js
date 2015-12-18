/*global define:false*/
define(['views/common/baseModalView', 
        'models/assay/cnvDetails',
        'hb!templates/assay/cnv-details-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(BaseModalView, 
    		CNVModel, 
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var CNVDetailsView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'cnv.baseline.detail.title',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
		events: {
			'click #btnCloseDetails' : '_hide',
		},
    	
        initialize: function(options) {
	        this.model = new CNVModel({
	        	id : this.options.cnvId
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
		            	cancelId: 'btnCloseDetails'
		            }));
			    }
			});        
            return this;
        }
        
    });

    return CNVDetailsView;
});
