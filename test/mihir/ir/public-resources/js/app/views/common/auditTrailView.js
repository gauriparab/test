/*global define:false*/
define(['jquery', 'underscore', 'kendo','views/common/baseModalView','views/common/auditTrailGridView','views/common/auditTrailDetailsView','hb!templates/common/audit-trail.html','hb!templates/common/audit-trail-modal-footer.html']
    .concat('bootstrap'),

    function($, _, kendo, BaseModalView,AuditTrailGridView, AuditTrailDetailsView, bodyTemplate, footerTemplate) {
        'use strict';
        var EditSampleView = BaseModalView.extend({
			_options: function() {
			return {
				bodyTemplate:bodyTemplate,				
				headerKey: "audit.trail.title",
				data:this.options.data,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: "680px"
                }
			}
		},
          
            initialize: function(options) {				      
				options = options || {};
				this.auditTrailGridView = new AuditTrailGridView({
				gridViewUrl:options.gridViewUrl,
				filters:options.filters
				});
				this.auditTrailGridView.on('action:view_details', this._showDetails, this);
		
            },

            events: {
            },

            render: function() {
				BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'audit.trail.cancel',
            	confirmKeyPrint: 'audit.trail.print',
				confirmKeyExport:'audit.trail.export',
            	confirmIdPrint: 'auditTrailPrintButton',
				confirmIdExport:'auditTrailExportButton',
            	cancelId: 'auditTrailCancelButton'
            }));
              
			   this.renderSubView(this.auditTrailGridView, "#viewAuditTrail-grid");
                  //this.renderSubView(this.auditTrailDetailsView, "#auditTrailDetailsModal");
                return this;
            },
            destroy: function() {
                this.$el.html(this._oldContent);
                this.stopListening();
                return this;
	    },
		_showDetails: function(e,model){          
			 //  var specimen = this.dataItem($(e.currentTarget).closest("tr")).toJSON();
			 var self = this;
			 BaseModalView.open(null, {
				type: "view_details",
				el: "#auditTrailDetailsModal",
				model: model,
				detailsViewUrl: this.options.detailsViewUrl+ "&revId=" + model.toJSON().revId + "&actionType=" + model.toJSON().actionPerformed,
			}, AuditTrailDetailsView);
		
       	 },
	     delegateEvents: function() {
                BaseModalView.prototype.delegateEvents.apply(this, arguments);
            },
        });

        return EditSampleView;
    });


