define([ "jquery", "backbone", "multiviz/plugin/plugin",  "multiviz/model/variomemodel", "adapter", "multiviz/model/mongofilter"], 
	function($, Backbone, plugin,  variome, adapter, mongofilter) {  
    
    var myadapter = new adapter.Adapter();
    console.log("===============  Loading analysisplugin.js. Adapter is "+myadapter.getName()+", "+JSON.stringify(myadapter));
    
    var debug = true;

    var log = function(msg) {
	if (debug) console.log("AnalysisPlugin: "+msg);
    };

    var AnalysisPluginPlot = plugin.PluginPlot.extend({	
	defaults : {
	    "width" : 600,
	    "height" : 1000,
	    margin : {
		top : 200,
		right : 0,
		bottom : 20,
		left : 350
	    }
	}	
    });
    
    var AnalysisPluginControl = plugin.PluginControl.extend();
    
    $( document ).ready(function() {
	// setTimeout(function(){	     
	        if( $('#exportIGV').length )  {
	    		log("We already added download actions");	
	        }
	        else {
	        	var ul = $("#exportAllVariants").parent().parent();	  
	        	ul.append('<li><a title="Open all selected analyses in IGV (in one view)" id="exportIGV">Open in IGV</a></li>');
	        	log("Appending exportIGV to download: "+ul);
	        	$("#exportIGV").click(function() {
	        	    window.Plugin.launchIGV();
	        	});	        		        		     	 
	       }
	// }, 2000    
   });
    
    var AnalysisPlugin = plugin.Plugin.extend({
	initialize : function(args) {
	    log("==============================  new AnalysisPlugin created");
	    plugin.Plugin.prototype.initialize.apply(this, [ args ]);
	    this.filter = new mongofilter.MongoFilter();
	    this.currentView = undefined;
	    this.addDownloadActions();
	    this.clearData();
	    
	},
	defaults : {
	    "analysis" : [],
	    "variomes" : []    	
	},	
	getBaseUrl : function() {
	    return myadapter.getBaseUrl();
	},	
	getAnalysisIds : function() {
	    return this.get("analysis");
	},
	setAnalysisIds : function(analysisIds) {
	    log("setAnalysisIds called with ids "+analysisIds);
	    if(typeof analysisIds != 'undefined') { 
        	    this.set({
        		"analysis" : analysisIds
        	    });
        	    var me = this;
        	    var callback = function(variomes) {
        		me.setVariomes(variomes);
        		me.variomeDataLoaded();
        	    };	    
        	    variome.loadVariomes(myadapter, analysisIds,  callback);
	    }
	    else {
		// window.showLongMessage("The plugin got no analysis ids from
		// the UI. The ids are undefined");
		window.alert("The plugin got no analysis ids from the UI. The ids are undefined");
	    }
	},
	clearData: function() {
	    log("overwrite: clearing all vizdata");
	},
	reload: function() {
	    log("==============================================================================");
	    log("============================== RELOAD CALLED ================================");
	    try {
		$("#" + this.plugin_container).remove();	
		this.clearData();
		this.dataloaded = false;
	    }
	    catch (err) {
		log("Problem clearing old data: "+err);s
	    }
	    if (this.currentView) {
		log("Calling variomeDataLoaded");		
		this.variomeDataLoaded();		
		// this.currentView.render();
	    }
	    else {
		log("RELOAD: NO currentview yet, not doing anything. Got analysisids: "+this.getAnalysisIds());
		// this.setAnalysisIds(this.getAnalysisIds());
	    }
	},
	variomeDataLoaded: function() {
	    log("Overwrite variomeDataLoaded");
	},
	getFilterQuery : function() {
	    if (!this.get("filter")) return null;
	    else return this.get("filter").getCompleteQuery();
	},	
	getMongoFilter : function() {
	    return this.filter;
	},
	getFilterId: function() {
	    return this.filter.getId();
	},
	setFilterId : function(filterid) {
	    log("Got filterID from IR: "+filterid);
	    this.filter.setId(filterid);	
	    // this.reload();
	},
	getFilterChainId: function() {
	    return this.filter.getId();
	},
	setFilterChainId : function(filterid) {
	    
	    this.filter.setId(filterid);	
	    // this.reload();
	},
	setChromosomeFilter : function(chr) {
	    log("========== setChromosomeFilter "+chr+" called");	    
	    this.filter.setChromosome(chr);	
	   // this.reload();
	},
	getChromosomeFilter: function() {
	    return this.filter.getChromosome();
	},
	setSampleBitset : function(bitset) {	    	    
	    this.filter.setSampleBitset(bitset);	   
	},
	setFilterQuery : function(query) {
	    log("========== setFilterQuery called with query:\n"+query);
	    this.filter.setQuery(query);
	    this.reload();
	},
	getVariomes : function() {
	    return this.get("variomes");
	},	
	setVariomes : function(variomes) {
	    this.set({
		"variomes" : variomes
	    });
	},
	
	addDownloadActions: function() {	  
	    if( $('#exportIGV').length )  {
		log("We already added download actions");
		return;
	    }
	
	    var ul = $("#exportAllVariants").parent().parent();	  
	    ul.append('<li><a title="Open all selected analyses in IGV (in one view)" id="exportIGV">Open in IGV</a></li>');
	    log("Got UL: "+ul);
	  	   
	},
	launchIGV: function(locus) {
   	    log("============ TEST Starting IGV ============");
	    // callIGV(locus, analysis_dir, servlet_url, authtoken)
	    var plugin = window.Plugin;
	    var analyses = plugin.getAnalysisIds();
	    log("Got analyisis ids from plugin: " + analyses + ", need to get folders");
	    window.showLoading("Loading IGV....");
	    // so that we can test on LOCALHOST as well...
	    // var infourl =
	    // 'https://teemo.itw/ir/secure/api/v40/igvlaunchinfo?analysis=ff808181441dba26014428a5f9e00036&_=1394612276331
	    var infourl = 'https://'+window.location.host+'/ir/secure/api/v40/igvlaunchinfo';
	    var folders = [];
	    var token = "NoMoreIgvTroubles";
	    var idlist = [];
	    if (typeof analyses === 'string') {
		idlist = analyses.split(',');
	    } else idlist = analyses;
	    log("Got idlist: " + idlist);
	    for (id in idlist) {
		log("Getting igv launch info for id " + idlist[id]);
		log("URL: "+infourl);
		$.ajax({
		    async : false,
		    type : "GET",
		    dataType : "json",
		    url : infourl,
		    data : {
			analysis : idlist[id]
		    },
		    success : function(json) {
			console.log("============= Got igvlaunch info: " + JSON.stringify(json));
			folders.push(json.path);
			token = json.token;

		    },
		    parseerror : function(result) {
			console.log("Parsing error: " + JSON.stringify(result));

		    },
		    error : function(result) {
			console.log("Got an error: " + JSON.stringify(result));
		    }
		});

	    }
	    log("Now we have all folders: " + folders);
	    window.hideLoading("Loading IGV....");
	    var curlocus = "All";
	    if (locus ) curlocus = locus;
	    // use current host... or of local, just teemo
	    var host = myadapter.getHost();
	  
	    window.igv.callIGV(curlocus, folders, "https://"+host+"/IgvServlet/igv", token);		
	}
	
    });

    var AnalysisPluginControlView = plugin.PluginControlView.extend({
	initialize : function(args) {
	    plugin.PluginControlView.prototype.initialize.apply(this, [ args ]);
	    this.id = this.model.get("plugin_control_container");
	},
	render : function() {
	    $("#" + this.id).load(this.model.getRoot()+"control.html", function() {
		// log("AnalysisPluginControlView: control load was performed");
		
	    });
	    return this;
	}
    });
    
    _.defaults(AnalysisPlugin.prototype.defaults, plugin.Plugin.prototype.defaults); 

    return {
	PluginView : plugin.PluginView,
	Plugin : AnalysisPlugin,
	PluginPlot : AnalysisPluginPlot,
	PluginControlView : AnalysisPluginControlView,
	PluginControl : AnalysisPluginControl,
	PluginPlotView : plugin.PluginPlotView
    };

});
