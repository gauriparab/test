/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    var DeleteSpecimen = BaseModel.extend({
    	url:'/ir/secure/api/specimen/delete',
    });

    return DeleteSpecimen;
});