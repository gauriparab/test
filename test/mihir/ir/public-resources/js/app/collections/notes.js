/*global define:false*/
define(['collections/BaseCollection', 'models/note'], function (BaseCollection, Note) {
    'use strict';
    var Notes = BaseCollection.extend({    	
    	
        model: Note,
        
        initialize:function(options){
        	this.url = options.url;
        }
    });
    return Notes;
});