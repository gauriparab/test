/*global define:false*/
define(['jquery', 'models/baseModel', 'models/common/credentials'], function($, BaseModel, Credentials) {
    'use strict';
    
    var LinkedAccountRequest = BaseModel.extend({
        urlRoot : '/ir/secure/api/v40/tsaccounts',
        
        validUrl: /^(https?):\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{1,5})?([/?].+)?$/i,

        defaults: function() {
            return {
                credentials: new Credentials()
            };
        },
        
        validate : function() {
            var errors = [];
            var self = this;
            var addError = function(field) {
                if (!self.getSub(field)) {
                    errors.push({
                        field: field,
                        error: $.t('ts.samples.server.missing.' + field)
                    });
                }    
            };
            var checkValidURL = function() {
                if (self.getSub('url') && !self.validUrl.test(self.getSub('url'))) {
                    errors.push({
                        field: 'url',
                        error: $.t('ts.samples.server.invalid.url')
                    });
                }    
            };
            
            addError('name');
            addError('url');
            checkValidURL();
            addError('credentials.username');
            addError('credentials.password');

            return errors.length ? errors : null;
        }
    });
    
    return LinkedAccountRequest;
});