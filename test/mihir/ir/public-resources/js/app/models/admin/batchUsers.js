/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'],
    function($, _, BaseModel) {
        "use strict";

        var BatchUsers = BaseModel.extend({

            importUsers: function(importFile, onSuccess, onError) {
                this.fetch({
                    url: '/ir/secure/api/v40/users/import',
                    data: JSON.stringify(importFile.toJSON()),
                    dataType: 'json',
                    type: 'POST',
                    contentType: 'application/json',
                    reset: true,
                    timeout: parseInt($.t('analysis.error.timeout.value'), 10),
                    success: _.partial(onSuccess, this),
                    error: onError
                });
            },

            hasErrorFile: function() {
                return this.get('errorFile') && this.get('errorFile').id ? true : false;
            }

        });

        BatchUsers.import = function(importFile, onSuccess, onError) {
            var batchUsers = new BatchUsers();
            batchUsers.importUsers(importFile, onSuccess, onError);
            return batchUsers;
        };

        return BatchUsers;
    });
