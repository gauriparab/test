/*global define:false*/
define([ 'underscore',
         'jquery',
         'backbone',
         'views/common/baseModalView',
         'views/admin/manageUserView',
         'views/common/searchView',
         'views/common/bannersView',
         'views/admin/usersGridView',
         'views/admin/userDetailsView',
         'views/common/actionsView',
         'views/admin/acceptUserView',
		 'views/common/auditTrailView',
         'views/admin/resetUserPasswordModalView_platform',
         'views/admin/confirmDeleteUserModalView',
         'views/admin/confirmRejectUserModalView',
         'views/changePasswordView',
         'views/admin/policyView',
         'collections/admin/roles',
         'hb!templates/admin/admin-action-buttons.html'],

    function(_,
             $,
             Backbone,
             BaseModalView,
             ManageUserView,
             SearchView,
             BannerView,
             UsersGridView,
             UserDetailsView,
             ActionsView,
             AcceptUserView,
			 AuditTrailView,
             ResetPasswordView,
             ConfirmDeleteUser,
             ConfirmRejectUser,
             ChangePasswordView,
             PolicyView,
             Roles,
             template) {
        'use strict';

        var AdminUserView = Backbone.View.extend({

            el: ".main-content",

            gridEl: '#viewusers-grid',
            _searchEl: '#query-form',

            initialize: function(opts) {
                var options = opts || {};
                this.needsReason = opts.auditConfig['User'].needsReason;
                this._gridView = new UsersGridView({
                    el: options.gridEl || this.gridEl
                });
                /*this._gridView.on('action:view_details',
						this._viewDetails, this);*/

                this.searchView = new SearchView({
                    // IR-612 requires revision to criteria.
                    valid: /(^$)|(^[A-Za-z0-9_ \-\*\.\@\_\ ]{1,256}$)/
                });

                this.searchView.on('search', this._onSearch, this);

                this._actionsView = new ActionsView({
                    msgKeyPrefix: 'user.action.',
                    el: '#details-options-menu'
                });

                this._detailView = new UserDetailsView();
                
                this.roles = new Roles();
                this.roles.fetch();

            },

            events: {
                "click #createUser": "createUser",
                "click #policiesButton": "policies"
            },

            render: function() {
                this._gridView.render();
                this.searchView.setElement(this.$(this._searchEl)).render();
                $('div#action-buttons').html(template);
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);

                this.listenTo(this._gridView, 'rowSelect', this._onSelectionChanged);
                this.listenTo(this._gridView, 'action:edit', this._onEdit);
                this.listenTo(this._gridView, 'action:view_details', this._viewDetails);
                this.listenTo(this._gridView, 'action:change_password', this._changePassword);
				this.listenTo(this._gridView, 'action:audit_trail', this._onAudit);
                this.listenTo(this._actionsView, 'action:delete', this._onDelete);
                this.listenTo(this._actionsView, 'action:edit', this._onEdit);
                this.listenTo(this._actionsView, 'action:accept', this._onAccept);
                this.listenTo(this._actionsView, 'action:reject', this._onReject);
                this.listenTo(this._actionsView, 'action:reset_password', this._onResetPassword);
                this.searchView.on('search', this._onSearch, this);
            },

            undelegateEvents: function() {
                this.stopListening(this._gridView);
                this.stopListening(this._actionsView);
                this.searchView.off('search', this._onSearch, this);
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            createUser: function(event) {
                event.preventDefault();
                BaseModalView.open(null, {
                	el: '#manageUserModal',
					completeAction: _.bind(this._displayBanner, this, {
	                       titleKey: 'admin.successful.user.creation'
	                }),
	                local: this.options.local,
	                needsReason: this.needsReason,
	                roles: this.roles.toJSON()
                }, ManageUserView);
                
                
            },

            _displayBanner: function(options) {
                options = _.defaults(options, {
                    style: 'success',
                    id: 'success-banner'
                });

                BannerView.show(options);
                this._gridView.refresh();
            },

            _onSelectionChanged: function(currentSelection) {
                if (currentSelection) {
                    currentSelection.fetch({
                        success: _.bind(function(user) {
                            this._detailView.setUser(user);
                            /*this._detailView.render();
                            this._actionsView
                                .setPrimaryAction(user.getPrimaryAction())
                                .renderActions(user.get('actions'));*/
                        }, this)
                    });
                }
            },

            _onEdit: function(e, user) {
                user = user || this._detailView.model;

                BaseModalView.open(null, {
                	el: '#manageUserModal',
                	completeAction: _.bind(this._onCompleteUserEdit, this),
                    model: user,
                    needsReason: this.needsReason,
                    roles: this.roles.toJSON()
                }, ManageUserView);
            },
            
            _onCompleteUserEdit: function(){
                this._displayBanner({
                    titleKey: 'admin.successful.user.modification'
                });
                this._gridView.refresh();
            },

            _onDelete: function() {
                var self = this,
                    user = this._detailView.model,
                    userName = user.get('firstName') + ' ' + user.get('lastName');

                ConfirmDeleteUser.open(function() {
                    user.destroy({
                        success: function() {
                            self._displayBanner({
                                title: $.t('admin.user.delete.success', {name: userName})
                            });
                        }
                    });
                }, {});
            },
			_onAudit: function(e, user){
					
					var data=[];
					var temp={};
					temp.key="audit.trail.userId";
					temp.value=user.toJSON().id;
					data.push(temp);
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#auditTrailModal",
						model:user,
						data:data,
						gridViewUrl:'/ir/secure/api/auditmanagement/user',
						filters:{userId : user.toJSON().id},						
						detailsViewUrl:'/ir/secure/api/auditmanagement/user/getAuditDetails' + "?userId=" + user.toJSON().id
					}, AuditTrailView);			
			    },

            _onAccept: function() {
                var user = this._detailView.model;

                new AcceptUserView({
                    completeAction: _.bind(this._displayBanner, this, {
                        titleKey: 'admin.successful.user.modification'
                    }),
                    model: user
                });

            },

            _onReject: function() {
                var self = this,
                    user = this._detailView.model;

                user.fetch({
                    contentType: "application/json;charset=UTF-8",
                    async: false,
                    success: function() {
                        var userName = user.get('firstName') + ' ' + user.get('lastName');

                        ConfirmRejectUser.open(_.bind(self._rejectUserConfirm, self, user, userName), {
                            model: user
                        });
                    }
                });
            },

            _rejectUserConfirm: function(userModel, userName) {
                userModel.reject({
                    success: _.bind(this._rejectUserSuccess, this, userName),
                    error: _.bind(this._rejectUserError, this, userName)
                });
            },

            _rejectUserSuccess: function(userName) {
                this._displayBanner({
                    id: 'reject-success-banner',
                    title: $.t('admin.user.reject.success', {
                        name: userName
                    })
                });
            },

            _rejectUserError: function(userName) {
                this._displayBanner({
                    id: 'reject-error-banner',
                    style: 'error',
                    title: $.t('admin.user.reject.error', {
                        name: userName
                    })
                });
            },

            _onResetPassword: function() {
                var user = this._detailView.model;

                user.fetch({
                    contentType: "application/json;charset=UTF-8",
                    async: false,
                    success: function() {
                        ResetPasswordView.open(null, {
                            model: user
                        });
                    }
                });
            },

            _onSearch: function(query) {
                if (_.isEmpty(query)) {
                    this._gridView.clearFilter('q');
                } else {
                    this._gridView.addFilter('q', query);
                }
            },
            
            _viewDetails: function(e, model) {
                BaseModalView.open(null, {
                    el: "#manageUserModal",
                    model: model,
                }, UserDetailsView);
            },
            
            
            
            _changePassword: function() {
                ChangePasswordView.openDialog();
            },
            
            policies: function() {
            	event.preventDefault();
            	BaseModalView.open(null, {
                    el: "#manageUserModal",
                }, PolicyView);
            }
             
            

        });

        return AdminUserView;
    });