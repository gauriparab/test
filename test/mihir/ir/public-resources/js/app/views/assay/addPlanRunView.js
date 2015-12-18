/*global define:false*/
define(['views/common/baseModalView', 'models/assay/planRunModel', 'hb!templates/assay/add-plan-run-view.html', 'hb!templates/common/confirm-modal-footer.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function(BaseModalView, PlanRunModel, bodyTemplate, footerTemplate) {
    "use strict";

    var AddPlanRunView = BaseModalView.extend({

        _options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'sample.planARun.title',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},

        initialize: function(options) {
	        this.model = new PlanRunModel({
	        	createUrl: '/ir/secure/api/installTemplate/createPlanRun'
	        });
	        BaseModalView.prototype.initialize.call(this, options);
        },

        events: {           
            'click #savePlannedRun' : 'save'           
        },
        
        delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },

        render: function() {
			var self=this;
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'dialog.save',
            	confirmId: 'savePlannedRun',
            	cancelId: 'closePlannedRunBtn'
            }));
            return this;
        },
        
        save: function() {
        	this.disableButton();
        	this.model.set("assayId", this.options.installTemplate.id);
        	this.model.set("planName", $("#planName").val());
        	this.model.set("fieldEngineerName", $("#fieldEngineerName").val());
        	var self=this;
	        this.model.save(null, {
	        	success: function(){
	        		window.location = "planned-runs.html";
			    },
				error: _.bind(self.enableButton, self)
			});
        }
    });

    return AddPlanRunView;
});
