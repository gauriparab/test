/*global define:false*/
define(['views/common/baseModalView', 
        'models/settings/instrumentLogModel',
        'hb!templates/settings/instrument-log-details-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(BaseModalView, 
    		InstrumentLogModel, 
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var InstrumentLogView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
        initialize: function(options) {
	        this.model = new InstrumentLogModel({
	        	folderPath : this.options.folderPath,
	        	name : this.options.name
	        });
	        this.options.headerKey="InitLog.txt";
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
				    self.$el.find("div#fileContent").html(self.model.toJSON().value);
			    }
			});        
            return this;
        },
        
    });

    return InstrumentLogView;
});
