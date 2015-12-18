
define([ "serveradapter" ], function( adapter) {
    var debug = true;
    
    //var mongoserver= "karl001.itw";
    //var mongoserver= "mordor.itw";
    //var mongoserver= "mordor.itw";
    //var mongoserver= "cherry.itw";
    var mongoserver= "think2.itw";
    //var mongoserver= "teemo.itw";
    //var mongoserver= "hourglass.itw";
    //var mongoserver= "yuandan008.itw";
    var log = function(msg) {
	if (debug) console.log("localadapter: " + msg);
    };
    var LocalAdapter = adapter.Adapter.extend({
	initialize : function(args) {
		adapter.Adapter.prototype.initialize.apply(this, [args]);
	},
	defaults : {
	    "name" : "localhost adapter",
	    "base_url" : "http://localhost:9001",	   
	    "default_params" : ""
	},
	getRoot: function() {
	    return "/plugins/multiviz/";
	},
	isIR: function() {
	    return false;
	},
	getHost: function() {
	    // returns the host - may be overwritten in subclass
	    var host = window.location.host;
	    if (host.indexOf("localhost")>-1) host = mongoserver;
	    return host;
	},
	constructGeneralUrl: function (module, method, variomeids, analysisids, filterchainid, parameters) {
	    var actualUrl = this.getBaseUrl()+"/"+ module+"/"+method+"?";
	 //   log("constructGeneralUrl: base url is: "+actualUrl);
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
	    return actualUrl;
	},
	   
    });
    
    _.defaults(LocalAdapter.prototype.defaults, adapter.Adapter.prototype.defaults); 
 
    return {
	Adapter : LocalAdapter	
    };
});