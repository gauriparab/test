define([ "jquery", "bootstrap", "deepmodel" ], function($, bootstrap, Backbone) {

    var debug = true;
    var log = function(msg) {
	if (debug) {
	    var d = new Date();
	    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	    console.log("serveradapter " + time + " " + msg);
	}
    };

    var ALTERNATE_VARIOMEIDS_PASSING = true;

    var Adapter = Backbone.DeepModel.extend({
	defaults : {
	    "name" : "regular server adapter",
	    "base_url" : "",
	    "default_params" : ""
	},
	initialize : function(args) {},
	getBaseUrl : function() {
	    return this.get("base_url");
	},
	getDefaultParams : function() {
	    return this.get("default_params");
	},

	getName : function() {
	    return this.get("name");
	},

	setDefaultParams : function(params) {
	    this.set({
		"default_params" : params
	    });
	},
	setName : function(name) {
	    this.set({
		"name" : name
	    });
	},
	getHost : function() {
	    // returns the host - may be overwritten in subclass
	    return window.location.host;
	},
	setBaseUrl : function(url) {
	    this.set({
		"base_url" : url
	    });
	},
	isIR : function() {
	    return true;
	},
	getRoot : function() {
	    return "/ir/plugins/multiviz/";
	},
	addAnalysisIdsToUrl : function(actualUrl, analysisids) {
	    var first = true;
	    if (analysisids && analysisids.length > 0) {
		ids = [];
		// check if string
		if (typeof analysisids === 'string') {
		    analysisids = [ analysisids ];
		}
		for (i in analysisids) {
		    aid = analysisids[i];
		    ids.push(aid);
		    // log("Got aid:"+aid);
		}
		if (!first) actualUrl += "&";
		first = false;

		actualUrl += "analysisids=" + ids;
	    }
	    return actualUrl;
	},
	addParametersToUrl : function(actualUrl, variomeids, analysisids, filterchainid, parameters) {
	    var first = true;
	    log("Got variome ids: "+variomeids);
	    if (variomeids && variomeids.length > 0) {
		if (typeof variomeids === 'string') {
		    variomeids = [ variomeids ];
		}
		if (typeof variomeids === 'number') {
		    variomeids = [ variomeids ];
		}

		if (ALTERNATE_VARIOMEIDS_PASSING) {
		    log("Passing variome ids via parameters (workaround)");
		    for (id in variomeids) {
			if (!parameters || parameters.length < 1) {
			    parameters = "";
			} else if (first) parameters = parameters + '&';

			if (!first) {
			    parameters += ",";
			} else parameters += "variomeids=";

			first = false;
			var v = variomeids[id];
			if (typeof v === 'string') {
			    v = v.replace(/_/g, "UNDER");
			}
			parameters += "" + v;

		    }
		    // log("Parameters is now: "+parameters);
		} else {
		    log("Passing variome ids the normal way");
		    for (id in variomeids) {
			if (!first) actualUrl += "&";
			first = false;
			actualUrl += "variomeids=" + variomeids[id];
		    }
		}
	    }
	    if (analysisids && analysisids.length > 0) {
		ids = [];

		// check if string
		if (typeof analysisids === 'string') {
		    analysisids = [ analysisids ];
		}
		for (i in analysisids) {
		    aid = analysisids[i];
		    ids.push(aid);
		    // log("Got aid:"+aid);
		}
		if (!first) actualUrl += "&";
		first = false;

		actualUrl += "analysisids=" + ids;
	    }

	    if (filterchainid && filterchainid.length > 0) {
		if (!first) actualUrl += "&";
		first = false;
		actualUrl += "filterchainid=" + filterchainid;
	    }
	    if (parameters && parameters.length > 0) actualUrl = this.addParamtersToUrl(actualUrl, parameters);
	    if (this.setDefaultParams() && this.setDefaultParams().length > 0) {
		if (!first) actualUrl += "&";
		actualUrl += this.setDefaultParams();
	    }
	    return actualUrl;
	},
	constructGeneralUrl : function(module, method, variomeids, analysisids, filterchainid, parameters) {

	    var actualUrl = this.getBaseUrl() + "/" + module + "/" + method + "?";

	    // log("constructGeneralUrl: base url is: "+actualUrl+", got
	    // variomeids: "+variomeids+", type="+(typeof variomeids));
	    actualUrl = this.addParametersToUrl(actualUrl, variomeids, analysisids, filterchainid, parameters);
	    // log("constructGeneralUrl: fullURL " + actualUrl);
	    return actualUrl;
	},
	addParamtersToUrl : function(actualUrl, pars) {
	    log("addParamtersToUrl " + pars);
	    if (pars && pars.length > 0) {
		pars = pars.replace(/&/g, "_A_");
		actualUrl += "&parameters=" + pars;
		log("adding parmaters. URL is now: " + actualUrl);
	    }

	    // log("addParamtersToUrl: fullURL " + actualUrl);
	    return actualUrl;
	},
	ajaxsynch : function(module, method, variomeids, analysisids, filterchainid, parameters) {
	    // compute actual url and arguments
	    var actualUrl = this
		    .constructGeneralUrl(module, method, variomeids, analysisids, filterchainid, parameters);

	    // log("Calling SYNCH: "+actualUrl);
	    var result = "error";
	    $.ajax({
		async : false,
		type : "GET",
		dataType : "json",
		url : actualUrl,
		success : function(json) {
		    result = json;
		},
		parseerror : function(json) {
		    log("Parsing error: " + JSON.stringify(json));
		    result = json;
		},
		error : function(json) {
		    log("Got an error: " + JSON.stringify(json));
		    result = json;
		}
	    });
	    return result;
	},
	ajax : function(module, method, variomeids, analysisids, filterchainid, parameters, callback) {
	    // compute actual url and arguments
	    var actualUrl = this
		    .constructGeneralUrl(module, method, variomeids, analysisids, filterchainid, parameters);
	    // log("Calling ASYNCH: "+actualUrl);
	    $.ajax({
		async : true,
		type : "GET",
		dataType : "json",
		url : actualUrl,
		success : function(json) {
		    if (json.message) {
			// show message that is in the data structure from the
			// server
			window.showLongMessage(json.message);
		    }
		    if (json.error) {
			// show message that is in the data structure from the
			// server
			window.showError(json.error);
		    }
		    if (json.warning) {
			// show message that is in the data structure from the
			// server
			window.showWarning(json.warning);
		    }
		    callback(json);
		},
		parseerror : function(result) {
		    log("Parsing error: " + JSON.stringify(result));
		    window.showError(result);
		    callback(result);
		},
		error : function(result) {
		    log("Got an error: " + JSON.stringify(result));
		    window.showError(result);
		    callback(result);

		}
	    });
	},

	ajaxSimple : function(url, callback) {
	    // log("ajaxSimple: calling "+url);
	    $.ajax({
		async : false,
		type : "GET",
		dataType : "json",
		url : url,
		success : function(json) {
		    callback(json);
		},
		parseerror : function(result) {
		    log("Parsing error: " + JSON.stringify(result));
		    callback(result);
		},
		error : function(result) {
		    log("Got an error: " + JSON.stringify(result));
		    callback(result);
		}
	    });
	}
    });

    return {
	Adapter : Adapter
    };
});