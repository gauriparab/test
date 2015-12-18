/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/sampleAttribute' ],
    function(_, BaseCollection, SampleAttribute) {
        "use strict";
        var SampleAttributes = BaseCollection.extend({
            model : SampleAttribute,
            url: '/ir/secure/api/attributes/allNonObsoleteAttributes'
        });

        return SampleAttributes;
});

