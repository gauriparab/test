/*global define:false*/
define(['views/common/baseModalView',
    'hb!templates/admin/change-email.html',
    'hb!templates/common/confirm-modal-footer.html']
    .concat('bootstrap'),

    function(BaseModalView, bodyTemplate, footerTemplate) {
        'use strict';
        var changeEmailView = BaseModalView.extend({

            _options: function() {
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: 'user.profile.page.changeEmail.link.label',
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
                this.model=options.user;
                this.parent=options.parent;
                BaseModalView.prototype.initialize.call(this, options);
            },

            events: {
                'click .btn-secondary': '_hide',
                'click .btn-primary': 'save'
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
                 	confirmId: 'createUserSaveButton',
                 	cancelId: 'createUserCancelButton'
                 }));
                return this;
            },

           



            save: function() {
            	var self=this;
            	this.disableButton();
            	this.model.set('email', $("#userEmail").val());
            	this.model.save(this.model.toJSON(), {
            		success: _.bind(this._onSaveSuccess, this),
            		error:function() {
            			self.enableButton();
            		}
            	});
            },


            _onSaveSuccess: function(model, response) {
            	this.$el.modal('hide');
                this.parent.render();
            }

        });

        return changeEmailView;
    });
