/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'],
    function($, _, BaseModel) {
        "use strict";

        var MEAN_AQ_LENGTH = "meanAQReadLength",
        MEAN_READ_LENGTH = "meanReadLength",
        PERCENT_READS = "percentReads";
        
        var SampleQc = BaseModel.extend({
        
            url: '/ir/secure/api/assay/sampleQc',

            getMeanAQReadLength: function(){
                return this.get(MEAN_AQ_LENGTH);
            },
            
            setMeanAQReadLength: function(length){
                this.set(MEAN_AQ_LENGTH, length);
            },
            
            getMeanReadLength: function(){
                return this.get(MEAN_READ_LENGTH);
            },
            
            setMeanReadLength: function(length){
                this.set(MEAN_READ_LENGTH, length);
            },
            
            getPercentReads: function(){
                return this.get(PERCENT_READS);
            },
            
            setPercentReads: function(reads){
                this.set(PERCENT_READS, reads);
            }
        
        });

        return SampleQc;

    });
