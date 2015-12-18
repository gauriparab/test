/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'],
    function($, _, BaseModel) {
        "use strict";

        var Instrument = BaseModel.extend({
        
          //  urlRoot: '/ir/secure/api/assay/runQc',
            
        });

        return Instrument;

    });
