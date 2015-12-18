/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'],
    function ($, _, BaseModel) {
    'use strict';

    var SpecimenFile = BaseModel.extend({
        urlRoot: '/ir/secure/api/v40/samplesFiles',
        toSlimJSON: function() {
            var json = _.clone(this.attributes);
            return _.pick(json, ['id', '_type']);
        }
    });

    return SpecimenFile;
});

