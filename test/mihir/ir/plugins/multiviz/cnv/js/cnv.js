define([ "underscore", "jquery", "backbone", "multiviz/plugin/analysisplugin", "cnv/ui/cnvview", "adapter" ], function(_, $,
	Backbone, plugin, mysvg, adapter) {
    
    var debug = true;
    
    var log = function(msg) {	
	if (debug) {
	    var d = new Date(); 
	    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	    console.log("cnv.js "+time+" "+msg);
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
            //log("Loaded CSS "+filename);
        }
    };
    
    var myadapter = new adapter.Adapter();
    loadCss(myadapter.getRoot()+"css/multiviz.css");
    
    var VisDataModel = {
	matrix : [], // entire heat map data
	dims : [], // names of dimensions
	locations : [],
	effects : undefined,
	genedata : [], // x-axis objects
	samples : [], // sample objects
	genes : [], // gene objects
	attributes : [], // possibly attributes (optional)
	nrsamples : 0,
	nratts : 0, // currently not used
	nrgenes : 0,
	yaxis_name : 'gene',
	score : 'ploidy',
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
	curframename : "",
	curydomain : "name", // current ordering of y axix
	curxdomain : "distance", // current ordering of x axis
	analysis : undefined,
	allvariomes : [],
	margin : {
	    top : 120,
	    right : 50,
	    bottom : 80,
	    left : 220
	}
    };


    var vizdata = VisDataModel;
    var page = PageModel;

    var currentView = undefined;
    
    var CnvPluginControl = plugin.PluginControl.extend({
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
    
    var CnvPlugin = plugin.Plugin.extend({
	initialize : function(args) {
	    this.dataloaded = false;
	    plugin.Plugin.prototype.initialize.apply(this, [ args ]);
	    // set variome and other data to vizdata.	
	   window.Plugin = this;
	   page.margin.left = 220;
	   vizdata.score ='ploidy';
	   page.curydomain = "name";
	   page.curxdomain = "distance";
	   page.width=600;
	},
		
	defaults: {
	    "plugin_container" : "container-cnv",
	    "plugin_plot_container" : "container-cnv-plot",	
	    "plugin_control_container" : "container-cnv-control",
	    "plugin_svg_id" : "cnv-svg"
	}, 
	clearData: function() {
	    log("Clearing old data points");
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
	    return myadapter.getRoot()+"cnv/";
	},
	getVizData: function() {
	    return vizdata; 
	},
	setCnvTypeGene: function () {
	    vizdata.yaxis_name = "gene";
	},
	setCnvType: function (type) {
	    vizdata.yaxis_name = type;
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
		   
	    if (typeof vizdata == 'undefined' || !vizdata.effects || !vizdata.samples || !vizdata.genes) {
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
	    
	    csvContent += "\nCnv name:" + tab;
	    log("Got effects:"+vizdata.effects);
	    if (vizdata.effects) {
        	    for (var i = 0; i < vizdata.effects.length; i++) {
        		csvContent += vizdata.effects[i] + tab;
        	    }
	    
        	    csvContent += "\nCnv values:" + tab;
        	    for (var i = 0; i < vizdata.effects.length; i++) {
        		csvContent += i + tab;
        	    }
	    }
	    csvContent += "\n\Impact data" + tab;
	    for (var s = 0; s < vizdata.samples.length; s++) {
		csvContent += vizdata.samples[s].name + tab;
	    }
	    csvContent += "\n";
	    
	    try{
    	    log("Processing "+ vizdata.genedata.length+  " genes");
    	    for (var g = 0; g < vizdata.genedata.length; g++) {
    		csvContent += vizdata.genedata[g] + tab;
    		for (var s = 0; s < vizdata.samples.length; s++) {
    		    var point = vizdata.matrix[g][s];
    		    csvContent += point.z + tab;
    		}
    		csvContent += "\n";
    	    }
    
    	    if (vizdata.locations) {
            	    csvContent += "\n\nLocus name:" + tab;
            	    for (var i = 0; i < vizdata.locations.length; i++) {
            		csvContent += vizdata.locations[i] + tab;
            	    }
            	    csvContent += "\nLocus values:" + tab;
            	    for (var i = 0; i < vizdata.locations.length; i++) {
            		csvContent += i + tab;
            	    }
    	    
            	    csvContent += "\n\nLocus data" + tab;
            	    for (var s = 0; s < vizdata.samples.length; s++) {
            		csvContent += vizdata.samples[s].name + tab;
            	    }
            	    csvContent += "\n";
            	    for (var g = 0; g < vizdata.genedata.length; g++) {
            		csvContent += vizdata.genedata[g] + tab;
            		for (var s = 0; s < vizdata.samples.length; s++) {
            		    var point = vizdata.matrix[g][s];
            		    csvContent += point.v + tab;
            		}
            		csvContent += "\n";
            	    }
    	    	}
	    } catch (e ) {
		log("Got problem: "+e);
	    }
	    log("Got result: "+csvContent.length);
	    return csvContent;
	},		
	variomeDataLoaded: function() {
	    this.dataloaded = true;
	    vizdata.variomes = this.getVariomes();
	    //log("CnvPlugin.variomeDataLoaded: Got variomes: "+(vizdata.variomes.length));
	    if (this.loadDataFunction) this.loadDataFunction(this);	  	    	    
	},
    });

    _.defaults(CnvPlugin.prototype.defaults, plugin.Plugin.prototype.defaults); 
	
    var CnvPluginPlotView = plugin.PluginPlotView.extend({
	initialize : function(args) {
	    plugin.PluginPlotView.prototype.initialize.apply(this, [ args ]);
	    this.svgCanvas = new mysvg.SvgCanvas({
		model : this.model
	    });
	    this.model.on("change", this.render, this);
	    this.model.currentView = this;
	},
	render : function() {
	    log("=========  CnvPluginPlotView.render: this.plugin_plot_container="+this.plugin_plot_container);
	    this.$el.prepend(this.svgCanvas.render().el);
	    
	    $("#" + this.plugin_plot_container).html(this.$el.html());
	//    log("html="+this.$el.html());
	    return this;
	}	
    });

    var CnvPluginControlView = plugin.PluginControlView.extend();
    
    

    var CnvPluginView = plugin.PluginView.extend({
	initialize : function(args) {
	    vizdata.variomes = this.model.getVariomes();
	    
	    plugin.PluginView.prototype.initialize.apply(this, [ args ]);
	   
	    page.tooltip = this.getToolTip();
	//    log(" ========= init page.tooltip:"+page.tooltip);
	   // log("CnvPluginView.init :model: "+JSON.stringify(this.model));
	},	
	createLayout : function() {
	  //  log("CnvPluginView.createLayout called. this.model="+JSON.stringify(this.model));	  
	    var pluginControlView = new CnvPluginControlView({
		model : this.model
	    });
	    pluginControlView.render();
	    	   
	    // we render AFTER we got the data. so GET DATA FIRST
	 //   log("CnvPluginView.createLayout. need to get data first from server, THEN call afterGotData ");
	    this.model.setLoadDataFunction(this.loadData);	   
	},
	
	loadData: function(model) {
	    var variomeids = [];
	    for ( var v in vizdata.variomes) {
		    // each one has		    
		   // var v = new Variome({ "id": item.variome, "index" : item.index, "sample" : item.sampleName});
		var item = vizdata.variomes[v];
		variomeids.push(item.get("id"));
	    }
	    log("CnvPluginView.loadData: Got variome ids: "+JSON.stringify(variomeids));
	    if (variomeids.length < 1) {
		mysvg.showMessage("There are no variomes for the given analyses. Test variomes will be used");
		variomeids = [];
		
		for (var i = 1; i < 9; i++) {
		    variomeids.push(i);
		}
		log("Generating test variome ids "+JSON.stringify(variomeids));
	    }
	        // neede for screenshot later
	    document.body.style.cursor = 'wait';
	   	    
	    var afterGotData = function(data) {
		 //log("CnvPluginView.loadData: afterGotData");
		 mysvg.hideLoading();
		 document.body.style.cursor = 'auto';
		   // log("afterGotData: Got data now: "+JSON.stringify(data));		    
		    vizdata.heatmapdata = data;
	//	    log("creating CnvPluginPlotViewwith ");
		    var pluginPlotView = new CnvPluginPlotView({
			model : model
		    });
		    pluginPlotView.render();
	//	    log("CnvPluginView =============== AFTER CALLING PLUGINPLOTVIEW.RENDER ============= ");
		};
           mysvg.showLoading("Loading CNV heat map data...");
           
           
           var filter = model.getFilterQuery();
           if (filter && filter.length > 0) {
               filter = "&varfilter="+filter;
               log("Got varfilter :"+filter);
           }
           else filter = "";
           
           
           var params = "&score="+vizdata.score+filter;
           if (model.getChromosomeFilter()) {
               params += "&chr="+model.getChromosomeFilter();
               log("Got chromosome filter: "+params);
           }
           else log("Plugin has NO chromosome filter: "+model.getChromosomeFilter());
           
           
	   myadapter.ajax("allStats", "CnvEffects", variomeids,  null, model.getFilterChainId(), params, afterGotData);
	    
	},
	
    });

    return {
	PluginView : CnvPluginView,
	Plugin : CnvPlugin,	
	PluginControl : CnvPluginControl,
	PluginPlotView : CnvPluginPlotView
    };

});