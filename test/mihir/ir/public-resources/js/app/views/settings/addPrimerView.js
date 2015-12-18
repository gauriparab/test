define(['global',
        'views/common/baseModalView',
        'events/eventDispatcher',
        'hb!templates/settings/add-primer.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
    	Global,
        BaseModalView,
        Dispatcher,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var PrimerUploadView = BaseModalView.extend({
				
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
		
		initialize: function(options){
			this.options.headerKey="settings.references.primers.addPrimer";
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
            	confirmId: 'btnPrimerSave',
            	cancelId: 'btnPrimerCancel'
            }));
            
            this.$('#btnPrimerSave').prop({
            	'disabled': true,
            	'title': $.t("upload.file.message")
            });
            
            var self = this;
			var defaultOptions = {
					autoUpload : false,
					dataType : 'json',
					add : function(e, data) {
						self.$('#btnPrimerSave').removeProp('disabled');
						self.$('#btnPrimerSave').removeAttr('title');
						self.$('#btnPrimerSave').unbind();
						self.$('#btnPrimerSave').click(function(e) {
							e.preventDefault();
							self.disableButton();
							self.clearnError(); 
							var attributes={
					            	'name': self.$("#primerName").val(),
					            	'description': self.$("#primerDescription").val(),
					            	"fileName": self.$el.find(".fileupload-preview").html()
					        }
							$.ajax({
			                    url: '/ir/secure/api/settings/savePrimer',
			                    type: 'POST',
			                    contentType: 'application/json',
			                    dataType: 'json',
			                    data: JSON.stringify(attributes),
			                    success: function() {
			                    	self.handleUpload();
									data.submit();
			                    },
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
			
			this.$el.find('#primerFileUpload').enhancedFileupload(defaultOptions);
			this.$el.unbind('hide').on('hide', function() {
				self.unbind();
			});
			
			return this;
		},		
		
		_onSaveSuccess : function(model, data) { 
			   
			if (data.result.uploaded == "false" ) {   
		        var errorsMsg = '<ul>'; 
		        for (var i=0; i<data.result.errors.length; i++) {  
		             errorsMsg = errorsMsg + '<li>' + data.result.errors[i] + '</li>';   
		        } 
		        errorsMsg = errorsMsg + '</ul>';    
				 
				$("#uploaderror").append('<div class="alert alert-error">' + errorsMsg + '</div>'); 
			
			} else {  
				
				this._hide();
				
				Dispatcher.trigger('upload:primer',{
					id : 'success-banner',
					container : $('.main-content'),
					style : 'success',
					title : $.t('primer.upload.success')
				});
			} 
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

		clearnError : function() { 
			this.$('#uploaderror').empty(); 
		},
		onRemove : function() {
			this.$('#upload').unbind();
		}
		
	});
	
	return PrimerUploadView;
});