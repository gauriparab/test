/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/monitor/run' ],
    function(_, BaseCollection, Run) {
        "use strict";
        var Runs = BaseCollection.extend({
            model : Run,
            url: '/ir/secure/run/monitorPlans'
        });

        return Runs;
});

