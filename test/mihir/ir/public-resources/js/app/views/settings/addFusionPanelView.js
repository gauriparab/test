define(['global',
        'views/common/baseModalView',
        'events/eventDispatcher',
        'hb!templates/settings/add-fusion-panel.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
    	Global,
        BaseModalView,
        Dispatcher,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var addReferenceGenomeView = BaseModalView.extend({
				
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
		events: {
			//'click #fusionreferenceUpload': 'saveDetails'
		},
		
		initialize: function(options){
			this.options.headerKey='settings.references.fusionPanel.addFusionPanel';
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },
		
		render: function() {
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'dialog.save',
            	confirmId: 'btnFusionPanelSave',
            	cancelId: 'btnFusionPanelCancel'
            }));
            
            this.$('#btnFusionPanelSave').prop({
            	'disabled': true,
            	'title': $.t("upload.file.message")
            });
            
            var self = this;
			var defaultOptions = {
					autoUpload : false,
					dataType : 'json',
					add : function(e, data) {
						self.data = data;
						
						self.$('#btnFusionPanelSave').removeProp('disabled');
						self.$('#btnFusionPanelSave').removeAttr('title');
						self.$('#btnFusionPanelSave').unbind();
						self.$('#btnFusionPanelSave').click(function(e) {
							self.disableButton();
							e.preventDefault();
							var attributes={
					            	'name': self.$('#fusionPanelName').val(),
					            	'description': self.$('#fusionPanelDescription').val(),
					            	'fileName': self.$el.find('.fileupload-preview').html(),
					            	'referenceId': self.$('#fusionPanel').val()
					        }
							$.ajax({
			                    url: '/ir/secure/api/settings/saveFusioPanel',
			                    type: 'POST',
			                    contentType: 'application/json',
			                    dataType: 'json',
			                    data: JSON.stringify(attributes),
			                    success: _.bind(self._uploadSuccess, self),
			                    error: _.bind(self._uploadError, self)
			                });
						});
					},
					progress : function(e, data) {
						var progress = parseInt(data.loaded / data.total * 100, 10);
						self._uploadProgress(progress);
					},
					done : function(e, data) {
						self._onSaveSuccess(self.model, data);
						
					},
					fail : function(e, data) {
						//self.render();
						self._uploadError(data);
					}
				};
			
			this.$el.find('#fusionPanelFileUpload').enhancedFileupload(defaultOptions);
			this.$el.unbind('hide').on('hide', function() {
				self.unbind();
			});
			
			return this;
		},
		
		_uploadSuccess :function() {
			this.handleUpload();
			this.data.submit();
		},
		
		saveDetails : function() {
			var self = this;
			if(self.$el.find(".fileupload-preview").html()== "") {
				var attributes={
		            	'descriptiveName': self.$("#descriptiveName").val(),
		            	'shortName': self.$("#shortName").val(),
		            	'genomeVersion': self.$("#genomeVersion").val(),
		            	'sampleSize': self.$("#sampleSize").val(),
		            	'notes': self.$("#notes").val(),
		            	"fileName": self.$el.find(".fileupload-preview").html()
		        }
				$.ajax({
                    url: '/ir/secure/api/settings/validateSaveGenomeDetails',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(attributes),
                    success: function() {
		                    	self.handleUpload();
                    },
                    error: _.bind(self._uploadError, self)
                });
			}
			
			
		},
		
		
		_onSaveSuccess : function(model) {
			this._hide();
			Dispatcher.trigger('upload:fusion-panel',{
				id : 'success-banner',
				container : $('.main-content'),
				style : 'success',
				static : false,
				title : $.t('upload.success')
			});
		},

		handleUpload : function() {
			this._resetProgress();
			this._uploadStart();
		},

		_resetProgress : function() {
			this._uploadProgress(0);
			this.$('.progress').removeClass('progress-danger')
					.removeClass('progress-success').hide();
		},

		_uploadStart : function() {
			this.$('.progress').show();
		},

		_uploadProgress : function(data) {
			this.$('.progress .bar').css("width", data + '%');
			this.$('#progressBar').addClass('active');
		},

		_uploadComplete : function() {
			this.$('.progress').removeClass('progress-striped');
			this.$('#close').show();
		},

		_uploadError : function(data) {
			this.enableButton();
			this.$('.progress').removeClass('progress-striped')
					.addClass('progress-danger');
			this._uploadProgress(100);
			this.$('#close').show();
		},

		onRemove : function() {
			this.$('#upload').unbind();
		}
		
	});
	
	return addReferenceGenomeView;
});