/*global define:false*/
define(['views/common/baseModalView', 'collections/data/reanalyzeAssays', 'models/data/reanalyzeRun', 'hb!templates/data/reanalyze-run.html', 'hb!templates/common/confirm-modal-footer.html'].concat('bootstrap'),
		function(BaseModalView, ReanalyzeAssays, ReanalyzeRun, bodyTemplate, footerTemplate) {
		    'use strict';

			var ReanalyzeRunView = BaseModalView.extend({
				
				_options: function() {
					return {
						bodyTemplate: bodyTemplate,
						headerKey: 'data.results.reanalyze',
						modalOptions : {
		                    backdrop: 'static',
		                    attentionAnimation: null,
		                    keyboard: false,
		                    show : true
		                }
					}
				},

				initialize : function(options) {
					this.grid = options.grid;
					this.collection = new ReanalyzeAssays({
						id: options.assayId,
						resultId : options.resultId
					});
					this.model = new ReanalyzeRun();
					BaseModalView.prototype.initialize.call(this, options);
				},

				render : function() {
					var self = this;
					$.when(this.collection.fetch()).done(function(){
						self.options.assays=self.collection.toJSON();
						BaseModalView.prototype.render.call(self);
						self.$('#modalFooter').html(footerTemplate({
			            	confirmClass: 'btn-primary',
			            	cancelClass: 'btn-default',
			            	cancelKey: 'dialog.cancel',
			            	confirmKey: 'data.results.reanalyze',
			            	confirmId: 'reanalyzeAssay',
			            	cancelId: 'btnSpecimenCancel'
			            }));
						self.model.set("re_analysis_assay_id", self.collection.toJSON()[0].id);
					});

					return this;
				},

				events : {
					'click #reanalyzeAssay' : 'save',
					'change select#reanalysisAssay' : 'selectionChanged'
				},
				
				delegateEvents: function() {
					BaseModalView.prototype.delegateEvents.apply(this, arguments);
		            this.$el.on('hidden', _.bind(this.onHide, this));
		        },

				save : function() {
					this.disableButton();
					var self=this;
					this.model.set("assay_id", this.options.assayId);
					this.model.set("report_name", $("#reportName").val());
					this.model.set("result_id", this.options.resultId);
					this.model.save(this.model.toJSON(), {
	                    success: _.bind(this._onSaveSuccess, this),
	                    error: function () {
	                    	self.enableButton();
	                    }
	                });
				},

				selectionChanged : function(e) {
					this.model.set("re_analysis_assay_id", e.currentTarget.value);
				},

				_onSaveSuccess : function(model, response) {
					this.$el.modal('hide');
					this.grid.refresh();
					if (_.isFunction(this.completeAction)) {
						this.completeAction(response);
					}
				}
			});

		return ReanalyzeRunView;
});
