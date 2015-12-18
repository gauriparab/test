/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'],
    function($, _, BaseModel) {
        "use strict";

        var LibraryKitType = BaseModel.extend({
        
          //  urlRoot: '/ir/secure/api/v40/assay/libraryKitType',

            defaults: function() {
                return {
                    name: "Ion PGM Dx Library",
                    details: [{
                        name: "Forward library key",
                        value: "Ion TCAG"
                    }, {
                        name: "Forward 3' adapter",
                        value: "Ion P1B"
                    }]
                };
            }
        
        });

        return LibraryKitType;

    });
