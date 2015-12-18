
define([ "serveradapter" ], function( adapter) {
    var debug = true;
   
    var log = function(msg) {
	if (debug) console.log("directadapter: " + msg);
    };
    
    var port = "11000";
    var getHost =  function() {
	    // returns the host - may be overwritten in subclass
	    var host = window.location.host;
	    return host;
	};
	
    var host = getHost();
    log("Using directadapter adapter. Host is: "+host);
    var LocalAdapter = adapter.Adapter.extend({
	initialize : function(args) {
		adapter.Adapter.prototype.initialize.apply(this, [args]);
	},
	defaults : {
	    "name" : "direct adapter",
	    "base_url" : "http://"+host+":"+port,	   
	    "default_params" : ""
	},
	isIR: function() {
	    return false;
	},
	getHost: function() {
	    // returns the host - may be overwritten in subclass
	    var host = window.location.host;	    
	    return host;
	},
	constructGeneralUrl: function (module, method, variomeids, analysisids, filterchainid, parameters) {
	    var actualUrl = this.getBaseUrl()+"/"+ module+"/"+method+"?";
	//    log("constructGeneralUrl: base url is: "+actualUrl);
	    actualUrl = this.addParametersToUrl(actualUrl, variomeids, analysisids, filterchainid, parameters);
	    var host = this.getHost();
	    if (actualUrl.indexOf("mongoserver")<0) actualUrl += "&mongoserver="+host;
	//    log("constructGeneralUrl: fullURL " + actualUrl); 
	
	    return actualUrl;
	},
	addParamtersToUrl: function (actualUrl, pars) {	    
	    if (pars && pars.length >0) {
		actualUrl += "&"+ pars;				
	    }	   
	//    log("mordor: addParamtersToUrl: fullURL " + actualUrl);
	   
	    return actualUrl;
	},
	   
    });
    
    _.defaults(LocalAdapter.prototype.defaults, adapter.Adapter.prototype.defaults); 
 
    return {
	Adapter : LocalAdapter	
    };
});