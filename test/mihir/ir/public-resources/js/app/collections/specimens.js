/*global define:false*/
define(['collections/BaseCollection', 'models/specimen'],
    function(BaseCollection, Specimen) {
        "use strict";

        var SpecimenCollection = BaseCollection.extend({
            model: Specimen,
            url: "/ir/secure/api/v40/workflows/specimenGroups"
        });
        return SpecimenCollection;
    });
