define(
	[ "jquery", "deepmodel", "underscore", "d3","analysisview",  "pluginLib/svgbackboneview", "igv", "multiviz/model/tree", "legend", 
	  "pluginLib/rainbowvis",  
	  "pluginLib/d3/bootstrap-tooltip", 
	  "pluginLib/StackBlur", "pluginLib/canvg", "pluginLib/rgbcolor"],
	  function($, Backbone, _, d3, analysisview, svgbackbone, igv,  tree,legend,  rain, a, b, c) {

	    var debug = true;

	    window.igv = igv;
	    var log = function(msg) {
		if (debug) {
		    var d = new Date(); 
		    var time = d.getMinutes() + ":" + d.getSeconds()+" "+d.getMilliseconds();		    
		    console.log("fusionview.js "+time+" "+msg);
		}
	    };

	    var svgid;
	    
	    var mylegend = analysisview.mylegend;
	    
	    var showLoading = analysisview.showLoading;
	    var showWarning = analysisview.showWarning;
	    var hideLoading = analysisview.hideLoading;
	    var showMessage = analysisview.showMessage;
	    var showLongMessage = analysisview.showLongMessage;
	    var getURLParameter = analysisview.getURLParameter;
	    
	  
	    // ==================== CONSTANTS ===========
	    // export does NOT support .css. So we have to inline any styles
	    // unfortunately
	    
	    TEXTSTYLE = "font: 9px sans-serif";
	    LABELDX = 170; // offset of gene labels to the left
	    MAX_NR_GENES_FOR_TREE = 1000;
	  
	    MAX_NR_SAMPLES_FOR_TREE = 150;
	  
	   
	    
	    var initVars = function() {
		 LABELDX = 170; // offset of gene labels to the left
	    };
	    var currentcell= "";
	    var FusionCanvas = analysisview.AnalysisCanvas.extend({
		tagName : "div",
		initialize : function(args) {

		    analysisview.AnalysisCanvas.prototype.initialize.apply(this, [ args ]);
		    this.model = args.model;
		    this.vizdata = this.model.getVizData();
		    this.page = this.model.getPage();
		    this.setSvgId(this.model.getPluginSvgId());
		    svgid = this.getSvgId();  
		},
		render : function() {
		    // var svg = d3.select(this.el);
		    var page = this.page;

		    log("render, getSvgId="+this.getSvgId()+", margin.left="+page.margin.left);
		    var svg = d3.select(this.el).append("svg").attr("id", this.getSvgId())
		    .style("width",page.width + page.margin.left + page.margin.right+"px")
		    .style("height",  page.height + page.margin.top + page.margin.bottom+"px")
		    .style("margin-left",0+ "px")
		    .append("g")
		    .attr("class", "maingroup")
		    .attr("transform",
			    "translate(" + page.margin.left + "," + page.margin.top + ")");

		    page.isexprt = false;

		    drawPlot(this, this.getSvgId(), svg, this.vizdata, this.page, "fusion");

		    return this;
		}
	    });


	    function drawPlot(canvas, svgid, svg, vizdata, page, yaxis_name) {
		log("============== drawPlot called, yaxis_name=" + yaxis_name+", svgid="+svgid);
		// change this...
		initVars();
		vizdata.canvas = canvas;
		window.vizdata = vizdata;
		window.page = page;

		this.vizdata = vizdata;		
		this.page = page;
		vizdata.svg = svg;
		log("LABELDX="+LABELDX);
		log("page.width="+this.page.width);
		// ===================================================
		// PROCESS JSON
		// ===================================================
		vizdata.locations = vizdata.heatmapdata.locations;

		for ( var d in vizdata.heatmapdata.dims) {
		    vizdata.dims.push(vizdata.heatmapdata.dims[d]);
		}
		vizdata.sampledistorder = vizdata.heatmapdata.sampleorder;
		vizdata.genedistorder = vizdata.heatmapdata.fusionorder;
		vizdata.samplelinkage = vizdata.heatmapdata.samplelinkage;
		vizdata.genelinkage = vizdata.heatmapdata.fusionlinkage;

			
		// ===================================================
		// RAINBOW COLORS
		// =======================f============================
		var numberOfColors = 20;// (vizdata.effects.length) * 5;
		rainbow = new Rainbow();
		rainbow.setNumberRange(1, numberOfColors);
		rainbow.setSpectrum('#8833FF', '#1111BB', '#AAFF22', '#FFFF22', '#FFAA22', '#FF0000');

		vizdata.canvas.processSamples(vizdata, page);
		
		
		// currently limit the nr of genes?
		var maxgenes = 30000;
	
		vizdata.genes = vizdata.heatmapdata['fusion'];
		if (!vizdata.genes) {
		    log("GOT NO fusions in heatmap data!");
		    showLongMessage("No fusion data was found for this set of analyses ");
		    return;
		    
		}
		
		genelist = [];
		djb2Code = function(str){
		    var idx = genelist.indexOf(str);
		    if (idx < 0) {
			//log("Adding gene "+str);
			genelist.push(str);
		    }
		    return genelist.indexOf(str);
		};
		// ===================================================
		// PROCESS GENES/ANNOTATIONS
		// ===================================================
		
		
		for ( var g in vizdata.genes) {
		    var fusion = vizdata.genes[g];
		    // var genename = vizdata.genes[g];
		    // var gene = new Gene(genename, g);

		    //if (g < 3) log("Got fusion: "+JSON.stringify(fusion)+" with id "+fusion.id);
		    // "3br": "2:42492091",
		    // "5br": "2:29446394",
		    // "id": "EML4_ALK.E6bA20.AC374362_1"

		    var id = fusion.id;
		    // split into 3', middle, 5'
		    var parts = id.split(".");
		    // EML4_ALK E6bA20 AC374362_1
		    var pair =parts[0];
		    var genes = pair.split("_");
		    if (genes.length < 2)  genes = pair.split("-");
		    fusion.three = genes[0];
		    fusion.middle = parts[1];
		    fusion.five = genes[1];
		    fusion.control = 0;
		    if (fusion.type === "EXPRCONTROL" || fusion.id.indexOf("CTRL.")>-1) {
			//log("Got control, type is "+fusion.type);
			fusion.genepairhash  =vizdata.genes.length*vizdata.genes.length;
			fusion.id = fusion.id+ " (control)";
			fusion.control = 1;
			fusion.three = " CONTROL";
			fusion.five = " CONTROL";
		    }
		    // AKAP-RET.A36R12
		    if (fusion.five && fusion.three) {
			var hash = djb2Code(fusion.five) * djb2Code(fusion.three);
			fusion.genepairhash = hash;
			
		    }
		    else {			
			fusion.genepairhash = djb2Code(fusion.three);			
		    }
		    // gene pair sorting: product of names in integers so that it is invariant of the order
		    
		    

		    //log("Got fusion: "+JSON.stringify(fusion)+" with three "+fusion.three);
		    vizdata.genedata.push(fusion.id);
		    g = vizdata.nrgenes;
		    vizdata.nrgenes++;
		    if (vizdata.nrgenes > maxgenes) {
			showLongMessage("There are found " + vizdata.genes.length
				+ " genedata objects, that is too many to display. Showing the first "
				+ maxgenes + " for now");
			break;
		    }
		}


		if (vizdata.nrsamples < 1) {
		    showLongMessage("No samples and no data was found - no heat map can be computed");
		    return;
		}
		if (vizdata.nrgenes < 1) {
		    showLongMessage("No gene fusions were found - no heat map can be computed");
		    return;
		}
		var rainbowtop = new Rainbow();
		rainbowtop.setNumberRange(1, Math.max(vizdata.nrsamples+1,2));
		rainbowtop.setSpectrum('#8833FF', '#1111BB', '#AAFF22', '#FFFF22', '#FFAA22', '#FF0000');

		var rainbowside = new Rainbow();
		rainbowside.setNumberRange(1, Math.max(vizdata.nrgenes+1, 2));
		rainbowside.setSpectrum('#8833FF', '#1111BB', '#AAFF22', '#FFFF22', '#FFAA22', '#FF0000');

		if (vizdata.nrgenes < 1 || vizdata.nrsamples < 1) {
		    showLongMessage("No gene fusion data points were found for variomes "
			    + vizdata.variomes+" - no heat map can be computed");
		}
		canvas.computeDimensions(vizdata, page);

		// ===================================================
		// SVG SETUP
		// ===================================================

		// passed in parameter
		vizdata.svg = svg;

		// ===================================================
		// DATA
		// ===================================================

		dropdown = document.getElementById("ordery");
		vizdata.attributes.forEach(function(att, i) {
		    
		    var option = document.createElement("option");
		    option.text = 'by attribute ' + att;
		    option.value = 'att' + i;
		    dropdown.add(option, null);
		});

		log("Nr fusions: " + vizdata.nrgenes + ", nrsamples=" + vizdata.nrsamples);

		for (var g = 0; g < vizdata.nrgenes; g++) {
		    // initialize row
		    vizdata.matrix[g] = d3.range(vizdata.nrsamples).map(function(s) {
			return {
			    x : s,
			    y : g,
			    z : 0,
			    v : 0
			};
		    });
		}

		log("Processing " + vizdata.heatmapdata.points.length + " points ");
		var min = 1000000;
		var max = -1000000;
		for ( var p in vizdata.heatmapdata.points) {
		    var point = vizdata.heatmapdata.points[p];
		    var score = point[2];
		    if (score > max) {
			max = score;
		    }
		    if (score < min) {
			min = score;
		    }
		}
		max = Math.max(1, max);
		min = Math.max(0, min);
		
		log("Got min:"+min+", max:"+max);
		for ( var p in vizdata.heatmapdata.points) {
		    var point = vizdata.heatmapdata.points[p];
		    // [0, 30, 1] sample, fusion, score
		    var s = point[0];
		    var g = point[1];
		   
		    var score = point[2];		    
		    var matrixobj = new Object();
		    // for now, multiply, since we have NO location info yet
		    matrixobj.z = Math.max(score, 0.1);
		    matrixobj.c = point[2] ;
		    matrixobj.g;
		    matrixobj.has = true;
		    matrixobj.y = g;
		    matrixobj.x = s;

		    // 5th dimension: second score
		    if (point.length > 4) {
			matrixobj.c1 = point[3];
			matrixobj.c2 = point[4];
			if (point[4] > -1) matrixobj.split = true;
		    } 
		  
		    if (s < vizdata.nrsamples && g < vizdata.nrgenes) {
			vizdata.matrix[g][s] = matrixobj;

		    } 
		}

	//	log("Setting up color legend (using relative min max: "+min+"/"+max);
		
		log("Using scoring function: "+vizdata.score);
		
		mylegend.findScoring(vizdata.score);
		
		log("min="+min+", max="+max);
		mylegend.setMin(0);
		mylegend.setMax(max);
		mylegend.setMiddle(1);
		mylegend.setMarginLeft(50);
		mylegend.setWidth(Math.min(800, Math.max(page.width+page.margin.left), 600));		
		mylegend.findScale("bluered");
		mylegend.computeScale();
		mylegend.addLegend();
		// ===================================================
		// X/Y ORDERING
		// ===================================================
		vizdata.sampleorders = {
			name : d3.range(vizdata.nrsamples).sort(function(a, b) {
			    return d3.ascending(vizdata.samples[a].name, vizdata.samples[b].name);
			}),
			att0 : d3
			.range(vizdata.nrsamples)
			.sort(
				function(a, b) {
				    return vizdata.samples[a].attributes.indexOf(vizdata.attributes[0]) > vizdata.samples[b].attributes
				    .indexOf(vizdata.attributes[0]);
				}),
			date : d3.range(vizdata.nrsamples).sort(function(a, b) {
				    return d3.ascending(vizdata.samples[a].date, vizdata.samples[b].date);
				}),
			distance : vizdata.sampledistorder,
			reversedistance : vizdata.sampledistorder.slice(0).reverse(),
			analysis : d3.range(vizdata.nrsamples).sort(function(a, b) {
				var va =vizdata.variomes[a];
				var vb =vizdata.variomes[b];
				if (va && vb && va.getAnalysis() && vb.getAnalysis()) {
				    return d3.ascending(va.getAnalysis().getName(), vb.getAnalysis().getName());
				}
				else return 0;
			    })
		};

		if (!vizdata.sampledistorder || vizdata.sampledistorder.length < vizdata.nrsamples) {
		    $("#orderx a[value='distance']").remove();
		    $("#orderx a[value='reversedistance']").remove();
		};
		if (!vizdata.genedistorder || vizdata.genedistorder.length < vizdata.nrgenes) {
		    $("#ordery a[value='distance']").remove();
		    $("#ordery a[value='reversedistance']").remove();
		};

		// Precompute the orders.
		vizdata.geneorders = {
			fiveprime : d3.range(vizdata.nrgenes).sort(function(a, b) {
			    var fa =vizdata.genes[a];
			    var fb =vizdata.genes[b]; 
			    if ( fa && fb) {
				return d3.ascending(fa.control+fa['five'],fb.control+fb['five']);
			    }
			    else return 0;
			}),
			threeprime : d3.range(vizdata.nrgenes).sort(function(a, b) {
			    var fa =vizdata.genes[a];
			    var fb =vizdata.genes[b]; 
			    if ( fa && fb) {
				return d3.ascending(fa.control+fa['three'], fb.control+fb['three']);
			    }
			    else return 0;
			}),
			// gene pair. any oder. convert name to integer and take product
			middle : d3.range(vizdata.nrgenes).sort(function(a, b) {
			    var fa =vizdata.genes[a];
			    var fb =vizdata.genes[b]; 
			    if ( fa && fb) {
				return d3.ascending(fa.control+fa['genepairhash'], fb.control+fb['genepairhash']);
			    }
			    else return 0;
			}), 
			id : d3.range(vizdata.nrgenes).sort(function(a, b) {
			    var fa =vizdata.genes[a];
			    var fb =vizdata.genes[b]; 
			    if ( fa && fb) {
				return  d3.ascending(fa.control+fa['id'], fb.control+fb['id']);
			    }				
			    else return 0;
			}),
			distance : vizdata.genedistorder,
			reversedistance : vizdata.genedistorder.slice(0).reverse()
		};

		// The default sort order.
		vizdata.yrange.domain(vizdata.geneorders.middle);
		vizdata.xrange.domain(vizdata.sampleorders.name);

		// ===================================================
		// CREATE CHART
		// ===================================================
		vizdata.svg.append("rect").attr("fill", "#eee").attr("width", page.width).attr("height",
			page.height);

		// ===================================================
		// DENDROGRAM ON TOP
		// ===================================================
		topdendro = function() {
		    // log("=========== Topdendro called. Removing
		    // svgtop first, then adding it = only for < 100 samples");
		    d3.selectAll("#svgtop").remove();
		    var top = d3.selectAll("svg").append("g").attr("id", "svgtop").attr("transform",
			    "translate(" + page.margin.left + "," + page.margin.top + ")");
		    page.labely = 0;

		    // draw top dentrogram
		    var level = 0;
		    var dh = 4;
		    if (vizdata.nrsamples > 100) dh = 3;

		    if (vizdata.nrsamples > 150) {
			showWarning("The dendrogram would get too large, I won't draw it");
			return;
		    }

		    var dx = vizdata.xrange.rangeBand() / 2;
		    var order = vizdata.sampleorders[vizdata.curxdomain];
		    order.indexOf = function(find) {
			for (var i = 0, end = this.length; i < end; i++) {
			    if (this[i] == find) { return i; }
			}
			return -1;
		    };

		    var nodes = [];
		    for (var i = 0; i < vizdata.nrsamples; i++) {
			var node = new Node(i);
			node.x = vizdata.xrange(i) + dx;
			node.y = 0;
			nodes[i] = node;
		    }
		    var nodenr = vizdata.nrsamples;

		    for (var i = 0; i < vizdata.samplelinkage.length; i++) {
			var link = vizdata.samplelinkage[i];
			var a = link[0];
			var b = link[1];
			var nodea = nodes[a];
			var nodeb = nodes[b];
			var nodec = new Node(nodenr, nodea, nodeb);
			nodes[nodenr] = nodec;

			var x1 = nodea.x;
			var x2 = nodeb.x
			// then, replace the position of THIS node with the
			// middle

			var ya = nodea.y;
			var yb = nodeb.y;
			var y2 = Math.min(ya, yb) - dh;

			nodec.x = (x1 + x2) / 2;
			nodec.y = y2;

			var ordera = order.indexOf(a);
			var orderb = order.indexOf(b);
			for (var j = ordera; j <= orderb; j++) {
			    var n = nodes[order[j]];
			    if (n) n.setAllY(y2);
			}
			page.labely = -y2  ;

			var color = "#"+rainbowtop.colourAt(i);
			var w = 1;


			top.append("line").attr("x1", x1).attr("y1", ya - 1).attr("x2", x1).attr("y2", y2).attr(
				"stroke-width", w).attr("stroke", color);

			top.append("line").attr("x1", x2).attr("y1", yb - 1).attr("x2", x2).attr("y2", y2).attr(
				"stroke-width", w).attr("stroke", color);
			// line between a and b
			top.append("line").attr("x1", x1).attr("y1", y2).attr("x2", x2).attr("y2", y2).attr(
				"stroke-width", w).attr("stroke", color);
			top.append("circle").attr("x1", x1).attr("cx", (x1 + x2) / 2).attr("cy", y2).attr("r", 1).attr(
				"stroke-width", w).attr("stroke", color).attr("fill", color);;
				level += 1;
				nodenr += 1;
		    }
		    page.labely = page.labely +4;
		    if (page.labely +100> page.margin.top) {
			page.margin.top = page.labely+100;
			log("New page margin top is: "+page.margin.top);
			d3.selectAll(".maingroup").attr("transform", "translate(" + 0, ", "+page.margin.top+")");
			d3.selectAll("#svgtop").attr("transform", "translate(" + 0 + ", "+page.margin.top+")");
		    }
		    // log("Moving samplelabels by "+2*page.labely);
		    d3.selectAll(".samplelabel").attr("transform", "translate(" + (page.labely) + ", 0)");
		};
		// ===================================================
		// DENDROGRAM ON TOP
		// ===================================================
		sidedendro = function() {
		    // log("Dendro: =========== sidedendro called.
		    // Removing svgside first, then adding it");
		    d3.selectAll("#svgside").remove();
		    var dendro = d3.selectAll("svg").append("g").attr("id", "svgside").attr("transform",
			    "translate(" + page.margin.left + "," + page.margin.top + ")");
		    page.labelx = 0;

		    // draw top dentrogram
		    var level = 0;
		    var dw = 4;
		    var dy = vizdata.yrange.rangeBand() / 2;
		    var order = vizdata.geneorders[vizdata.curydomain];
		    order.indexOf = function(find) {
			for (var i = 0, end = this.length; i < end; i++) {
			    if (this[i] == find) { return i; }
			}
			return -1;
		    };

		    var nodes = [];
		    for (var i = 0; i < vizdata.nrgenes; i++) {
			var node = new Node(i);
			node.y = vizdata.yrange(i) + dy;
			node.x = -LABELDX-2;
			nodes[i] = node;

		    }
		    var nodenr = vizdata.nrgenes;
		    var smallestx = 1000;
		    var dendrowidth = 0;
		    for (var i = 0; i < vizdata.genelinkage.length; i++) {
			var link = vizdata.genelinkage[i];
			var a = link[0];
			var b = link[1];
			var nodea = nodes[a];
			var nodeb = nodes[b];
			var nodec = new Node(nodenr, nodea, nodeb);
			nodes[nodenr] = nodec;
			// log("got new node: "+nodec.toString());

			var x1 = nodea.x;
			var x2 = nodeb.x;
			// then, replace the position of THIS node with the
			// middle

			var y1 = nodea.y;
			var y2 = nodeb.y;
			var x3 = Math.min(x1, x2) - dw;
			dendrowidth = Math.min(x3, dendrowidth);
			nodec.y = (y1 + y2) / 2;
			nodec.x = x3;
			smallestx = Math.min(smallestx, x3);
			// log("a/b= "+a+"/"+b+", xa/xb="+x1+"/"+x2+",
			// ya/b="+ya+"/"+yb+", y2="+y2);
			// but also for all nodes between a and b
			var ordera = order.indexOf(a);
			var orderb = order.indexOf(b);
			// log(" Changing y from "+ordera+" to
			// "+orderb);
			for (var j = ordera; j <= orderb; j++) {
			    var n = nodes[order[j]];
			    if (n) n.setAllX(x3);
			    // log(" Setting ypos of "+n.toString() +"
			    // to "+y2);
			}

			var color =  "#"+rainbowside.colourAt(i);
			var w = 1;

			// log("x3="+(x3)+", page.labelx="+page.labelx);
			// hor line top x3 --- x1/y1
			dendro.append("line")
			.attr("x1", x1-1)
			.attr("y1", y1)
			.attr("x2", x3)
			.attr("y2", y1).attr(
				"stroke-width", w).attr("stroke", color);

			// hor line bottom x3 --- x2/y2
			dendro.append("line")
			.attr("x1", x2-1)
			.attr("y1", y2)
			.attr("x2", x3)
			.attr("y2", y2).attr(
				"stroke-width", w).attr("stroke", color);

			// line between a and b from top to bottom
			// | x3/y1
			// | x3/y2
			dendro.append("line")
			.attr("x1", x3)
			.attr("y1", y1)
			.attr("x2", x3)
			.attr("y2", y2).attr(
				"stroke-width", w).attr("stroke", color);

			// drawl little connection circle in middle
			dendro.append("circle").attr("cy", (y1 + y2) / 2).attr("cx", x3).attr("r", 1).attr(
				"stroke-width", w).attr("stroke", color).attr("fill", color);
			level += 1;
			nodenr += 1;
		    }

		    dendrowidth = -dendrowidth+5;

		    var difference = dendrowidth + LABELDX - page.margin.left;

		    page.labelx  = 0;

		    page.margin.left = page.margin.left+difference;
		    // move entire graph to the right
		    d3.selectAll(".maingroup").attr("transform", "translate(" + (page.margin.left+page.labelx) + ", "+page.margin.top+")");
		    d3.selectAll("#svgtop").attr("transform", "translate(" + (page.margin.left+page.labelx) + ", "+page.margin.top+")");
		    d3.selectAll("#svgside").attr("transform", "translate(" + (page.margin.left) + ", "+page.margin.top+")");
		    d3.selectAll("#"+svgid).style("width", (page.width + page.margin.left+page.labelx)+"px");
		};


		// ===================================================
		// ROWS/COLULMNS
		// ===================================================
		function row(row) {
		    var w = vizdata.xrange.rangeBand();
		    var cell = d3.select(this).selectAll(".cell").data(row.filter(function(d) {
			return d.has  && !d.split;
		    })).enter().append("rect")
    		    .attr("class", "cell")
    		    .attr("dx", function(d) {
    			return d.x;
    		    })
    		    .attr("dy", function(d) {
    			return d.y;
    		    })
    		    .attr("x", function(d) {
    			return vizdata.xrange(d.x);
    		    }).attr("y", function(d) {
    			return 0;
    		    }).attr("width", w)
    		    // .attr("height", yrange.rangeBand()-2)
    		    .attr("height", vizdata.yrange.rangeBand()).attr("stroke-width", 1)		    
    		    .style("fill-opacity", function(d) {
    			return 0.75;
    		    }).style("fill", function(d) {
    			if (d.has) {
    			    return mylegend.getColor(d.z);
    			} else return 'rgba(255,255,0, 0.8)';
    		    });		    		    
		   
		    var split =  d3.select(this).selectAll(".cell").data(row.filter(function(d) {
			return d.has && d.split;
		    })).enter().append("g");
		    
		    
		    split.append("rect")
        		    .attr("class", "cell1")
        		    .attr("dx", function(d) {
        			return d.x;
        		    })
        		    .attr("dy", function(d) {
        			return d.y;
        		    })
        		    .attr("x", function(d) {
        			return vizdata.xrange(d.x);
        		    }).attr("y", function(d) {
        			return 0;
        		    }).attr("width", w/2)
        		    // .attr("height", yrange.rangeBand()-2)
        		    .attr("height", vizdata.yrange.rangeBand()).attr("stroke-width", 1)		    
        		    .style("fill-opacity", function(d) {
        			return 0.75;
        		    }).style("fill", function(d) {
        			if (d.has) {
        			//    log("Got c1: "+d.c1); 
        			    return mylegend.getColor(d.c1+0.1);
        			} else return 'rgba(255,255,0, 0.8)';
        		    });
		    split.append("rect")
        		    .attr("class", "cell2")
        		    .attr("dx", function(d) {
        			return d.x;
        		    })
        		    .attr("dy", function(d) {
        			return d.y;
        		    })
        		    .attr("x", function(d) {
        			return vizdata.xrange(d.x)+w/2;
        		    }).attr("y", function(d) {
        			return 0;
        		    }).attr("width", w/2)
        		    // .attr("height", yrange.rangeBand()-2)
        		    .attr("height", vizdata.yrange.rangeBand()).attr("stroke-width", 1)		    
        		    .style("fill-opacity", function(d) {
        			return 0.75;
        		    }).style("fill", function(d) {
        			if (d.has) {
        			//    log("Got c2: "+d.c2);
        			    return mylegend.getColor(d.c2+0.1);
        			} else return 'rgba(255,255,0, 0.8)';
        		    });
		}

		
		
		var row = vizdata.svg.selectAll(".row").data(vizdata.matrix).enter().append("g").attr("class", "row")
		.attr("transform", function(d, i) {
		    return "translate(0," + vizdata.yrange(i) + ")";
		}).each(row);

		row.append("line").attr("x2", page.width)
		.attr("fill", "none")
		.attr("shape-rendering", "crispEdges")
		.attr("stroke", "#ffffff");

		row.append("text").attr("x", -LABELDX).attr("y", 11).attr("dy", "0")
		.attr("text-anchor", "begin")
		.attr("style", TEXTSTYLE)
		.attr("fill", function(d, i) {
		    	    var black =  "rgb(0,0,0)";
			    if (i >= vizdata.nrgenes) return black;
			    if (vizdata.nrgenes < 2000 || i % 1 == 0) {
				var fusion = vizdata.genes[i];
				if (fusion) {
			    		if (fusion.control ==1) return "rgb(150,150,150)";
			    		else return black;
				}
				else log("No fusion data at "+i);
			    }
			    return black;
			})
		.attr("class", "genelabel")
        		.attr("g", function(d, i) {
        		    	return i;
        		})
			.text(function(d, i) {
			    if (i >= vizdata.nrgenes) return null;
			    if (vizdata.nrgenes < 2000 || i % 1 == 0) {
				var fusion = vizdata.genes[i];	
				if (fusion) {
				    return fusion.id;
				}
				else log("No fusion data at "+i);
			    }
			    return "";
			});


		var column = vizdata.svg.selectAll(".column").data(vizdata.samples).enter().append("g").attr("class",
		"column").attr("transform", function(d, i) {
		    return "translate(" + vizdata.xrange(i) + "), rotate(-90)";
		});

		column.append("line").attr("x1", -page.height - 8)
		.attr("stroke", "#ffffff")
		.attr("shape-rendering", "crispEdges")
		.attr("fill", "none");
		
		vizdata.canvas.addSampleLabels(column, vizdata, page);

		var delay = 1000;
		
		var timeout = setTimeout(function() {
		    var ox = window.getURLParameter("orderx");
		    if (!ox) ox = "distance";
		    var oy = getURLParameter("ordery");
		    if (!oy) oy = "id";
		    orderx(ox);
		    ordery(oy);
		    var selorder =  d3.select("#orderx");
		    addMouseListeners(svgid,  vizdata, page);

		}, delay);
		
	    };
	    
	    function updateColor(svgid) {
		log("Updating all colors");
		var t = d3.select("#"+svgid);		
		t.selectAll(".row").selectAll(".cell").
		style("fill", function(d) {
		    var rect = d3.select(this);
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");		   
		    if (g && s) {
			  // log("Updating color of "+g+"/"+s);
			   var d = vizdata.matrix[g][s];
			   return mylegend.getColor(d.z);
		    } else return 'rgba(255,255,0, 0.8)';
		});
		
		t.selectAll(".row").selectAll(".cell2").
		style("fill", function(d) {
		    var rect = d3.select(this);
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");		   
		    if (g && s) {
			  // log("Updating color of "+g+"/"+s);
			   var d = vizdata.matrix[g][s];
			   return mylegend.getColor(d.c2);
		    } else return 'rgba(255,255,0, 0.8)';
		});
	   
		t.selectAll(".row").selectAll(".cell1").
		style("fill", function(d) {
		    var rect = d3.select(this);
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");		   
		    if (g && s) {
			  // log("Updating color of "+g+"/"+s);
			   var d = vizdata.matrix[g][s];
			   return mylegend.getColor(d.c1);
		    } else return 'rgba(255,255,0, 0.8)';
		});
				
	    };

	    function addControlListeners(svgid, vizdata, page ) {
		log("====== ADDING ORDERX, ORDERY, SCORE etc LISTENERS");
		$(".ordery").click(function() {
		    $(".ordery").parent().removeClass("selected");
		    var title = $(this).attr('value');
		  //  log("Ordery class clicked with  "+title);
		    $(this).parent().addClass("selected");
		    ordery(title);
		    $("#fusionorder").text("Fusion Clustering - "+title);
		});
		
		$(".orderx").click(function() {
		    $(".orderx").parent().removeClass("selected");
		    var title = $(this).attr('value');
		 //   log("Orderx class clicked with  "+title);
		    $(this).parent().addClass("selected");
		    $("#sampleorder").text("Sample Order - "+title);
		    orderx(title);
		});

		$(".score").click(function() {
		    $(".score").parent().removeClass("selected");
		    $(this).parent().addClass("selected");
		    vizdata.score = $(this).attr('value');
		    log("=== NOT DONE Updating legend with new scoring function: "+vizdata.score);
		    // logodds, log, absolute, relative,
		    
		    //mylegend.findScoring(vizdata.score);
		    mylegend.addLegend();
		});
		
		$(".scale").click(function() {
		    $(".scale").parent().removeClass("selected");
		    $(this).parent().addClass("selected");
		    var key = $(this).attr('value');
		    var scale = mylegend.findScale(key);
		//    log("replacing color scale with "+scale);
		    $("#colorscale").text("Color Scale - "+key);
		    mylegend.addLegend();
		    updateColor(svgid);
		});
	    };
	    
	    function addMouseListeners(svgid, vizdata, page) {
		addControlListeners(svgid, vizdata, page);
//		log("---------- Adding mouse listeners for tooltip for id "+svgid);
		var svg = vizdata.svg;		
		// here, after rendering is done");
		d3.selectAll("#"+svgid)
		.style("height", (page.height + page.margin.top+page.margin.bottom)+"px")
		.style("width", (page.width + page.margin.left+page.labelx+page.margin.right)+"px");

		d3.selectAll(".cell, .cell2, .cell1").on(
			"mousedown",
			function(arg, i) {
			    var rect = d3.select(this);
			    log("-------------- mouse clicked for rect="+rect);
			    var g = rect.attr("dy");
			    var s = rect.attr("dx");
			    if (g && s) { 
				var d = vizdata.matrix[g][s];	        			
				if (d) {
				    var variome = vizdata.variomes[s];
				    if (variome) {
					log("Adding link to variant detail card "+JSON.stringify(variome));        				
				    }
				    else log("No variome at  s="+s+", variomes="+JSON.stringify(vizdata.variomes));

				}
			    }
			});
		
		d3.selectAll(".cell, .cell1, .cell2").on("mouseover",function(arg, i) {
		//d3.selectAll("rect").on("mouseover",function(arg, i) {
		    var rect = d3.select(this);		   
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");		    
		    key = g+"/"+s;
//		    log("+++++++++++++ mouseover "+key);		   
		    currentcell = key;
		    if (g && s) { 
			var d = vizdata.matrix[g][s];
			var fusion = vizdata.genes[d.y];
			//log("Mouse: d is: "+JSON.stringify(d)+", split? "+d.split);
			try {
			    var variome = vizdata.variomes[s];
			    var h = '<div><b>Sample: </b>' + vizdata.samples[s].name;
			    
			    if (d.split) {
				h += '<br><b>Count difference: </b>' + (d.z).toFixed(0)+' <span style="opacity: 0.75; background-color: ' +  mylegend.getColor(d.z);
				    h += '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
				h += "<br><b>5' count: </b>" + (d.c2);
				h += "<br><b>3' count: </b>" + (d.c1);				
			    }
			    else {
				h += '<br><b>Count: </b>' + (d.z).toFixed(0)+' <span style="opacity: 0.75; background-color: ' +  mylegend.getColor(d.z);
				h += '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
			    }
			    if (variome && variome.getAnalysis()) {
				    var index = vizdata.analysislist.indexOf(variome.getAnalysis().getName());
				    var color = vizdata.analysisLegend.getColor(index);
				    //log("Got an: "+an);
				    var an ='<br><b>Analysis:</b> <span style="background-color: '+color+'">&nbsp;&nbsp;</span><br>'+ variome.getAnalysis().getName(); 
				    h += an;
			    }
			    h += '<br><b>Gene Fusion:</b> ' + fusion.id;
			    if (fusion['type']) h += '<br><b>Type:</b>  ' + fusion['type'];
			    if (fusion['5br']) h += '<br>5 prime bp: ' + fusion['5br'];
			    if (fusion['3br']) h += '<br>3 prime bp: ' + fusion['3br'];      
			    
			             				                				
			    //h += '<br>(click to see detail card)';
			    h += '</div>';
			    page.tooltip.html(h);
			    page.tooltip.style("visibility", "visible");
			    
			                   				            				
			} catch (e) {
			    log("Got problem: "+e);
			}
		    }		   

		}).on(
			"mousemove",
			function(d, i) {
			    var x; var y;
			    var dx = vizdata.xrange.rangeBand() ;
			  
			  //  log("Mousemove. offset="+JSON.stringify($(this).offset()));			  
			    var offset = $(this).offset(); 
			    x = offset.left;
			    x = x +dx-50;			   
			    y = offset.top-400;
			   // log("Got x/y = "+x+"/"+y);
			    page.tooltip.style("top", (y) + "px").style("left",  x + "px");

			}).on("mouseout", function(d, i) {
			      page.tooltip.html("");
			    page.tooltip.style("visibility", "hidden");
			});	
		
		log("adding canvas sample mouse listeners");
		var getGeneHtml = function(g) {
		    if (!g) return null;
		    var fusion = vizdata.genes[g];
		    if (!fusion) return null;
		    var h = '<div>';
		    h += '<b>Fusion: </b> '+fusion.id;	
		    if (fusion['type']) h += '<br><b>Type:</b>  ' + fusion['type'];
		    if (fusion['3br']) h += '<br>3 prime bp: ' + fusion['3br'];      
		    if (fusion['5br']) h += '<br>5 prime bp: ' + fusion['5br'];
		    h += '</div>';
		    return h;
		}
		vizdata.canvas.addMouseListeners(vizdata, page, getGeneHtml);
		vizdata.canvas.addControlListeners(vizdata, page);
	    }
	    // ===================================================
	    // X/Y AXIS ORDERING
	    // ===================================================
	    function orderx(value) {
		//log("================= Ordering x by " + value);
		vizdata.curxdomain = value;
		vizdata.xrange.domain(vizdata.sampleorders[value]);

		
		var delay = page.isexport ? 0 : 1000;
		// var t = vizdata.svg.transition().duration(delay);
		var t = d3.select("#"+svgid).transition().duration(delay);

		t.selectAll(".column").delay(function(d, i) {
		    // if (vizdata.nrsamples < 1000 && !page.isexport)
		    // return vizdata.xrange(i) * 2;
		    // else return 0;
		    return 0;
		}).attr("transform", function(d, i) {
		    
		    return "translate(" + vizdata.xrange(i) + "), rotate(-90)";
		});

		if ((value == 'distance' || value == 'reversedistance') && vizdata.samplelinkage
			&& vizdata.samplelinkage.length > 0 && vizdata.nrsamples > MAX_NR_SAMPLES_FOR_TREE) {
		    showWarning("There are too many genes, I didn't compute the distance matrix");
		    $("#orderx option[value='"+value+"']").remove();
		}
		if ((value == 'distance' || value == 'reversedistance') && vizdata.samplelinkage
			&& vizdata.samplelinkage.length > 0 && vizdata.nrsamples <= MAX_NR_SAMPLES_FOR_TREE) {
		    // we don't want to do it for more than
		    // MAX_NR_SAMPLES_FOR_TREE samples :-)
		    topdendro();
		} else {
		    // remove dendrogram, and move labels further down
		    d3.select("#svgtop").remove();
		    $("#svgtop").remove();
		    d3.selectAll(".samplelabel").attr("transform", "translate(" + 5 + ",  0)");
		}
		ordery(vizdata.curydomain);
	    }

	    function ordery(value) {
		//log("================== Ordering y by " + value);
		// check if distance, and if this matrix has already been
		// computed
		var maybeorder = (vizdata.geneorders[value]);
		if (!maybeorder || maybeorder.length < vizdata.nrgenes) {

		    if ((value == 'distance' || value == 'reversedistance')) {
			// we don't want to do it for more than 1000 samples
			// :-)
			showMessage("There is too much data for clustering by distance");
			$("#ordery option[value='"+value+"']").remove();
		    }
		    return;
		}
		vizdata.curydomain = value;		
		vizdata.yrange.domain(vizdata.geneorders[value]);

		var delay = page.isexport ? 0 : 1000;
		// var t = vizdata.svg.transition().duration(delay);
		var t = d3.select("#"+svgid).transition().duration(delay);

		var isexport = page.isexport;
		t.selectAll(".row").delay(function(d, i) {
		    if (vizdata.nrgenes < 100 && !isexport)
			return vizdata.yrange(i);
		    else return 0;
		}).attr("transform", function(d, i) {
		    return "translate(0," + vizdata.yrange(i) + ")";
		}).selectAll(".cell").delay(function(d) {
		    if (d && d.x) return vizdata.xrange(d.x);
		    else {
			var rect = d3.select(this);
			var g = rect.attr("dy");
			var s = rect.attr("dx");			    
			return vizdata.xrange(s);
		    }
		}).attr("x", function(d) {
		    var rect = d3.select(this);
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");
		    return vizdata.xrange(s);
		});
		
		var w = vizdata.xrange.rangeBand();
		
		t.selectAll(".row").delay(function(d, i) {
		    if (vizdata.nrgenes < 100 && !isexport)
			return vizdata.yrange(i);
		    else return 0;
		}).attr("transform", function(d, i) {
		    // console.log("Transforming d="+d);
		    return "translate(0," + vizdata.yrange(i) + ")";
		}).selectAll(".cell1").delay(function(d) {
		    if (d && d.x) return vizdata.xrange(d.x);
		    else {
			var rect = d3.select(this);
			var g = rect.attr("dy");
			var s = rect.attr("dx");			    
			return vizdata.xrange(s);
		    }
		}).attr("x", function(d) {
		    var rect = d3.select(this);
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");
		    return vizdata.xrange(s);
		});
		
		t.selectAll(".row").delay(function(d, i) {
		    if (vizdata.nrgenes < 100 && !isexport)
			return vizdata.yrange(i);
		    else return 0;
		}).attr("transform", function(d, i) {
		    // console.log("Transforming d="+d);
		    return "translate(0," + vizdata.yrange(i) + ")";
		}).selectAll(".cell2").delay(function(d) {
		    if (d && d.x) return vizdata.xrange(d.x);
		    else {
			var rect = d3.select(this);
			var g = rect.attr("dy");
			var s = rect.attr("dx");			    
			return vizdata.xrange(s);
		    }
		}).attr("x", function(d) {
		    var rect = d3.select(this);
		    var g = rect.attr("dy");
		    var s = rect.attr("dx");
		    return vizdata.xrange(s)+w/2;
		});

		if ((value == 'distance' || value == 'reversedistance') && vizdata.genelinkage
			&& vizdata.genelinkage.length > 0 && vizdata.nrgenes <= MAX_NR_GENES_FOR_TREE) {
		    // we don't want to do it for more than 1000 samples :-)
		    sidedendro();
		} else {
		    // remove dendrogram, and move labels further down

		    d3.select("#svgside").remove();
		    // svg.selectAll(".column")
		    //log("Moving main group back left to  page.margin.left "+ page.margin.left);
		    //
		    d3.selectAll(".maingroup").attr("transform", "translate(" + page.margin.left + ", "+ page.margin.top+")");
		    d3.selectAll("#svgtop").attr("transform", "translate(" + page.margin.left + ", "+ page.margin.top+")");
		}
	    }

	    // ===================================================
	    // UTILITY FUNCTIONS
	    // ===================================================
	
	 
	    return {
		SvgCanvas : FusionCanvas,
		showMessage : showMessage,
		showWarning : showWarning,
		showError : showError,
		showLongMessage : showLongMessage,
		getURLParameter : getURLParameter,
		showLoading : showLoading,
		hideLoading : hideLoading,
		mylegend : mylegend
	    };
	});
