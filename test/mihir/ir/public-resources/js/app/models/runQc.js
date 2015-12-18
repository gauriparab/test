/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'],
    function($, _, BaseModel) {
        "use strict";

        var KEY_SIGNAL = "keySignal",
        PERCENT_LOADING = "percentLoading";
        
        var RunQc = BaseModel.extend({
        
            urlRoot: '/ir/secure/api/assay/runQc',
            
            setKeySignal: function(keySignal){
                this.set(KEY_SIGNAL, keySignal);
            },
            
            getKeySignal: function(){
                return this.get(KEY_SIGNAL);
            },
            
            setPercentLoading: function(percentLoading){
                this.set(PERCENT_LOADING, percentLoading);
            },
            
            getPercentLoading: function(){
                return this.get(PERCENT_LOADING);
            }
        
        });

        return RunQc;

    });
