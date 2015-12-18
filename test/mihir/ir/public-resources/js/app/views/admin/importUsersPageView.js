/*global define:false*/
define(['jquery', 'underscore', 'models/admin/uploadUsersImportFile', 'models/admin/batchUsers',
    'views/fileUpload', 'views/templateView', 'views/common/bannersView',
    'views/admin/importUsersGridView', 'hb!templates/admin/import-users-page.html'],
    function($, _, UserImportFile, BatchUsers, FileUploadView, TemplateView, BannerView, ImportUsersGridView,
             template) {
        'use strict';

        var ImportUsersPageView = TemplateView.extend({

            initialize: function() {
                this._fileUploadView = new FileUploadView({
                    contextHelp: 'Upload User Import File (<a href="/ir/secure/api/v40/users/upload/example">download example</a>):',
                    uploadUrl: '/ir/secure/api/v40/users/upload',
                    model: new UserImportFile()
                });

                this._gridView = new ImportUsersGridView();

                this.listenTo(this._fileUploadView, 'upload:validationSuccessful',
                    _.bind(this._onSuccessfulImportUpload, this));
            },

            render: function() {
                this.$el.html(template());
                this.renderSubView(this._fileUploadView, "#importFileUpload");

                return this;
            },

            _onSuccessfulImportUpload: function(model) {
                BatchUsers.import(model,
                    _.bind(this._onSuccessfulImport, this),
                    _.bind(this._onFailedImport, this));
            },

            _onSuccessfulImport: function(batchUsers) {
                this._batchUsers = batchUsers;

                this._gridView.setBatchUsers(batchUsers);

                var successImportCount = this._batchUsers && this._batchUsers.get("imported") && this._batchUsers.get("imported").length || 0;

                if (successImportCount > 0) {
                    BannerView.show({
                        id : 'success-banner',
                        style : 'success',
                        'static' : true,
                        titleKey : $.t('admin.user.import.success', {
                            successimport : successImportCount
                        })
                    });
                }

                if (batchUsers.hasErrorFile()) {
                    BannerView.show({
                        id: 'importErrorBanner',
                        container: this.$('#fileErrors'),
                        static: true,
                        style: 'error',
                        title: $.t('admin.user.import.errorFile', {
                            downloadUrl: '/ir/secure/api/v40/users/import/errorFile/' + batchUsers.get('errorFile').id +
                                '?' + $.param(batchUsers.get('errorFile'))
                        })
                    });
                }
                this.$('#userImportGridSection').show();
                this.renderSubView(this._gridView, '#userImportGrid');

            },

            _onFailedImport: function() {
                BannerView.show({
                    id: 'error-banner',
                    style: 'error',
                    titleKey: 'admin.user.import.failed'
                });
            }
        });

        return ImportUsersPageView;
    }
);
