define([ "underscore", "jquery", "backbone", "multiviz/plugin/analysisplugin", "fusion/ui/fusionview", "adapter" ], function(_, $,
	Backbone, plugin, mysvg, adapter) {
    
    var debug = true;
    
    var log = function(msg) {	
	if (debug) {
	    var d = new Date(); 
	    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	    console.log("fusion.js "+time+" "+msg);
	}
    };

    var loadCss = function(filename) {
        // load style sheets
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
            log("Loaded CSS "+filename);
        }
    };
    
    var myadapter = new adapter.Adapter();
    loadCss(myadapter.getRoot()+"css/multiviz.css");
    
    
    var VisDataModel = {
	matrix : [], // entire heat map data
	dims : [], // names of dimensions
	locations : [],	
	genedata : [], // x-axis objects
	samples : [], // sample objects
	genes : [], // gene objects
	attributes : [], // possibly attributes (optional)
	nrsamples : 0,
	nratts : 0, // currently not used
	nrgenes : 0,
	yaxis_name : 'gene',
	score : 'fusion_strength',
	geneorders : [], // how we order genes (or x axis)
	sampleorders : [], // how to order samples
	samplelinkage : [], // sample linkage
	genelinkage : [], // sample linkage
	genedistorder : [], // order when clustering (nearest neighbor)
	sampledistorder : [], // order when clustering (nearest neighbor)
	heatmapdata : [], // data from server
	xrange : undefined, // x coordinate range
	yrange : undefined, // y coordinate range
	
	svg : undefined, // SVG PLOT
	variomes : undefined,
	curvariomes : undefined,
	curyax : undefined
    };
    var PageModel = {
	pagetype : "visualize", // if the page is for viewing or export
	isexport : false,
	server : "",
	ploturl : "", // the currently used url to compute the plot, used for
	labely : 0,	// //
	labelx : 0,
	tooltip : "",
	width : 600,
	height : 800,
	selectedvariomes : [],
	mongoserver : undefined,
	curserver : undefined,
	curmethodname : undefined,
	curframename : "geneframe",
	curydomain : "name", // current ordering of y axix
	curxdomain : "name", // current ordering of x axis
	analysis : undefined,
	allvariomes : [],
	margin : {
	    top : 120,
	    right : 50,
	    bottom : 100,
	    left : 200
	}
    };


    var vizdata = VisDataModel;
    var page = PageModel;

    var FusionPluginControl = plugin.PluginControl.extend({
	initialize : function(args) {
	    plugin.PluginControl.prototype.initialize.apply(this, [ args ]);
	},
	getAllParamters : function() {
	    return this.get("allparameters");
	},
	getCurxdomain : function() {
	    return page.curxdomain;
	},
	getCurydomain : function() {
	    return page.curydomain;
	}
    });
    

    function getListSeparator() {
	var list = [ 'a', 'b' ], str;
	if (list.toLocaleString) {
	    str = list.toLocaleString();
	    if (str.indexOf(';') > 0 && str.indexOf(',') == -1) { return ';'; }
	}
	return ',';
    }
    
    var FusionPlugin = plugin.Plugin.extend({
	initialize : function(args) {
	    this.dataloaded = false;
	    plugin.Plugin.prototype.initialize.apply(this, [ args ]);
	    // set variome and other data to vizdata.	
	    window.Plugin = this;
	    page.margin.left = 200;
	    vizdata.score ='fusion_strength';
	    page.curydomain = "id";
	    page.curxdomain = "distance";
	    page.width=600;
	   
	},
		
	defaults: {
	    "plugin_container" : "container-fusion",
	    "plugin_plot_container" : "container-fusion-plot",	
	    "plugin_control_container" : "container-fusion-control",
	    "plugin_svg_id" : "fusion-svg"
	}, 
	clearData: function() {
	    log("==============  Clearing old data points ===========");
	        vizdata.matrix = [], // entire heat map		
		vizdata.dims = [], // names of dimensions
		vizdata.genedata = [], // x-axis		
		vizdata.samples = [], // sample objects
		vizdata.genes = [], // gene objects
		vizdata.attributes = [], // possibly attributes (optional)
		vizdata.nrsamples = 0, vizdata.nratts = 0, // currently not		
		vizdata.nrgenes = 0, 
		vizdata.samplelinkage = [], // sample linkage
		vizdata.genelinkage = [], // sample linkage
		vizdata.genedistorder = [], // order when clustering (nearest		
		vizdata.sampledistorder = [], // order when clustering		
		vizdata.heatmapdata = [];
	},
	getPage: function() {
	    return page; 
	},
	getRoot: function() {
	    return myadapter.getRoot()+"genefusions/";
	},
	getVizData: function() {
	    return vizdata; 
	},
	
	setScoringFunction: function (score) {
	    vizdata.score = score;
	},
	getScoringFunction: function () {
	    return vizdata.score;
	},
	setCurxDomain: function (domain) {
	    page.curxdomain = domain;
	},
	setCuryDomain: function (domain) {
	    page.curydomain = domain;
	},
	setLoadDataFunction: function(methodToCall) {
	    this.loadDataFunction = methodToCall;
	    if (this.dataloaded) {
		this.variomeDataLoaded();
	    }
	},
	
	getCSV: function() {
	    log("getCSV");
		   
	    if (typeof vizdata == 'undefined'  || !vizdata.samples || !vizdata.genes) {
		alert("There is no data yet - please wait until the heat map has been computed");
	    }
	    var tab = getListSeparator();
	   
	    var csvContent = "";
	    if (vizdata.variomes) {

		var csvContent = "Selected variomes: " + tab;

		for (var i = 0; i < vizdata.variomes.length; i++) {
		    csvContent += vizdata.variomes[i].sample + tab;
		}
		csvContent += "\n";
	    }

	    log("Got samples: "+csvContent);
	    	   
	    csvContent += "\n\Fusion data" + tab;
	    for (var s = 0; s < vizdata.samples.length; s++) {
		csvContent += vizdata.samples[s].name + tab;
	    }
	    csvContent += "\n";
	    
	    log("Processing "+ vizdata.genedata.length+  " fusions");
    	    for (var g = 0; g < vizdata.genedata.length; g++) {
    		csvContent += vizdata.genedata[g] + tab;
    		for (var s = 0; s < vizdata.samples.length; s++) {
    		    var point = vizdata.matrix[g][s];
    		    csvContent += point.z + tab;
    		}
    		csvContent += "\n";
    	    }    
    	   
	    log("Got result: "+csvContent.length);
	    return csvContent;
	},
	
	
	variomeDataLoaded: function() {
	    this.dataloaded = true;
	    vizdata.variomes = this.getVariomes();
	    log("FusionPlugin.variomeDataLoaded: Got variomes: "+(vizdata.variomes.length));
	    //log("Loading data with model="+JSON.stringify(window.Plugin));
	    //log("Loading data with this="+JSON.stringify(this));
	    if (this.loadDataFunction) this.loadDataFunction(this);	  
	    
	    
	},
    });

    _.defaults(FusionPlugin.prototype.defaults, plugin.Plugin.prototype.defaults); 
	
    var FusionPluginPlotView = plugin.PluginPlotView.extend({
	initialize : function(args) {
	    plugin.PluginPlotView.prototype.initialize.apply(this, [ args ]);
	  //  log("FusionPluginPlotView.init, passing model to SvgCanvas: "+JSON.stringify(this.model));
	   
	 //   log("Creating svgcanvas");
	    this.svgCanvas = new mysvg.SvgCanvas({
		model : this.model
	//	vizdata: vizdata
	//	page: page
	    });
	//    log("svgcanvas init done");
	},
	render : function() {
	  //  log("FusionPluginPlotView.render: this.plugin_plot_container="+this.plugin_plot_container);
	    this.$el.prepend(this.svgCanvas.render().el);
	    
	    $("#" + this.plugin_plot_container).html(this.$el.html());
	//    log("html="+this.$el.html());
	    return this;
	}	
    });

    var FusionPluginControlView = plugin.PluginControlView.extend();
    
    var FusionPluginView = plugin.PluginView.extend({
	initialize : function(args) {
	    vizdata.variomes = this.model.getVariomes();
	    this.model.currentView = this;
	    plugin.PluginView.prototype.initialize.apply(this, [ args ]);
	    
	    page.tooltip = this.getToolTip();
	    log(" ========= init page.tooltip:"+page.tooltip);
	   // log("FusionPluginView.init :model: "+JSON.stringify(this.model));
	},	
	createLayout : function() {
	  //  log("FusionPluginView.createLayout called. this.model="+JSON.stringify(this.model));	  
	    var pluginControlView = new FusionPluginControlView({
		model : this.model
	    });
	    pluginControlView.render();
	    	   
	    // we render AFTER we got the data. so GET DATA FIRST
	 //   log("FusionPluginView.createLayout. need to get data first from server, THEN call afterGotData ");
	    this.model.setLoadDataFunction(this.loadData);	   
	},
	
	loadData: function(model) {
	  //  log("LoadData with model="+JSON.stringify(model));
	    //log("need to get ids from this");
	    var variomeids = [];
	    for ( var v in vizdata.variomes) {
		    // each one has		    
		   // var v = new Variome({ "id": item.variome, "index" : item.index, "sample" : item.sampleName});
		var item = vizdata.variomes[v];
		variomeids.push(item.get("id"));
	    }
	    log("FusionPluginView.loadData: Got variome ids: "+JSON.stringify(variomeids)+", lenght is "+variomeids.length);
	    if (variomeids.length < 1) {
		window.showMessage("No variomes for the given analyses were found. Using test variomes for now");
		variomeids = [];
		// TEST DATA
		for (var i = 1; i < 10; i++) {
			variomeids.push(i);
		}
		log("Generating test variome ids "+JSON.stringify(variomeids));
	    }
	   
	    document.body.style.cursor = 'wait';
	   	    
	  //  console.log("Got myadapter: "+JSON.stringify(myadapter));
	    var afterGotData = function(data) {
		// log("FusionPluginView.loadData: afterGotData: "+JSON.stringify(data));
		 mysvg.hideLoading();
		 document.body.style.cursor = 'auto';		  		   
		    vizdata.heatmapdata = data;
		    var pluginPlotView = new FusionPluginPlotView({
			model : model
		    });
		    pluginPlotView.render();
	//	    log("FusionPluginView =============== AFTER CALLING PLUGINPLOTVIEW.RENDER ============= ");
		};
	    // function(module, method, variomeids, analysisids, filterchainid, parameters, callback) {
		window.showLoading("Loading gene fusion data...");
		var filter = model.getFilterQuery();
		var params;
	        if (filter && filter.length > 0) params = "varfilter="+filter;
	        else params = "";
	        log("afterGotData: Got varfilter :"+filter);
	        if (model.getChromosomeFilter()) {
	            params += "&chr="+model.getChromosomeFilter();
	            log("Got chromosome filter: params="+params);
	        }
	        else log("Got NO chromosome filter");
	   myadapter.ajax("allStats", "FusionEffects", variomeids,  null, model.getFilterChainId(), params, afterGotData);
	    
	},
	
    });

    return {
	PluginView : FusionPluginView,
	Plugin : FusionPlugin,	
	PluginControl : FusionPluginControl,
	PluginPlotView : FusionPluginPlotView
    };

});
