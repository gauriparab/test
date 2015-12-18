define([ "jquery", "deepmodel", "underscore", "d3", "pluginLib/svgbackboneview", "igv", "multiviz/model/tree",
	"legend", "adapter", "pluginLib/rainbowvis", "pluginLib/d3/bootstrap-tooltip", 
	"pluginLib/StackBlur", "pluginLib/canvg", "pluginLib/rgbcolor" ], function($, Backbone, _, d3, svgbackbone,
	igv, tree, legend, adapter, rain, a, b, c) {

    var debug = true;

    window.igv = igv;

    var log = function(msg) {
	if (debug) {
	    var d = new Date();
	    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	    console.log("analysisview.js " + time + " " + msg);
	}
    };

    log("Loading analysis view");

    var mylegend = new legend.Legend();
    var myadapter = new adapter.Adapter();

    var getURLParameter = function(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [ ,
		"" ])[1].replace(/\+/g, '%20'))
		|| null;
    };

    var hideLoading = function() {
	if (document && document.body) document.body.style.cursor = 'auto';
	$('#loading-indicator').hide();
    };

    var showLoading = function(msg) {
	// if (document && document.body) document.body.style.cursor =
	// 'wait';
	$('#loading-indicator').show();
	$("#loading-indicator").load(myadapter.getRoot() + "computing.html", function() {
	    if (msg) {
		$('#loading-msg').text(msg);
	    }
	});
    };
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.getURLParameter = getURLParameter;

    var showError = function(msg) {
	// if (document && document.body) document.body.style.cursor =
	// 'wait';
	$('#message-container').show();
	$("#message-container").load(myadapter.getRoot() + "error.html", function() {
	    if (msg) {
		$('#message-text').text(msg);
		log("Showing error: " + msg);
	    }
	});
//	window.setTimeout(function() {
//	    $("#message-container").hide();
//	}, 100000);
    };
    window.showError = showError;

    var showWarning = function(msg) {
	// if (document && document.body) document.body.style.cursor =
	// 'wait';
	$('#message-container').show();
	$("#message-container").load(myadapter.getRoot() + "warning.html", function() {
	    if (msg) {
		$('#message-text').text(msg);
		log("Showing warning: " + msg);
	    }
	});
//	window.setTimeout(function() {
//	    $("#message-container").hide();
//	}, 100000);
    };
    window.showWarning = showWarning;

    var showSuccess = function(msg) {
	// if (document && document.body) document.body.style.cursor =
	// 'wait';
	$('#message-container').show();
	$("#message-container").load(myadapter.getRoot() + "success.html", function() {
	    if (msg) {
		$('#message-text').text(msg);
		log("Showing error: " + msg);
	    }
	});
	window.setTimeout(function() {
	    $("#message-container").hide();
	}, 5000);
    };
    window.showSuccess = showSuccess;

    var showMessage = function(msg) {
	// if (document && document.body) document.body.style.cursor =
	// 'wait';
	$('#message-container').show();
	$("#message-container").load(myadapter.getRoot() + "message.html", function() {
	    if (msg) {
		$('#message-text').text(msg);
		log("Showing message: " + msg);
	    }
	});
	window.setTimeout(function() {
	    $("#message-container").hide();
	}, 5000);
    };
    window.showMessage = showMessage;

    var showLongMessage = function(msg) {
	// if (document && document.body) document.body.style.cursor =
	// 'wait';
	$('#message-container').show();
	$("#message-container").load(myadapter.getRoot() + "message.html", function() {
	    if (msg) {
		$('#message-text').text(msg);
		log("Showing message: " + msg);
	    }
	});
	window.setTimeout(function() {
	    $("#message-container").hide();
	}, 30000);
    };
    window.showLongMessage = showLongMessage;

    var AnalysisCanvas = svgbackbone.SvgBackboneView.extend({
	tagName : "div",
	initialize : function(args) {
	    svgbackbone.SvgBackboneView.prototype.initialize.apply(this, [ args ]);
	    this.model = args.model;
	    this.vizdata = this.model.getVizData();
	    this.page = this.model.getPage();
	    this.setSvgId(this.model.getPluginSvgId());
	    svgid = this.getSvgId();
	},
	render : function() {
	    // var svg = d3.select(this.el);
	    // log("render, getSvgId="+this.getSvgId()+", this.el="+this.el+",
	    // "+$(this.el));
	    var page = this.page;
	    var svg = d3.select(this.el).append("svg").attr("id", this.getSvgId()).style("width",
		    page.width + page.margin.left + page.margin.right + "px").style("height",
		    page.height + page.margin.top + page.margin.bottom + "px").style("margin-left",
		    -page.margin.left + 100 + "px").append("g").attr("class", "maingroup").attr("transform",
		    "translate(" + page.margin.left + "," + page.margin.top + ")");

	    var yaxis_name = "gene";
	    // log("render: got svg="+svg);
	    this.drawPlot(this.getSvgId(), svg, this.vizdata, this.page, yaxis_name);

	    return this;
	},
	drawPlot : function(svgid, svg, vizdata, page, yaxis_name) {
	    log("OVERWRITE drawPlot");

	},
	updateColor : function(svgid, vizdata) {
	    var t = d3.select("#" + svgid);
	    t.selectAll(".row").selectAll(".cell").style("fill", function(d) {
		var rect = d3.select(this);
		var g = rect.attr("dy");
		var s = rect.attr("dx");
		if (g && s) {
		    // log("Updating color of "+g+"/"+s);
		    var d = vizdata.matrix[g][s];
		    return mylegend.getColor(d.z);
		} else return 'rgba(255,255,0, 0.8)';
	    });
	},
	processSamples : function(vizdata, page) {

	    var analysisLegend = new legend.Legend();
	    
	    var analysislist = [];

	    analysislist.indexOf = function(find) {
		for (var i = 0, end = this.length; i < end; i++) {
		    if (this[i] == find) { return i; }
		}
		analysislist.push(find);
		return this.length-1;
	    };
	   
	    for ( var s in vizdata.heatmapdata.sample) {
		var samplename = vizdata.heatmapdata.sample[s];
		var sample = new Object();
		sample.name = samplename.replace(/_/g, " ");
		sample.attributes = [];
		sample.index = s;

		vizdata.samples.push(sample);
		if (vizdata.variomes[s]) {
		    var analysis = vizdata.variomes[s].getAnalysis();
		    if (analysis) {
			var a = analysislist.indexOf(analysis.getName());			
		    }
		}
		sample.index = vizdata.nrsamples;
		sample.count = 0;
		vizdata.nrsamples++;
	    }
	//    log("Got "+analysislist.length+" analyses: "+JSON.stringify(analysislist));
	    vizdata.analysislist = analysislist;
	    analysisLegend.findScale("rainbow");
	    analysisLegend.setMin(0);
	    analysisLegend.setMiddle((analysislist.length-1)/2);
	    analysisLegend.setMax(analysislist.length-1);
	    analysisLegend.computeScale();
	//    log("legend color 0: "+analysisLegend.getColor(0, true));
	//    log("legend color 1: "+analysisLegend.getColor(analysislist.length-1, true));
	   
    	    vizdata.analysisLegend = analysisLegend;
	
	},
	computeDimensions : function(vizdata, page) {
	    // log("Computing dimensions for "+vizdata.nrgenes+" genes and
	    // "+vizdata.nrsamples+" samples");
	    if (vizdata.nrgenes < 50)
		page.height = vizdata.nrgenes * 20;
	    else if (vizdata.nrgenes < 2000)
		page.height = vizdata.nrgenes * 15;
	    else page.height = vizdata.nrgenes * 10;

	    page.height = Math.max(page.height, 200);

	    if (vizdata.nrsamples < 1)
		page.width = vizdata.nrsamples * 300;
	    else if (vizdata.nrsamples < 3)
		page.width = vizdata.nrsamples * 200;

	    else if (vizdata.nrsamples < 20)
		page.width = 400;
	    else if (vizdata.nrsamples < 50)
		page.width = vizdata.nrsamples * 15;
	    else if (vizdata.nrsamples < 100)
		page.width = vizdata.nrsamples * 10;
	    else page.width = Math.max(page.width, vizdata.nrsamples * 8);

	    log("Page width/height: " + page.width + "/" + page.height);

	    vizdata.xrange = d3.scale.ordinal().rangeBands([ 0, page.width ]);
	    vizdata.yrange = d3.scale.ordinal().rangeBands([ 0, page.height - 1 ]);
	},
	addSampleLabels : function(column, vizdata, page) {
	    var collabels = column.append("g").attr("class", "samplelabel");

	    var analysisLegend = vizdata.analysisLegend;
	    var analysislist = vizdata.analysislist;

	    collabels.attr("s", function(d, i) {
		return i;
	    });

	    
	    // canvg does not support foreign Object.
	    // replace wiht
	    // g
	    //	 rect
	    //	 text
	    var rectandtext = collabels.append("g").attr("x", page.labely) // vertical
	    .attr("y", vizdata.xrange.rangeBand() / 2 - 5) // hor
	    .attr("style", TEXTSTYLE).attr("width", 250).attr("height", vizdata.yrange.rangeBand());

	  
	    rectandtext
	    	.append("rect")
	    	.attr("width", 10)
	    	.attr("height",10)
	    	.attr("fill", 
	    	 function(d, i) {
			// only if there is enough room!
	    	        var color = "white";
			if (vizdata.nrsamples < 600 || vizdata.xrange(i) % 10 == 0) {
			    var variome = vizdata.variomes[i];
			    if (variome && variome.getAnalysis()) {
				var index = analysislist.indexOf(variome.getAnalysis().getName());
				color = analysisLegend.getColor(index);
			    }
			}
			return color;
	    	 });
	    
	    rectandtext	    	 
	    	.append("text")	 
	    	.attr("style", TEXTSTYLE)
	    	.attr("fill", "black")
	    	.attr("dx", 15)
	    	.attr("dy", 8)
	        .text(function(d, i) {
		// only if there is enough room!
		if (vizdata.nrsamples < 600 || vizdata.xrange(i) % 10 == 0) {
		    var name = vizdata.samples[i].name;		   
		    if (name.length > 40) name = name.substring(1, 40) + "...";
		    return name;
		} else return "";
	    });

	    if (vizdata.nrsamples < 20) {
		var rectandtext = collabels.append("g").attr("x", page.labely) // vertical
		.attr("y", vizdata.xrange.rangeBand() / 2 + 11) // hor
		.attr("style", TEXTSTYLE).attr("width", 250).attr("height", 18);
		
		rectandtext
        	  .append("rect")
        	    	.attr("width", 10)
        	    	.attr("height",12)
        	    	.attr("y", 11)
        	    	.attr("fill", 
        	    	 function(d, i) {
        			// only if there is enough room!
        	    	        var color = "white";
                	    	var variome = vizdata.variomes[i];
                		if (variome && variome.getAnalysis()) {
                		   var index = analysislist.indexOf(variome.getAnalysis().getName());
                		   color = analysisLegend.getColor(index);
                		}
        			return color;
        	    	 });
		rectandtext
		 .append("text")
		 .attr("dx", 15)		 
	    	.attr("dy", 22)
	    	.attr("style", TEXTSTYLE)
	    	.attr("fill", "black")
	    	.text(function(d, i) {
    		    // only if there is enough room!
    		    var variome = vizdata.variomes[i];
    		    if (variome && variome.getAnalysis()) {
    			var an = variome.getAnalysis().getName();
    			if (an.length > 50) an = an.substring(1, 40) + "...";
    			return an;
    		    } else return "";
    		});
	    }

	},
	addControlListeners : function(vizdata, page) {
	    // log("adding common control listeners for export Image and others:
	    // "+$("#exportImage"));
	   
	    $("#igv").click(function() {
		window.Plugin.launchIGV();
	    });
	    $("#reload").click(function() {
		console.log("Reload clicked");
		window.Plugin.reload();
	    });
	    $("#exportCSV").click(function() {
		console.log("Download CSV clicked");
		window.Plugin.exportCSV();
	    });
	    $("#exportSVG").click(function() {
		console.log("Download SVG clicked");
		window.Plugin.exportSVG();
	    });
	    $("#xportImage").click(function() {
		window.Plugin.exportPNG();
	    });
	},
	addMouseListeners : function(vizdata, page, getGeneHtml) {
	    // log("---------- Adding mouse listeners in analysisview for sample
	    // labels "+svgid);
	    var svg = vizdata.svg;
	    d3.selectAll(".samplelabel").on("mouseover", function(arg, i) {
		var g = d3.select(this);
		var s = g.attr("s");

		if (s) {
		    var variome = vizdata.variomes[s];
		    var h = '<div>';
		    h += '<b>Sample: </b> ' + vizdata.samples[s].name;
		    if (variome) {
			if (variome.getSample()) {
			    h += '<br><b>Sample createdOn: </b><br>' + variome.getSample().getCreatedOn();
			    h += '<br><b>Sample gender: </b> ' + variome.getSample().getGender();
			}
			if (variome.getAnalysis()) {
			    var index = vizdata.analysislist.indexOf(variome.getAnalysis().getName());
			    var color = vizdata.analysisLegend.getColor(index);
			
			     var an ='<br><b>Analysis:</b><span style="background-color: '+color+'">&nbsp;&nbsp;</span><br>'
			     an += variome.getAnalysis().getName();
			     
			    h += an;			  
			    
			    h += '<br><b>Type: </b> ' + variome.getAnalysis().getType();
			    h += '<br><b>Workflow: </b> ' + variome.getAnalysis().getWorkflow();
			    // h += '<br><b>Date created: </b>
			    // '+variome.getAnalysis().getCreatedBy();
			}
		    }
		    h += '</div>';
		    page.tooltip.html(h);
		    page.tooltip.style("visibility", "visible");

		}
		return page.tooltip;

	    }).on("mousemove", function(d, i) {
		var x;
		var y;

		var dx = vizdata.xrange.rangeBand();
		// log("Mousemove. offset="+JSON.stringify($(this).offset()));
		var offset = $(this).offset();
		x = offset.left;
		x = x + dx / 2 - 59;
		y = offset.top - 200;
		// log("Got x/y = "+x+"/"+y);
		page.tooltip.style("top", (y) + "px").style("left", x + "px");

	    }).on("mouseout", function(d, i) {
		// console.log("------------- mouseout");
		page.tooltip.html("");
		return page.tooltip.style("visibility", "hidden");
		// urn tooltip.html("")
	    });

	    // log("Adding mouse listener to genelabel");
	    d3.selectAll(".genelabel").on("mouseover", function(arg, i) {
		var element = d3.select(this);
		var g = element.attr("g");

		// log("mouseover genelabel, g = "+g+", exported (for testing)
		// element="+element);
		if (g && vizdata.genes[g]) {
		    var h = null;
		    if (getGeneHtml) {
			h = getGeneHtml(g);
		    } else {
			var gene = vizdata.genes[g];
			h = '<div>';
			h += '<b>Gene: </b> ' + gene;
			h += '</div>';
		    }
		    page.tooltip.html(h);
		    page.tooltip.style("visibility", "visible");
		}
		return page.tooltip;

	    }).on("mousemove", function(d, i) {
		var x;
		var y;

		var dx = vizdata.xrange.rangeBand();
		// log("Mousemove. offset="+JSON.stringify($(this).offset()));
		var offset = $(this).offset();
		x = offset.left;
		x = x + dx / 2 - 59;
		y = offset.top - 300;
		// log("Got x/y = "+x+"/"+y);
		page.tooltip.style("top", (y) + "px").style("left", x + "px");

	    }).on("mouseout", function(d, i) {
		page.tooltip.html("");
		return page.tooltip.style("visibility", "hidden");
	    });
	},

	orderx : function(value) {
	    log("OVERWRITE orderx");
	},
	ordery : function(value) {
	    log("OVERWRITE ordery");
	},
	showMessage : function(msg) {
	    showMessage(msg);
	},
	showLongMessage : function(msg) {
	    showLongMessage(msg);
	},
	showLoading : function(msg) {
	    showLoading(msg);
	},
	hideLoading : function(msg) {
	    hideLoading(msg);
	},
	getURLParameter : function(msg) {
	    getURLParameter(msg);
	}
    });

    return {
	AnalysisCanvas : AnalysisCanvas,
	showMessage : showMessage,
	showError : showError,
	showWarning : showWarning,
	showSuccess : showSuccess,
	showLongMessage : showLongMessage,
	getURLParameter : getURLParameter,
	showLoading : showLoading,
	hideLoading : hideLoading,
	mylegend : mylegend,
	log : log
    };
});
