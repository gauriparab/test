define([ "jquery", "deepmodel", "fabric" ], function($, Backbone, fabric) {

    var debug = true;

    var log = function(msg) {
	if (debug) console.log("Plugin: "+msg);
    };

    
    var PluginPlot = Backbone.DeepModel.extend({
	defaults : {
	    "width" : 600,
	    "height" : 1000,
	    margin : {
		top : 200,
		right : 0,
		bottom : 20,
		left : 350
	    }
	},
	getWidth : function() {
	    return this.get("width");
	},
	getHeight : function() {
	    return this.get("height");
	},
	getTop : function() {
	    return this.get("margin.top");
	}
    });

    var PluginControl = Backbone.DeepModel.extend();
    var Plugin = Backbone.DeepModel.extend({
	initialize : function(args) {
	    this.dataloaded = false;
	},
	// overwrite in subcclasses
	defaults : {
	    "plugin_container" : "container-myplugin",
	    "plugin_plot_container" : "container-myplugin-plot",
	    "plugin_control_container" : "container-myplugin-control",
	    "plugin_svg_container" : "svg-container",
	    "plugin_svg_id" : "pluginsvg"
	},
	validate : function(attributes) {
	// 
	},
	
	setPluginSvgId : function(name) {
	    this.set({
		"plugin_svg_id" : name
	    });
	},
	getRoot: function() {
	    log("Overwrite getRoot function to get path to plugin");
	    return myadapter.getRoot();
	},
	getPluginSvgId : function() {
	    return this.get("plugin_svg_id");
	},
	setPluginSvgContainer : function(name) {
	    this.set({
		"plugin_svg_container" : name
	    });
	},
	getPluginSvgContainer : function() {
	    return this.get("plugin_svg_container");
	},
	setPluginPlotContainer : function(name) {
	    this.set({
		"plugin_plot_container" : name
	    });
	},
	getPluginPlotContainer : function() {
	    return this.get("plugin_plot_container");
	},
	setPluginContainer : function(name) {
	    this.set({
		"plugin_container" : name
	    });
	},
	getPluginContainer : function() {
	    return this.get("plugin_container");
	},
	getPluginControlContainer : function() {
	    return this.get("plugin_control_container");
	},
	setPluginControlContainer : function(name) {
	    this.set({
		"plugin_control_container" : name
	    });
	},
	// overwrite
	getCSV : function() {
	    log("toCSV: overwrite");
	},
	str2ab : function(str) {
	    var buf = new ArrayBuffer(str.length); // 1 byte for each char
	    var bufView = new Uint8Array(buf);
	    for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	    }
	    log("Converte str of length " + str.length + " to buf of size " + buf.byteLength);
	    return buf;
	},
	clickLink : function(linkobj) {
	    try {
		linkobj.click();
	    } catch (e) {}
	    if (linkobj.getAttribute('onclick') == null) {
		if (linkobj.getAttribute('href')) document.location = linkobj.getAttribute('href');
	    } else linkobj.onclick();
	},
	convertStringToBlob : function(string) {
	    var buff = this.str2ab(string);
	    log("Length of buff: " + buff.byteLength);
	    return new Blob([ buff ], {
		type : "text/csv"
	    });
	},
	convertSvgToBlob : function(svg) {
	    var buff = btoa(svg);
	    log("Length of buff: " + buff.byteLength);
	    return new Blob([ buff ], {
		type : "application/octet-stream;base64"
	    });
	},
	exportCSV : function() {
	    var csvContent = this.getCSV();
	    log("Got csvcontent: " + csvContent.length);
	    var encodedUri = encodeURI(csvContent);
	    log("Got encodedUri: " + encodedUri.length);
	    var link = document.createElement("a");
	    var csv = "data:text/csv;charset=utf-8,";
	    if (csvContent.length > 100000) {
		var blob = this.convertStringToBlob(csvContent);
		log("Got blob of size: " + blob.size);
		var objectUrl = window.URL.createObjectURL(blob);
		log("Creating link with regular objectUrl " + objectUrl.length);
		link.setAttribute("href", objectUrl);

	    } else {
		log("Creating link with regular csv string");
		link.setAttribute("href", csv + encodedUri);
		log("Downloading csv of size " + csv.length);

	    }
	    link.setAttribute("download", "heatmapdata.csv");
	    this.clickLink(link);
	},

	getPNG : function() {
	//    log("getPNG: Convert SVG to PNG for svg with id " + this.getPluginSvgId());
	    // check which tab is showing, and create url based on that
	    var svg = $("#" + this.getPluginSvgId())[0];
	    // Extract the data as SVG text string
	    var svg_xml = (new XMLSerializer).serializeToString(svg);
	    // replace all )rotate with ), rotate
	    //svg_xml = svg_xml.replace(/,rotate/g, "rotate");
	    svg_xml = svg_xml.replace(/rotate/g, " rotate");
	    
	    log("Got svg_xml of length " + svg_xml.length);
	   
	    var canvas = document.createElement("canvas");
	    //var canvas = new fabric.Canvas('c');
	   
	    var me = this;
	    var tooLarge = function() {
		window.showWarning("The heat map is too large to convert to an image in the browser due to browser limitations. Downloading .SVG file instead. "+
			"To reduce the heat map size, you can also apply a filter (chromosome or other)");
	//	log("TODO: split up into smaller pieces");
		me.exportSVG(false);
	    };
	    if (svg_xml.length > 700000) {
		// 2721629 is too large
		tooLarge();
		return null;
	    }
	    
	    canvas.width = page.width + page.margin.left;
	    canvas.height = page.height + page.margin.top;
	  
	    try {
		//log("Calling canvg(canvas, svg_xml)");
		canvg(canvas, svg_xml);
	    } catch (e) {
		log("Got problem: " + e);
		tooLarge();
		return null;
	    }
	    log("Canvas size=" + canvas.width + "/" + canvas.height);
	  
	  //  log("Calling canvas.toDataURL");
	    var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	    //var img = canvas.toDataURL({format: 'png', multiplier: multiplier});
	    log("Got image of size " + img.length);
	    return img;
	},
	
	getSVG: function() {
	    log("getSVG:to SVG " + this.getPluginSvgId());
	    // check which tab is showing, and create url based on that
	    var svg = $("#" + this.getPluginSvgId())[0];
	    // Extract the data as SVG text string
	    var svg_xml = (new XMLSerializer).serializeToString(svg);
	    return svg_xml;
	},
	exportSVG : function(show) {
	    log("getSVG:download SVG " + this.getPluginSvgId());
	    // check which tab is showing, and create url based on that
	    var svg = $("#" + this.getPluginSvgId())[0];
	    // Extract the data as SVG text string
	    var svg_xml = (new XMLSerializer).serializeToString(svg);
	    log("Got svg_xml of length " + svg_xml.length);

	    if (show) window.showMessage("Downloading SVG - you can view it in Inkscape or similar programs");
	    var link = document.createElement('a');
	    link.download = 'my_svg.svg'; // file name

	    // var blob = this.convertSvgToBlob(svg_xml);
	    // log("Got blob of size: "+blob.size);

	    var blob = this.convertStringToBlob(svg_xml);
	    log("Got blob of size: " + blob.size);
	    var objectUrl = window.URL.createObjectURL(blob);
	    log("Creating link with regular objectUrl " + objectUrl.length);
	    link.setAttribute("href", objectUrl);
	    // a.href = 'data:application/octet-stream;base64,' + btoa(svg_xml);
	    // // create data uri
	    this.clickLink(link);
	},
	exportPNG : function() {
	    var img = this.getPNG();
	    console.log("Trying to open image");
	    if (img != null) window.open(img);
	},
    });
    
    
    var PluginPlotView = Backbone.View.extend({
	initialize : function() {
	    this.plugin_plot_container = this.model.getPluginPlotContainer();
	    this.model.currentView = this;
	},
	// obviously overwrite this method in a subclass
	render : function() {
	    log("pluginplotview.render");
	    this.$el.append("PluginPlotView is here in " + this.plugin_plot_container);
	    $("#" + this.plugin_plot_container).html(this.$el.html());
	    return this;
	}
    });

    var PluginControlView = Backbone.View.extend({
	initialize : function() {	  
	    this.plugin_control_container = this.model.getPluginControlContainer();
	},
	// obviously overwrite this method in a subclass
	render : function() {
	    this.$el.append("Controls are here in " + this.plugin_control_container);
	    $("#" + this.plugin_control_container).html(this.$el.html());
	    return this;
	}
    });

    var PluginView = Backbone.View.extend({
	initialize : function(args) {
	    this.plugin_container = this.model.get("plugin_container");
	    this.plugin_plot_container = this.model.get("plugin_plot_container");
	    this.plugin_control_container = this.model.get("plugin_control_container");
	    this.plugin_svg_container = this.model.get("plugin_svg_container");
	    this.render();

	},
	createLayout : function() {
	    var pluginControlView = new PluginControlView({
		model : this.model
	    });
	    pluginControlView.render();

	    var pluginPlotView = new PluginPlotView({
		model : this.model
	    });
	    pluginPlotView.render();
	},
	getToolTip : function() {
	    return this.tooltip;
	},
	initToolTip : function() {
	    this.tooltip = d3.select("#tooltipdiv").append("div").attr("id", "mytooltip").attr("class", "mytooltip")
		    .attr("opacity", "0.8").style("container", "body").style("z-index", "10").style("position",
			    "absolute").style("visibility", "hidden");
	},
	render : function() {
	    // log("render: plugin_svg_container="+this.plugin_svg_container);
	    this.$el.append(

	    "<div id='message-container'></div>" + 
	    "<div id='loading-indicator'></div><br>" +
	    "<div id='plotlegend'></div><br>" +
	    "<div id='" + this.plugin_plot_container + "' style='overflow: auto'><br>" +
	    
	    	"<div id='"  + this.plugin_svg_container + "'></div><br>" + 
	    "</div><br>" +  
	    "<div id='tooltipdiv'></div>");
	    $("#" + this.plugin_container).html(this.$el.html());
	    // log("Got html:"+this.$el.html());
	    this.initToolTip();
	    this.createLayout();
	    // log("=============== AFTER PLUGINVIEW.RENDER called, should now
	    // have svg-container and tooltipdiv etc ============= ");

	    return this;
	}
    });

    return {
	PluginView : PluginView,
	Plugin : Plugin,
	PluginPlot : PluginPlot,
	PluginControl : PluginControl,
	PluginControlView : PluginControlView,
	PluginPlotView : PluginPlotView
    };

});
