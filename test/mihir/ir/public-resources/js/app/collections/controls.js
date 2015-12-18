/*global define:false*/
define([ 'collections/BaseCollection', 'models/control' ], function(BaseCollection, Control) {
        "use strict";
   var Controls = BaseCollection.extend({
	   model : Control,
    });

    return Controls;
});

