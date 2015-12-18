/*global define:false*/
define(['views/common/baseModalView',
        'models/settings/auditDetails',
        'hb!templates/settings/audit-details-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(BaseModalView, 
    		AuditModels,
    		template,
    		footerTemplate) {
    "use strict";

    var AuditRecordsDetails = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: template,
				headerKey: $.t('audit.trail.details'),
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: "950px",
                    heigth: "500px"
                }
			}
		},
		
		events: {
			'click #btnPrintDetails' : '_onPrint',
			'click #btnCloseDetails' : '_hide',
			'click #btnExportDetails' : "_onExport",
			'click #parametersTab li a' : '_onTabClick'
		},
    	
        initialize: function(options) {
        	
        	var that = this;
	        this.model = new AuditModels({
	        	url : this.options.url
	        });
	        
	        this.model.fetch({
			    success: function(){
			    	that.options.info = that.model.toJSON();
	        		that.render();
			    }
			});  
        },
        
        delegateEvents: function() {
        	BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },

        render: function() {
        	var self=this;
        	BaseModalView.prototype.render.call(self);
		    self.$('#modalFooter').html(footerTemplate({
		    	closeKey: 'dialog.close',
		    	printId: 'btnPrintDetails',
		    	exportId: 'btnExportDetails',
            	cancelId: 'btnCloseDetails'
            }));
            return this;
        },
        
        _onTabClick: function(e){
        	var module = _.filter(this.model.toJSON().assayParameterDto.modules, function(mod){
        		return mod.name === $(e.currentTarget).html();
        	})[0];
        	this.parametersView = new ParametersView({
        		parameters: module.parameters
        	});
        	this.renderSubView(this.parametersView, "#parametersView");
        },
        
        _onPrint: function(){
        	
        },
        
        _onExport: function() {
        	
        }

    });

    return AuditRecordsDetails;
});
