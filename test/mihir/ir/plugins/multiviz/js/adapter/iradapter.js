
define([  "serveradapter" ], function( adapter) {

    var host = window.location.host;
    console.log("Using IR adapter. Host is: "+host);
    
    var IRAdapter = adapter.Adapter.extend({	
	defaults : {
	    "name" : "ir adapter that goes through IR security", 
	    "base_url" : "https://"+host+"/ir/secure/multiviz/python",	    
	    "default_params" : ""
	}	
    });
   
    _.defaults(IRAdapter.prototype.defaults, adapter.Adapter.prototype.defaults); 

   
    return {
	Adapter : IRAdapter	
    };
});