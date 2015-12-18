/*global define:false*/
define(['views/common/baseModalView', 'models/assay/installTemplate', 'hb!templates/assay/template-details-view.html', 'hb!templates/common/view-details-footer.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function(BaseModalView, InstallTemplate, bodyTemplate, footerTemplate) {
    "use strict";

    var TemplateDetailsView = BaseModalView.extend({

        _options: function(){
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey ,
				onHide: function(){},
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: "700px"
                }
			}
		},

        initialize: function(options) {
        	this.templateId = options.templateId;
        	this.templateName=options.templateName;
        	this.options.headerKey=$.t('SampleAction.VIEW_DETAILS')+': '+this.templateName;
	        this.model = new InstallTemplate({
	        	templateId : this.templateId,
	        	templateName: this.templateName
	        });
	        this.headerKey=$.t('SampleAction.VIEW_DETAILS')+this.templateName;
	        BaseModalView.prototype.initialize.call(this, options);
        },

        events: {           
            'click #closeTemplateDetailsBtn' : '_hide'           
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
		            	cancelId: 'closeTemplateDetailsBtn'
		           }));
			}});
            return this;
        }

    });

    return TemplateDetailsView;
});
