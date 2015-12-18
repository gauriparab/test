/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {
    'use strict';
    
    var LinkedAccount = BaseModel.extend({
        urlRoot : '/ir/secure/api/v40/tsaccounts',
        
        isValid: function() {
            return !!this.id;
        }
    });
    
    return LinkedAccount;
});