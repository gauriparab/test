
define([ "jquery", "deepmodel" ], function($,  Backbone) {

    var debug = true;
    var log = function(msg) {
	if (debug) console.log("variomemodel: " + msg);
    };
    
    var allanalyses = [];
    
    var Variome = Backbone.DeepModel.extend({
	defaults : {
	    "id": "",
	    "index" : 0,
	    "samplename" : "no sample",
	    "analysis": undefined,
	    "sample": undefined
	},
	initialize : function(args) {},
	getId : function() {
	    return this.get("id");
	},
	getIndex : function() {
	    return this.get("index");
	},
	getAnalysis : function() {
	    return this.get("analysis");
	},
	getSample : function() {
	    return this.get("sample");
	},
	getSampleName : function() {
	    return this.get("samplename");
	},
	getAnalysisIds : function() {
	    return this.get("analysisIds");
	},
	setAnalysis : function(analysis) {
	    this.set({
		"analysis" : analysis
	    });
	},
	setAnalysisIds : function(analysisIds) {
	    this.set({
		"analysisIds" : analysisIds
	    });
	}	
    });

    var Analysis = Backbone.DeepModel.extend({
	defaults : {
	    "id": "1234",
	    "name" :  "unknown",
	    "workflow" :  "unknown",
	    "type" :  "unknown",
	    "samples" :  [],
	    "createdOn" : ""	    
	},
	initialize : function(args) {},
	getId : function() {
	    return this.get("id");
	},
	getCreatedOn : function() {
	    return this.get("createdOn");
	},
	getSamples : function() {
	    return this.get("samples");
	},
	getSample: function(name) {
	    var samples = this.getSamples();
	    if (samples && samples.length >0) {
	//	log("Get sample with name "+name+" from analysis");
		for (var i = 0; i < samples.length; i++) {
		    var s = samples[i];
		    if (s.getName() === name) {
			return s;
		    }
		}
		log("Found no sample with name "+name);
	    }
	    return null;
	},
	getName : function() {
	    return this.get("name");
	},
	getType : function() {
	    return this.get("type");
	},
	getWorkflow : function() {
	    return this.get("workflow");
	},
	getId : function() {
	    return this.get("id");
	},
	
    });
    // "attributeValueMap":{
    //	"Gender":"Male"
    //}
    var Sample = Backbone.DeepModel.extend({
	defaults : {
	    "id": "1234",
	    "name" :  "unknown",
	    "gender" :  "unknown",	    
	    "createdOn" : ""	    
	},
	initialize : function(args) {},
	getId : function() {
	    return this.get("id");
	},
	getCreatedOn : function() {
	    return this.get("createdOn");
	},	
	getName : function() {
	    return this.get("name");
	},
	getGender : function() {
	    return this.get("gender");
	},	
	getId : function() {
	    return this.get("id");
	},
	
    });
    var loadAllVariomes = function(adapter, analysisIds, callback) {
	log("====== loadAllVariomes");
	loadVariomes(adapter, [], callback);
    };
    var loadAnalysis = function(adapter, analysisId) {
	
	analysis = {};
	document.body.style.cursor = 'wait';
	log("====== loadAnalysis "+analysisId);
	var mycallback = function(json) {
	    	document.body.style.cursor = 'auto';
	    	if (!json || json.length < 1) {		  
	    	    var rand = Math.floor(Math.random()*5+1);
		    log("No matching analyses were found for analyis ids " + analysisId + " on server " + adapter.getHost() );
		    analysis = new Analysis({ "id": "the id", "name" : "analysis name "+rand, "workflow" : "workflow name", 
	    		"type": "the type", "createdOn" : "a date"});
		}	    	
	    	else {
	    	    try {
	    		
	    	// specimenGroup.members.specimen.id
	    	// specimenGroup.members.specimen.createdOn
	    	// specimenGroup.members.specimen.createdOn
	    		var samples = [];
	    		if (json.specimenGroup) {
	    		    var members = json.specimenGroup.members;
	    		    if (members) {
	    			//log("Got member: "+JSON.stringify(members));
	    			for (var i = 0; i < members.length; i++) {
	    			    var s = members[i].specimen;
	    			    var gender ="?";
	    			    if (s.attributeValueMap) {
	    				log("Sample atts: "+JSON.stringify(s.attributeValueMap));
	    				gender = s.attributeValueMap["Gender"];
	    			    }
	    			    var sample = new Sample({ "id": s.id, "name" : s.name, "gender" : gender, "createdOn" : s.createdOn});
	    			    //log("Got sample: "+sample.name+", createdOn="+sample.createdOn);
	    			    samples.push(sample);	    			 
	    			}	    			
	    			
	    		    }
	    		}
	    		var an = json.name;
	    		an = an.replace(/_/g, " ");
	    		var wf = json.workflow.name;
	    		wf = wf.replace(/_/g, " ");
	    		analysis = new Analysis({ "id": json.id, "name" : an, "workflow" : wf, 
	    		"type": json.applicationType, "createdOn" : json.createdOn, "samples" : samples});
	    	    }
	    	    catch (err) {
	    		log("Could not create analysis object :"+err);
	    		analysis = new Analysis({ "id": "the id", "name" : "analysis name", "workflow" : "workflow name", 
	    		"type": "the type", "createdOn" : "a date"});
	    	    }
	    	}
		log("Got analysis with name= "+analysis.getName()+", wf="+analysis.getWorkflow());
	};
	 var host = window.location.host;
	 //https://teemo.itw/ir/secure/api/v40/analysis/ff80818145b697e30145b69b1057000c
	 if (host.indexOf("localhost")<0) {
	     var url = "https://"+host+"/ir/secure/api/v40/analysis/"+analysisId;
	     adapter.ajaxSimple(url, mycallback);
	 }
	 else {
	     log("Cannot get analysis from localhost");
	     mycallback(null);
	 }
	 return analysis;
    };
    var loadAnalyses = function(adapter, analysisIds) {
	// in a real environment, we have to use the same server as the actual analyses are from
	// maybe store in adapter
	log("Loading analysis with ids: "+analysisIds);
	allanalyses = [];
	document.body.style.cursor = 'wait';
	if (analysisIds) {	    
		analysisIds = String(analysisIds).split(",");
        	for (var i = 0; i < analysisIds.length; i++  ) {
        	    var analysis = loadAnalysis(adapter, analysisIds[i]);
        	    allanalyses.push(analysis);
        	}
	    
	}
	else log("Got no analyisIds");
	return allanalyses;
    };   
    var loadVariome = function(adapter, analysisId, analysis) {
	// in a real environment, we have to use the same server as the actual analyses are from
	// maybe store in adapter
	var avariomes = [];
	log("====== loadVariome for analysis "+analysisId);
	var mycallback = function(json) {
	    	if (!json || json.length < 1) {		  
		    log("No matching variomes were found for analyis id " + analysisId + " on server " + adapter.getHost() );
		}
	    	else {
	    	    //log("Got variomes for one analysis: "+JSON.stringify(json));
    			for ( var v in json) {
    			    
    			    var item = json[v];
    			    var samplename = item.sampleName;
    			    var sample = analysis.getSample(samplename);
    			    var variome = new Variome({ "id": item.variome, "index" : item.index, "samplename" : samplename, "sample" : sample});    			   
    			    if (v % 20 == 0) {
    				log("Got variome: index="+item.index+", id="+variome.getId()+", samplename="+variome.getSampleName());
    				if (sample) {
    				    log("Got sample: "+JSON.stringify(sample));
        			}
    				else log("Got no sample");
    			    }
    			   
    			        			    avariomes.push(variome);
        		}
	    	}
		document.body.style.cursor = 'auto';		
	};
	// function(module,       method,           variomeids, analysisids, filterchainid, parameters, callback) {
	var json = adapter.ajaxsynch("allStats", "analysisVariomes", null,       analysisId, null,  null);
	//log("loadVariome: got result: "+json);
	mycallback(json);
	return avariomes;
    };
    var loadVariomes = function(adapter, analysisIds, callback) {
	// in a real environment, we have to use the same server as the actual analyses are from
	// maybe store in adapter
	allvariomes = [];
	log("============  loadVariomes ================");
	log("Loading analyses with ids "+analysisIds);
	if (!analysisIds) {
	    log("Got no analysis ids");
	}
	else {
	    	analysisIds =  String(analysisIds).split(",");
	    	log("Got analysis ids: "+analysisIds+", length="+analysisIds.length)
        	allanalyses =  loadAnalyses(adapter, analysisIds);	
        	document.body.style.cursor = 'wait';
        	window.showLoading("Loading variant information...");
        	for (var i = 0; i < analysisIds.length; i++  ) {
        	    var avariomes = loadVariome(adapter, analysisIds[i], allanalyses[i]);
        	    if (avariomes) {
        		log("Got variomes for one analysis: "+avariomes.length);
        		for (var j = 0; j < avariomes.length; j++  ) {
        		    var v = avariomes[j];
        		    
        		    allvariomes.push(v);
        		    if (allanalyses.length > i &&  allanalyses[i]){
        			v.setAnalysis(allanalyses[i]);
        			//log("    analysis of variome is :"+v.getAnalysis().getName());
        		    }
        		    //else log("Could not assing analysis to variome");
        		}
        	    }
        	    else log("Got no variomes for id "+analysisIds[i]);
        	}
        	window.hideLoading();
        	document.body.style.cursor = 'auto';
	}
	log("End of loadVariomes: got "+allvariomes.length+" variomes");
	if (callback) callback( allvariomes);
    };
    return {
	Variome : Variome,
	loadVariomes: loadVariomes,
	loadAllVariomes: loadAllVariomes
    };
});