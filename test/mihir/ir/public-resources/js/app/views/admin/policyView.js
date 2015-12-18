/*global define:false*/
define(['views/common/baseModalView', 'models/admin/policyModel',
    'hb!templates/admin/policies.html', 'hb!templates/common/confirm-modal-footer.html']
    .concat('bootstrap'),

    function(BaseModalView, PolicyModel, bodyTemplate, footerTemplate) {
        'use strict';
        var PolicyView = BaseModalView.extend({

            el: '#manageUserModal',
            
            _options: function() {
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: 'button.label.policies',
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true
                    }
    			}
    		},

            initialize: function(options) {
                options = options || {};
                this.initializeModel(options);
                BaseModalView.prototype.initialize.call(this, options);
            },

            initializeModel: function(options) {
                this.model = new PolicyModel();
                this.completeAction = options.completeAction;
            },

            events: {
                'click .btn-secondary': '_hide',
                'click #policiesSaveButton': 'save',
                'change select#passwordLifetime': 'lifetimeChange',
                "click input[type=checkbox]" : "onCheckboxClicked",
            },
            
            delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },

            render: function() {
            	var self= this;
					
				this.model.fetch({
					 success: function() {
					     BaseModalView.prototype.render.call(self);
					     self.$('#modalFooter').html(footerTemplate({
				            	confirmClass: 'btn-primary',
				            	cancelClass: 'btn-default',
				            	cancelKey: 'dialog.cancel',
				            	confirmKey: 'dialog.save',
				            	confirmId: 'policiesSaveButton',
				            	cancelId: 'policiesCancelButton'
				            }));
					 }
				});
				
            },

            _onSaveSuccess: function(model, response) {
            	this.$el.modal('hide');
                if (_.isFunction(this.completeAction)) {
                    this.completeAction(response);
                }
            },

            lifetimeChange: function(e) {
            	var select = $(e.currentTarget);
            	var notifyUserSelect=this.$el.find('#notifyUserSelect');
            	var notifyUserNA=this.$el.find('#notifyUserNA');
            	if( select.val() == "NoExpiration") {
            		notifyUserSelect.hide();
            		notifyUserNA.show();
                } else {
                	notifyUserSelect.show();
            		notifyUserNA.hide();
                }
            },
            
            onCheckboxClicked: function(e) {
                var enabled = $(e.currentTarget);
                var $timeoutPeriod = this.$el.find('select#timeoutPeriod');
                if(enabled.is(':checked')){
                	$timeoutPeriod.removeAttr('disabled');
                } else {
                	$timeoutPeriod.attr('disabled', 'disabled');
				}
                
               
            },

            save: function() {
            	var self=this;
            	this.disableButton();
            	this.model.set('failed_login_attempts', $("#failedLoginAttempts").val());
                this.model.set('attempt_interval', $("#within").val());
                this.model.set('account_suspension_hours', $("#suspensionPeriod").val());
                this.model.set('password_lifetime', $("#passwordLifetime").val());
                this.model.set('password_notification_period', $("#notifyUser").val());
                this.model.set('session_policies_enabled', $("#enabled").is(':checked') ? 'true' : 'false');
                this.model.set('session_timeout', $("#timeoutPeriod").val());
                this.model.save(this.model.toJSON(), {
            		success: _.bind(this._onSaveSuccess, this),
            		error:function() {
            			self.enableButton();
            		}
            	});
            }

            
        });

        return PolicyView;
    });
    
    
