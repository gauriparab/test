
define([ "jquery", "deepmodel", "adapter" ], function($,  Backbone, adapter) {

    var debug = true;
    var log = function(msg) {
	if (debug) console.log("mongofilter: " + msg);
    };
    var myadapter = new adapter.Adapter();
    var MongoFilter = Backbone.DeepModel.extend({
	defaults : {
	    "id": "",
	    "query" : "",
	    "chromosome" : "",
	    // {012} refers to the intersection of 3 samples 1 2 and 3, 
	    // {01},{02} for (0 intersect 1) U (0 intersect 2), {0} for just sample 0  
	    "samplebitset" : "" 
	},
	initialize : function(args) {},
	getId : function() {
	    return this.get("id");
	},
	getQuery : function() {
	    return this.get("query");
	},
	getCompleteQuery : function() {
	    var q = this.get("query");
	    var c = this.getChromosome();
	    if (c && c.length > 0) {
		c = '{ "_id.c": "'+c+'"}';
		log("Chromosome filter: "+c);
		if (!q || q.length < 1) {
		    log("Only got chr filter: "+c);
		    return c;
		}
		else {
		   q = q +", "+c;
		   log("Got both, chr and query:"+q);
		   return q;
		}
	    }
	    return q;
	},
	getChromosome : function() {
	    return this.get("chromosome");
	},
	setId : function(id) {
	    
	    this.set({
		"id" : id
	    });
	    if (myadapter.isIR()) {
		log("IR adapter, not converting mongo id");
	    }
	    else { 
        	    log("Getting mongo version for "+id);
        	    var me = this;
        	    var callback = function(query) {
        		if (query) {
        		    log("Callback after toMongo, setting query to: "+query);
        		    me.setQuery(query);
        		}
        		else log("Could not get mongo query from id "+id);
        	    };	    
        	    
        	    toMongo(myadapter, id,  callback);
	    }
	},
	setQuery : function(query) {
	    this.set({
		"query" : query
	    });
	},	
	setChromosome : function(chromosome) {
	    log("setChromosome: "+chromosome);
	    this.set({
		"chromosome" : chromosome
	    });
	},
	setSampleBitset : function(bitset) {
	    // first, verify it!
	    log("Setting sample bit set: "+bitset+" ->  todo: VERIFY IT");
	    this.set({
		"samplebitset" : bitset
	    });
	},
    });

    var toMongo = function(adapter, filterhainid, callback) {
	log("====== toMongo. ");
	// in a real environment, we have to use the same server as the actual analyses are from
	// maybe store in adapter
	 var host = adapter.getHost(); // window.location.host;
	 var url = "https://"+host+"/ir/secure/multiviz/tomongo/"+filterhainid;
	 $.ajax({
		async : true,
		type : "GET",		
		dataType : "json",
		url : url,
		success : function(json) {
		    log("Got mongo filter: "+json);
		    callback(json);
		},
		parseerror : function(result) {
		    log("toMongo: parsing error: " + JSON.stringify(result));
		    callback();
		},
		error : function(result) {
		    log("toMongo: Got an error: " + JSON.stringify(result));
		    callback();

		}
	    });
	
    };
    return {
	MongoFilter : MongoFilter,
	toMongo: toMongo	
    };
});