/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'views/common/baseModalView','models/common/auditTrailModel', 'hb!templates/common/audit-trail-details.html', 'hb!templates/common/audit-trail-modal-footer.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function($, _, Backbone, BaseModalView, AuditTrailModel, bodyTemplate,footerTemplate) {
    "use strict";

    var AuditTrailDetailsView = BaseModalView.extend({
		options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: "audit.trail.details",
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},

        initialize: function(options) {
			this.model = new AuditTrailModel({
				detailsViewUrl: options.detailsViewUrl
			});
			this.record= options.model.toJSON();
        },
        
        delegateEvents: function() {
            BaseModalView.prototype.delegateEvents.apply(this, arguments);
        },

        render: function() {
			var self = this;
			this.model.fetch({		
			success: function() {
					_.each(self.model.toJSON(), function(prop) {
						if(prop.key)
							prop.key='audit.trail.'+prop.key; 
					});
					BaseModalView.prototype.render.call(self);
					self.$('#modalFooter').html(footerTemplate({
		            	confirmClass: 'btn-primary',
		            	cancelClass: 'btn-default',
		            	cancelKey: 'audit.trail.cancel',
		            	/*confirmKeyPrint: 'audit.trail.print',
						confirmKeyExport:'audit.trail.export',
		            	confirmIdPrint: 'auditTrailPrintButton',
						confirmIdExport:'auditTrailExportButton',*/
		            	confirmIdDownload: 'auditTrailDetailsDownloadButton',
						confirmKeyDownload: 'settings.logs.export',
		            	cancelId: 'auditTrailCancelButton'
		            }));
					self.$("#auditTrailDetailsDownloadButton").unbind('click').click({obj: self}, self._onDownload);
				}
		    });
            return this;
        },
        
        _onDownload: function(e) {
        	var self=e.data.obj;
        	var names=_.pluck(self.model.toJSON(), 'key');
        	var values=_.pluck(self.model.toJSON(), 'value');
        	$.ajax({
      		 	url: "/ir/secure/api/auditableObject/getAuditableObjectPDF?objectName="+self.record.dataObjectName
																			+"&id="+self.record.entityId 
																			+ "&revisionId="+self.record.revId 
																			+ "&actionPerformed=" + self.record.actionPerformed,
												
																			
      		    type: 'GET',
      		    contentType: 'application/json',
    		    success: function(data) {
    		    	window.location = "/ir/secure/api/auditableObject/downloadAuditPDF?path="+data;
    		    }
    		});	
        }
    });

    return AuditTrailDetailsView;
});
