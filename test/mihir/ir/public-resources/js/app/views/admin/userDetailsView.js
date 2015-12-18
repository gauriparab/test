/*global define:false */
define(['views/common/baseModalView',
        'hb!templates/admin/user-details.html',
        'hb!templates/common/view-details-footer.html'],

    function(
    		 BaseModalView,
             template,
             footerTemplate) {
        'use strict';

        var UserDetailsView = BaseModalView.extend({


            el: '#manageUserModal',
            
            _options: function(){
    			return {
    				bodyTemplate: template,
    				headerKey: 'user.details.header',
    				onHide: function(){},
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true
                    }
    			}
    		},
    		
    		initialize: function(options) {
    			BaseModalView.prototype.initialize.call(this, options);
    		},
    		
    		events: {
    			'click #btnSpecimenClose' : '_hide'
    		},

            
            delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },
            
            render: function() {
            	BaseModalView.prototype.render.call(this);
                this.$('#modalFooter').html(footerTemplate({
                	closeKey: 'dialog.close',
                	cancelId: 'userDetailsCancelButton'
                }));
                return this;
            },
            
            setUser: function(user) {
                this.stopListening(this.model);
                this.model = user;
                if (this.model) {
                    //this.listenTo(this.model, 'sync', this.render);
                    this.listenTo(this.model, 'destroy', function(){
                        this.model.fetch();
                    });
                }
            
            }
        });

        return UserDetailsView;

    }

);
