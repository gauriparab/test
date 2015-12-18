/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';

    var TSSpecimen = BaseModel.extend({
        urlRoot : '/ir/secure/api/v40/tsspecimens'
    });

    return TSSpecimen;
});