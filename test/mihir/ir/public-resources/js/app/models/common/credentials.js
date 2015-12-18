/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    
    var Credentials = BaseModel.extend({
        defaults: {
            username: null,
            password: null
        }
    });
    
    return Credentials;
});