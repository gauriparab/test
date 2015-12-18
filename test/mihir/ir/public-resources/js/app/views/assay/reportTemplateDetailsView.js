/*global define:false*/
define(['views/common/baseModalView', 
        'models/reportTemplateModel',
        'views/common/bannersView',
        'hb!templates/assay/report-template-details-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(BaseModalView, 
    		ReportTemplateModel, 
    		BannerView,
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var ReportTemplateDetailsView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'presets.reportTemplate.details.view',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: "700px"
                }
			}
		},
		
		events: {
			'click #btnPrintDetails' : '_onPrint',
			'click #btnCloseDetails' : '_hide',
			'click #btnExportDetails' : "_onExport",
		},
    	
        initialize: function(options) {
	        this.model = new ReportTemplateModel({
	        	id : this.options.reportTemplateId
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
			    	var logo=self.model.toJSON().organizationLogoFileName;
			    	if(logo) {
			    		var filename=logo.substring(logo.lastIndexOf("/")+1);
				    	self.model.set('organizationLogoFileName',filename);
			    	}
			    	BaseModalView.prototype.render.call(self);
				    self.$('#modalFooter').html(footerTemplate({
				    	closeKey: 'dialog.close',
				    	/*printId: 'btnPrintDetails',
				    	exportId: 'btnExportDetails',*/
		            	cancelId: 'btnCloseDetails'
		            }));
			    }
			});        
            return this;
        },
        
        _onPrint: function(){
        	
        },
        
        _onExport: function() {
        	var self = this;
        	var reportTemplateId = this.options.reportTemplateId
        	$.ajax({
      		    url: "/ir/secure/api/assay/zipFile?reportTemplateId="+reportTemplateId,
      		    type: "GET",
      		    contentType: "application/json",
    		    success: function(data) {
    		    	window.location = data;
    		    },
        		error: function(resp) {
        			var error = JSON.parse(resp.responseText);
                    if (error && error.status < 500) {
                        new BannerView({
                            container: $('.modal-body'),
                            style: 'error',
                            title: error.message,
                            messages: error.errors && error.errors.allErrors &&
                                _.pluck(error.errors.allErrors, 'defaultMessage')
                        }).render();
                    }
        		}
    		});	
        }
    });

    return ReportTemplateDetailsView;
});
