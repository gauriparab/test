define(['global',
        'views/common/baseModalView',
        'events/eventDispatcher',
        'hb!templates/settings/add-gene-list.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
    	Global,
        BaseModalView,
        Dispatcher,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var addGeneListView = BaseModalView.extend({
				
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
			//'click #btnGeneListSave': 'saveDetails'
		},
		
		initialize: function(options){
			this.options.headerKey='settings.references.reportingGenes.addReportingGeneList';
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
            	confirmId: 'btnGeneListSave',
            	cancelId: 'btnGeneListCancel'
            }));
            this.$('#btnGeneListSave').prop({
            	'disabled': true,
            	'title': $.t("upload.file.message")
            });
            var self = this;
			var defaultOptions = {
					autoUpload : false,
					dataType : 'json',
					add : function(e, data) {
						self.data = data;
						self.$('#btnGeneListSave').removeProp('disabled');
						self.$('#btnGeneListSave').removeAttr('title');
						self.$('#btnGeneListSave').unbind();
						self.$('#btnGeneListSave').click(function(e) {
							e.preventDefault();
							self.disableButton();
							var attributes={
					            	'name': self.$('#geneListName').val(),
					            	'description': self.$('#geneListDescription').val(),
					            	'fileName': self.$el.find('.fileupload-preview').html()
					        }
							$.ajax({
			                    url: '/ir/secure/api/settings/saveGeneFile',
			                    type: 'POST',
			                    contentType: 'application/json',
			                    dataType: 'json',
			                    data: JSON.stringify(attributes),
			                    success: _.bind(self._uploadSuccessful, self),
			                    error: _.bind(self._uploadError, self)
			                });
						});
					},
					progress : function(e, data) {
						var progress = parseInt(data.loaded / data.total * 100, 10);
						self._uploadProgress(progress);
					},
					done : function(e, data) {
						self._onSaveSuccess(data);
						
					},
					fail : function(e, data) {
						//self.render();
						self._uploadError(data);
					}
				};
			
			this.$el.find('#geneFileUpload').enhancedFileupload(defaultOptions);
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
		
		_uploadSuccessful:function(){
			this.handleUpload();
			this.data.submit();
		},		
		
		_onSaveSuccess : function(model) {
			this._hide();
			Dispatcher.trigger('upload:geneList',{
				id : 'success-banner',
				container : $('.main-content'),
				style : 'success',
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
	
	return addGeneListView;
});