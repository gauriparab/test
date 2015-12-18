/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/monitor/instrument' ],
    function(_, BaseCollection, Instrument) {
        "use strict";
        var Instruments = BaseCollection.extend({
            model : Instrument
            //url: '/ir/secure/api/attributes/allNonObsoleteAttributes'
        });

        return Instruments;
});

