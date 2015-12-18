define(['global',
        'views/common/baseModalView',
        'models/settings/referenceSequenceModel',
        'events/eventDispatcher',
        'hb!templates/settings/add-reference-genome.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
    	Global,
        BaseModalView,
        ReferenceSequenceModel,
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
			//'click #btnReferenceSave': 'saveDetails'
		},
		
		initialize: function(options){
			this.options.headerKey="settings.references.referenceSequence.addReferenceGenemo";
			this.model= new ReferenceSequenceModel();
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
            	confirmId: 'btnReferenceSave',
            	cancelId: 'btnReferenceCancel'
            }));
            
            this.$('#btnReferenceSave').prop({
            	'disabled': true,
            	'title': $.t("upload.file.message")
            });
            
            var self = this;
			var defaultOptions = {
					autoUpload : false,
					dataType : 'json',
					add : function(e, data) {
						self.$('#btnReferenceSave').removeProp('disabled');
						self.$('#btnReferenceSave').removeAttr('title');
						self.$('#btnReferenceSave').unbind();
						self.$('#btnReferenceSave').click(function(e) {
							e.preventDefault();
							self.disableButton();
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
						self.render();
						self._uploadError(data);
					}
				};
			
			this.$el.find('#referenceFileUpload').enhancedFileupload(defaultOptions);
			this.$el.unbind('hide').on('hide', function() {
				self.unbind();
			});
			
			return this;
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
			Dispatcher.trigger('upload:referenceSequence',{
				id : 'success-banner',
				container : $('.main-content>.container-fluid'),
				style : 'success',
				static : false,
				grid:'referenceSequenceView',
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