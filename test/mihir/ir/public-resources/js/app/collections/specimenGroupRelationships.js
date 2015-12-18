/*global define:false*/
define(['collections/BaseCollection', 'models/analysis/specimenGroupRelationshipModel'],
    function(BaseCollection, SpecimenGroupRelationship  ) {
        "use strict";
        

        var SpecimenGroupRelationshipCollection = BaseCollection.extend({
            url: '',
            model: SpecimenGroupRelationship
        });
        return SpecimenGroupRelationshipCollection;
    });
