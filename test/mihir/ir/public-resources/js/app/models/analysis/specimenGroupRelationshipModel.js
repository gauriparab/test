/*global define:false*/
define([ 'underscore', 'models/baseModel' ], function(_, BaseModel) {
    "use strict";
    var SpecimenGroupRelationship = BaseModel.extend({

        url: '',
        
        defaults: {
            specimen: null,
            group: null,
            role: 'NONE'
        },

        toSlimJSON: function() {
            var json = _.clone(this.attributes);
            json.specimen = this.attributes.specimen && _.pick(this.attributes.specimen, 'id') || null;
            return json;
        }

    });

    return SpecimenGroupRelationship;
});
