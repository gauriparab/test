/*global define:false*/
define(['views/common/baseModalView', 
        'models/assay/cnvLogs',
        'hb!templates/assay/cnv-logs-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(BaseModalView, 
    		LogsModel, 
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var CNVDetailsView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'cnv.baseline.logs.title',
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
	        this.model = new LogsModel({
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
			    },
			    error: function(){
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
