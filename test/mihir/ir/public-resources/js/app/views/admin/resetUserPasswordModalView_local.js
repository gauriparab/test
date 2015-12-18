/*global define:false */
define(['jquery', 'underscore', 'views/common/baseModalView', 'views/common/bannersView',
    'hb!templates/admin/confirm-user-password-reset.html','hb!templates/common/confirm-modal-footer.html','hb!templates/common/spinner.html'],
    function($, _, BaseModalView, BannerView, bodyTemplate, footerTemplate, Spinner) {
        'use strict';

        /**
         * A reset user password confirmation dialog
         *
         * @type {*}
         */
        var ConfirmUserPasswordResetModalView = BaseModalView.extend({
        	
        	events: {
                'click #btn-confirm': '_onConfirm',
                'click #btn-cancel': '_hide'
            },
            
            _options: function() {
            	return {
					bodyTemplate: bodyTemplate,
					headerKey: 'admin.user.set.password.header',
					bodyHeaderKey: 'admin.user.set.password.body', 
					modalOptions : {
	                    backdrop: 'static',
	                    attentionAnimation: null,
	                    keyboard: false,
	                    show : true
	                }
            	}
            },
            
            render: function() {
            	BaseModalView.prototype.render.apply(this, arguments);
            	this.$('#modalFooter').html(footerTemplate({
                	confirmClass: 'btn-primary',
                	cancelClass: 'btn-default',
                	cancelKey: 'dialog.cancel',
                	confirmKey: 'dialog.save',
                	confirmId: 'btn-confirm',
                	cancelId: 'btn-cancel'
                }));
				$("a#reset").unbind('click').click(_.bind(this._onResetViaEmail, this));
            },

            _onConfirm: function() {
            	this.disableButton();
                var self = this;
				var id= this.model.get('id');
                var data = {
                	id: id,
                    newPassword: this.$("input#newPassword").val(),
                    retypedNewPassword: this.$("input#retypedNewPassword").val()
                };
                
                $.ajax({
          		    url: this.model.urlRoot + '/resetPassword',
          		    type: "POST",
        		    data: JSON.stringify(data),
          		    contentType: "application/json",
        		    success: function(data) {
        		    				self._hide();
        		    				new BannerView({
        		    					container: $('.modal-body'),
			                            style: 'success',
			                            title: $.t('admin.user.set.password.success', self.model.toJSON())
			                        }).render();
        		    },
        		    error: function(){
						self.enableButton();
					}
        		});
            },
			
			_onResetViaEmail: function(e){
				this.disableButton($.t("sending.email.label"));
				var self = this;
				var id= this.model.get('id');
                var data = {
                	id: id,
                    newPassword: "",
                    retypedNewPassword: "true"
                };
				$.ajax({
          		    url: this.model.urlRoot + '/resetPassword',
          		    type: "POST",
        		    data: JSON.stringify(data),
          		    contentType: "application/json",
        		    success: function(data) {
        		    	self._hide();
        		    	new BannerView({
        		    		container: $("#manageUserForm").parent(),
			                style: 'success',
			                title: $.t('admin.user.send.password.email.success')
			            }).render();
        		    }, 
					error: function(){
						self.enableButton();
					}
        		});
			}
			
        });

        return ConfirmUserPasswordResetModalView;
    }
);
