define(
	[ "jquery", "deepmodel", "underscore", "d3", "analysisview", "pluginLib/svgbackboneview", "igv", "multiviz/model/tree", "legend",
	  "pluginLib/rainbowvis",  
	  "pluginLib/d3/bootstrap-tooltip", 
	  "pluginLib/StackBlur", "pluginLib/canvg", "pluginLib/rgbcolor"],
	function($, Backbone, _, d3, analysisview, svgbackbone, igv,  tree, legend, rain, a, b, c) {

	    var debug = true;

	    window.igv = igv;
	    var log = function(msg) {
		if (debug) {
		    var d = new Date(); 
		    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();		    
		    console.log("cnvview.js "+time+" "+msg);
		}
	    };

	    var mylegend = analysisview.mylegend;
	    
	    var showLoading = analysisview.showLoading;
	    var hideLoading = analysisview.hideLoading;
	    var showMessage = analysisview.showMessage;
	    var showLongMessage = analysisview.showLongMessage;
	    var getURLParameter = analysisview.getURLParameter;
	
	    
	    TEXTSTYLE = "font: 9px sans-serif";
	    BOLDSTYLE = "font: 10px sans-serif; font-weight:bold;";
	    LABELDX = 60; // offset of gene labels to the left
	    MAX_NR_GENES_FOR_TREE = 1000;
	    MAX_NR_SAMPLES_FOR_TREE = 150;
	   
	    var CnvCanvas = analysisview.AnalysisCanvas.extend({
		tagName : "div",
		initialize : function(args) {		    
		    analysisview.AnalysisCanvas.prototype.initialize.apply(this, [ args ]);			   
		    this.model = args.model;
		    this.vizdata = this.model.getVizData();
		    this.page = this.model.getPage();
		    this.setSvgId(this.model.getPluginSvgId());
		    svgid = this.getSvgId();  
		},
		clear: function() {
		    
		},
		getModel: function() {
		    return this.model;
		},
		render : function() {
		    // var svg = d3.select(this.el);
		 // log("render, getSvgId="+this.getSvgId()+",
		    // this.el="+this.el+", "+$(this.el));
		    var page = this.page;
		    d3.select("svg").remove();
		    var svg = d3.select(this.el)		  
		    	    .append("svg").attr("id", this.getSvgId())
		    	    .style("width",page.width + page.margin.left + page.margin.right+"px")
			    .style("height",  page.height + page.margin.top + page.margin.bottom+"px")
			    .style("margin-left",0+ "px")			   
			    .append("g")
			    .attr("class", "maingroup")
			    .attr("transform",
			    "translate(" + page.margin.left + "," + page.margin.top + ")")
			    ;

		    var yaxis_name = "gene";
		   
		   // log("render: got svg="+svg);
		    drawPlot(this, this.getSvgId(), svg, this.vizdata, this.page, yaxis_name);
		  
		    return this;
		}
	    });

	   
	    function drawPlot(canvas, svgid, svg, vizdata, page, yaxis_name) {
		log("drawPlot called, yaxis_name=" + yaxis_name+", svg="+svg);
		vizdata.canvas = canvas;
		window.vizdata = vizdata;
		window.page = page;
		
		this.vizdata = vizdata;		
		this.page = page;
		vizdata.svg = svg;
		// ===================================================
		// PROCESS JSON
		// ===================================================
		
		for ( var d in vizdata.heatmapdata.dims) {
		    vizdata.dims.push(vizdata.heatmapdata.dims[d]);
		}
		vizdata.sampledistorder = vizdata.heatmapdata.sampleorder;
		vizdata.genedistorder = vizdata.heatmapdata.geneorder;
		vizdata.samplelinkage = vizdata.heatmapdata.samplelinkage;
		vizdata.genelinkage = vizdata.heatmapdata.genelinkage;

		// console.log("Got sample linkage:"+samplelinkage);
		var sampleindexdict = {};

			
		vizdata.samples = [];
		vizdata.nrsamples = 0;
		
		vizdata.canvas.processSamples(vizdata, page);
		
		// currently limit the nr of genes?
		var maxgenes = 15000;

		vizdata.nrgenes = 0;
		vizdata.genes = vizdata.heatmapdata[yaxis_name];
		if (!vizdata.genes) {
		    log("GOT NO " + yaxis_name + " in heatmap data! Heatmapdata is :" + vizdata.heatmapdata);
		    log("vizdata :" + JSON.stringify(vizdata));
		}
		// else console.log("Got "+genes.length+" genes");

		// ===================================================
		// PROCESS GENES/ANNOTATIONS
		// ===================================================
		for ( var g in vizdata.genes) {	
		    var gene = new Object();
		    // 'gene' : [[1 ,'TP53', 12, 12341324]... []],
		    gene.name=vizdata.genes[g];
		    // gene.chr= put in later when iterating points
		    // gene.pos= put in later when iterating points
		    
		    vizdata.genedata.push(gene);
		 //   log("Got gene: "+JSON.stringify(gene));
		    g = vizdata.nrgenes;
		    vizdata.nrgenes++;
		    if (vizdata.nrgenes > maxgenes) {
			showLongMessage("There are " + vizdata.genes.length
				+ " genedata objects, that is too many to display. The first "
				+ maxgenes + " are shown. You might want to use a filter to reduce the plot size.");
			vizdata.nrgenes = maxgenes;
			break;
		    }
		}

		
		if (vizdata.nrsamples < 1) {
		    showLongMessage("No samples were returned");
		    return;
		}
		if (vizdata.nrgenes < 1) {
		    showLongMessage("There is no CNV data for this selection - no heat map can be computed");
		    return;
		}
		var rainbowtop = new Rainbow();
		rainbowtop.setNumberRange(1, Math.max(vizdata.nrsamples+1,2));
		rainbowtop.setSpectrum('#8833FF', '#1111BB', '#AAFF22', '#FFFF22', '#FFAA22', '#FF0000');
		
		var rainbowside = new Rainbow();
		rainbowside.setNumberRange(1, Math.max(vizdata.nrgenes+1, 2));
		rainbowside.setSpectrum('#8833FF', '#1111BB', '#AAFF22', '#FFFF22', '#FFAA22', '#FF0000');
		
		if (vizdata.nrgenes < 1 || vizdata.nrsamples < 1) {
		   log("I found no results for annotation " + vizdata.yaxis_name + " and variomes "
			    + vizdata.variomes);
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
		    // console.log("Got att:" + att);
		    var option = document.createElement("option");
		    option.text = 'by attribute ' + att;
		    option.value = 'att' + i;
		    dropdown.add(option, null);
		});

		log("Nr genes: " + vizdata.nrgenes + ", nrsamples=" + vizdata.nrsamples);

		for (var g = 0; g < vizdata.nrgenes; g++) {
		    // initialize row
		    // if (g % 50 == 0) console.log("Initializing matrix for
		    // gene "+g);
		    vizdata.matrix[g] = d3.range(vizdata.nrsamples).map(function(s) {
			return {
			    x : s,
			    y : g,
			    z : 0,
			    v : 0
			};
		    });
		}
		log("length matrix: "+vizdata.matrix.length);

		log("Processing " + vizdata.heatmapdata.points.length + " points ");
		// compute min/max for legend
		
		var min = 1000000;
		var max = -1000000;
		
		for ( var p in vizdata.heatmapdata.points) {
		    var point = vizdata.heatmapdata.points[p];
		    
		    
		    var s = point[0];
		    var g = point[1];
		    
		    if (g >= maxgenes) {
			continue;
		    }
		    // 0 1 2 3 4 5 6
		    // 'dims': ['sample', 'gene', 'confidence', 'ploidy', 'chr',
		    // 'pos', 'epos'],
		    if (point.length > 4) {
			// add pos to gene object
			if (!vizdata.chr || vizdata.chr.length <1 ||  vizdata.chr === point[4]) {
			    vizdata.genedata[g].chr = point[4];
			}
			else {
			    continue;
			}
		    }
		    // 0 1 2 3 4 5 6
		    // 'dims': ['sample', 'gene', 'confidence', 'ploidy', 'chr',
		    // 'pos', 'epos'],
		    var conf = point[2];
		    
		    var ploidy = point[3];
		 //   log("Processing point "+p+":"+JSON.stringify(point)+", g="+g+", s="+s+", conf="+conf+", pl="+ploidy);
		    var score = ploidy;
		    var matrixobj = new Object();
		    if (score > max) {
			max = score;
		    }
		    if (score < min) {
			min = score;
		    }
		    matrixobj.z = score;
		    matrixobj.c = conf;
		    matrixobj.p = ploidy;
		    matrixobj.g = g;
		    matrixobj.y = g;
		    matrixobj.x = s;

		   
		    if (point.length > 5) {
			// add pos to gene object
			vizdata.genedata[g].pos = point[5];
		    }
		    if (point.length > 6) {
			vizdata.genedata[g].epos = point[6];
		    }		  

		   // if (s < vizdata.nrsamples && g < vizdata.nrgenes) {
			vizdata.matrix[g][s] = matrixobj;

		//	log("		matrixobj "+p+":"+JSON.stringify(vizdata.matrix[g][s]));
		  //  } 
		}

		// check if all genes have data points
		for (var i = 0; i < vizdata.nrgenes; i++) {
		    var nr = 0;
		    for (var j = 0; j < vizdata.nrsamples; j++) {
			if (vizdata.matrix[i][j].c > 0 || vizdata.matrix[i][j].g > 0) {
			    nr = nr+1;
			}
			
		    }
		    if (nr == 0) {
			log("Found no data for gene "+ i+"="+vizdata.genes[i]+":"+JSON.stringify(vizdata.matrix[i]));
		    }
		}
		
		mylegend.setMarginLeft(50);
		mylegend.setWidth(Math.min(800, Math.max(page.width+page.margin.left), 600));	
		mylegend.findScoring(vizdata.score);
		mylegend.findScale("redblue");
		
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
		    name : d3.range(vizdata.nrgenes).sort(function(a, b) {
			return d3.ascending(vizdata.genedata[a].name, vizdata.genedata[b].name);
		    }),
		    position : d3.range(vizdata.nrgenes).sort(function(a, b) {
			// fix: either convert to numberic so that sorting is
			// correct... or else sort first by chrand then by pos
			return d3.ascending(vizdata.genedata[a].chr*100000000+vizdata.genedata[a].pos, vizdata.genedata[b].chr*100000000+vizdata.genedata[b].pos);
		    }),
		    distance : vizdata.genedistorder,
		    reversedistance : vizdata.genedistorder.slice(0).reverse()
		};

		vizdata.posorder = vizdata.geneorders.position;
		vizdata.reversepos = [];
		for (p in vizdata.posorder) {
		    var g = vizdata.posorder[p];
		    vizdata.reversepos[g] = p;
		}
		// The default sort order.
		vizdata.yrange.domain(vizdata.geneorders.position);
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
		    log("=========== Topdendro called. Removing svgtop first, then adding it = only for < 100 samples");
		    d3.select("#svgtop").remove();
		    var top = d3.selectAll("svg").append("g").attr("id", "svgtop").attr("transform",
			    "translate(" + page.margin.left + "," + page.margin.top + ")");
		    page.labely = 0;
		    log("Got svvtop: "+top);
		    // draw top dentrogram
		    var level = 0;
		    var dh = 4;
		    if (vizdata.nrsamples > 100) dh = 3;
		    
		    if (vizdata.nrsamples > 150) {
			showMessage("The dendrogram would get too large, I won't draw it");
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
		    // console.log("Sampleorder is: "+order);

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
			// console.log("got nodes: "+nodea.toString()+" and "+
			// nodeb.toString());
			var nodec = new Node(nodenr, nodea, nodeb);
			nodes[nodenr] = nodec;
			// console.log("got new node: "+nodec.toString());

			var x1 = nodea.x;
			var x2 = nodeb.x
			// then, replace the position of THIS node with the
			// middle

			var ya = nodea.y;
			var yb = nodeb.y;
			var y2 = Math.min(ya, yb) - dh;

			nodec.x = (x1 + x2) / 2;
			nodec.y = y2;

			// console.log("a/b= "+a+"/"+b+", xa/xb="+x1+"/"+x2+",
			// ya/b="+ya+"/"+yb+", y2="+y2);
			// but also for all nodes between a and b
			var ordera = order.indexOf(a);
			var orderb = order.indexOf(b);
			// console.log(" Changing y from "+ordera+" to
			// "+orderb);
			for (var j = ordera; j <= orderb; j++) {
			    var n = nodes[order[j]];
			    if (n) n.setAllY(y2);
			    // console.log(" Setting ypos of "+n.toString() +"
			    // to "+y2);
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
		    // console.log("page.labelyy="+page.labely+",
		    // margin.top="+page.margin.top);
			if (page.labely +100> page.margin.top) {
			    page.margin.top = page.labely+100;
			    console.log("New page margin top is: "+page.margin.top);
			    d3.selectAll(".maingroup").attr("transform", "translate(" + 0, ", "+page.margin.top+")");
			    d3.selectAll("#svgtop").attr("transform", "translate(" + 0 + ", "+page.margin.top+")");
			}
		    // console.log("Moving samplelabels by "+2*page.labely);
		    d3.selectAll(".samplelabel").attr("transform", "translate(" + (page.labely) + ", 0)");
		};
		// ===================================================
		// DENDROGRAM ON TOP
		// ===================================================
		sidedendro = function() {
		    log("Side Dendro: =========== sidedendro called. Removing svgside first, then adding it");
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
			// console.log("got new node: "+nodec.toString());

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
			// console.log("a/b= "+a+"/"+b+", xa/xb="+x1+"/"+x2+",
			// ya/b="+ya+"/"+yb+", y2="+y2);
			// but also for all nodes between a and b
			var ordera = order.indexOf(a);
			var orderb = order.indexOf(b);
			// console.log(" Changing y from "+ordera+" to
			// "+orderb);
			for (var j = ordera; j <= orderb; j++) {
			    var n = nodes[order[j]];
			    if (n) n.setAllX(x3);
			    // console.log(" Setting ypos of "+n.toString() +"
			    // to "+y2);
			}
			
			var color =  "#"+rainbowside.colourAt(i);
			var w = 1;
			
			// console.log("x3="+(x3)+", page.labelx="+page.labelx);
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
		  
		// console.log("Margin.left="+page.margin.left+",
		// samplewidth="+LABELDX+", dendrowidth="+dendrowidth+",
		// smallestx="+smallestx+", s+d="+(LABELDX+dendrowidth));
		    page.labelx  = 0;
			
		    page.margin.left = page.margin.left+difference;
		    
		// console.log("Dendro: Moving maingroup by "+difference+" to
		// "+(page.margin.left+page.labelx));
		// console.log("Dendro: Moving side den by "+difference+" to
		// "+(page.margin.left+difference-LABELDX));
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
		    // console.log("Processing row");
		    // var w = Math.max(xrange.rangeBand() / loci.length, 6);
		    var w = vizdata.xrange.rangeBand();
		    // var stepx = (xrange.rangeBand() - w) / loci.length;
		    var cell = d3.select(this).selectAll(".cell").data(row.filter(function(d) {
			return d.c || d.g;
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
		    
		   
		    // .style("filter", "url(#drop-shadow)")
		    .style("fill-opacity", function(d) {
			return 0.75;
		    }).style("fill", function(d) {
			if (d.c || d.g) {
			    return mylegend.getColor(d.z);
			} else {
			    log("Not drawing cell "+d.x+"/"+d.y);
			    return 'rgba(255,255,0, 0.8)';
			}
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

		var isNewChromosome = function (g) {
		    	
		    	var p = vizdata.reversepos[g];
		        var chr = vizdata.genedata[g].chr;
		        //if (p > 0) log("chr = "+chr+", prev chr = "+vizdata.genedata[vizdata.posorder[p-1]].chr);
		    	var showchr = (p == 0 || +vizdata.genedata[vizdata.posorder[p-1]].chr != chr);
		    	return showchr;
		};
		row.append("text").attr("x", -LABELDX).attr("y", 11).attr("dy", "0")
			.attr("text-anchor", "begin")
			.attr("style", TEXTSTYLE)
			.attr("class", "genelabel")
        		.attr("g", function(d, i) {
        		    	return i;
        		})
        		.text(
			function(d, i) {
			    if (i >= vizdata.nrgenes) return null;
			    if (vizdata.nrgenes < 2000 || i % 1 == 0) {
				return vizdata.genedata[i].name;
			    }
			    else return "";
			});
		
		row.append("text").attr("x", 
			function(d, i) {		    
				if (isNewChromosome(i)) return -LABELDX-40;
			    	else return -LABELDX;		    
			}).attr("y", 11).attr("dy", "0")
				.attr("text-anchor", "begin")
				.attr("style", BOLDSTYLE)
				//.attr("transform", "rotate(0)")
				.attr("class", "chrlabel")
				.text(
				function(d, i) {
				    if (i >= vizdata.nrgenes) return null;
				    if (vizdata.nrgenes < 2000 || i % 1 == 0) {
					if (isNewChromosome(i)) return "CHR "+vizdata.genedata[i].chr;
				    	else return "";
				    }
				    else return "";
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
		
		var delay = page.isexport ? 0 : 2000;
		
		
		var timeout = setTimeout(function() {
		    var ox = getURLParameter("orderx");
		    if (!ox) ox = "distance";
		    var oy = getURLParameter("ordery");
		    if (!oy) oy = "position";
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
		    } else {
			log("NOT Updating color of "+g+"/"+s);
			return 'rgba(255,255,0, 0.8)';
		    }
		});	
	    };
	    
	    function addControlListeners(svgid, vizdata, page ) {
		log("====== ADDING ORDERX, ORDERY, SCORE etc LISTENERS");
		$(".ordery").click(function() {
		    clearTimeout(timeout);		   
		    $(".ordery").parent().removeClass("selected");
		    console.log("Ordery class clicked with  "+$(this).attr('value'));
		    $(this).parent().addClass("selected");
		    ordery($(this).attr('value'));
		    
		    var text = $(this).text();
		    $("#geneorder").text("Gene Order ("+text+")");
		    
		});
		
		$(".orderx").click(function() {
		    $(".orderx").parent().removeClass("selected");
		    console.log("Orderx class clicked with  "+$(this).attr('value'));
		    $(this).parent().addClass("selected");
		    orderx($(this).attr('value'));
		    
		    var text = $(this).text();
		    $("#sampleorder").text("Gene Order ("+text+")");
		});
		
		$(".chr").click(function() {
		    var chr = $(this).attr('value');
		    console.log("Chr class clicked with  "+chr);
		    canvas.getModel().setChromosomeFilter(chr);
		    console.log("Filtering with chromosome "+chr+", calling plugin.reload()");
		    vizdata.chr = chr;
		    plugin.reload();
		});
		
		

		$(".score").click(function() {
		    $(".score").parent().removeClass("selected");
		    console.log("score class clicked with  "+$(this).attr('value'));
		    $(this).parent().addClass("selected");
		    vizdata.score = $(this).attr('value');
		    log("Updating legend with new scoring function: "+vizdata.score+" actually, need to reload chart");
		    mylegend.findScoring(vizdata.score);
		    mylegend.addLegend();
		});
		
		$(".scale").click(function() {
		    $(".scale").parent().removeClass("selected");
		    console.log("scale class clicked with  "+$(this).attr('value'));
		    $(this).parent().addClass("selected");
		    var key = $(this).attr('value');
		    var scale = mylegend.findScale(key);
		    log("replacing color scale with "+scale);
		    mylegend.addLegend();
		    updateColor(svgid);
		});
	    };
	    
	    function addMouseListeners(svgid, vizdata, page) {
		addControlListeners(svgid, vizdata, page);
	// console.log("---------- Adding mouse listeners for tooltip");
		var svg = vizdata.svg;		
		updateColor(svgid);
		// console.log("Also changing height of chart - must also happen
		// here, after rendering is done");
		d3.selectAll("#"+svgid)
			.style("height", (page.height + page.margin.top)+"px")
			.style("width", (page.width + page.margin.left+page.labelx+page.margin.right)+"px");
		
		d3.selectAll(".cell").on(
				"mousedown",
				function(arg, i) {
				    var rect = d3.select(this);
				    log("-------------- mouse clicked for rect="+rect);
				    var g = rect.attr("dy");
				    var s = rect.attr("dx");
				    if (g >=0 && s >=0) { 
	        			    var d = vizdata.matrix[g][s];	        			
	        			    if (d.c) {
	        				var variome = vizdata.variomes[s];
	        				if (variome) {
	        				    log("Adding link to variant detail card "+JSON.stringify(variome));        					        				    
	        				}
	        				else log("No variome at  s="+s+", variomes="+JSON.stringify(vizdata.variomes));
	        				
	        			    }
				    }
				});
		d3.selectAll(".cell").on(
			"mouseover",
			function(arg, i) {
			    var rect = d3.select(this);
			  // console.log("-------------- mouseover for
			    // rect="+rect);
			    var g = rect.attr("dy");
			    var s = rect.attr("dx");
			    if (g && s) { 
        			    var d = vizdata.matrix[g][s];
        			 // console.log("-------------- mouseover for
				    // x="+x+", g="+g+", s="+s+", d="+d);
        			    if (d) {
        				// console.log("-------------- mouseover
					// for d.x="+d.x);
        				var h = '<div><b>Sample: </b> ' + vizdata.samples[d.x].name;
        				var variome = vizdata.variomes[s];
        				 if (variome && variome.getAnalysis()) {
        					    var index = vizdata.analysislist.indexOf(variome.getAnalysis().getName());
        					    var color = vizdata.analysisLegend.getColor(index);
        					    //log("Got an: "+an);
        					    var an ='<br><b>Analysis:</b> <span style="background-color: '+color+'">&nbsp;&nbsp;</span><br>'+ variome.getAnalysis().getName(); 
        					    h += an;
        				    }
        				if (d.c) h += '<br><b>Confidence: </b>' + d.c;
        				var gene = vizdata.genedata[g];
        				h += '<br><b>Ploidy: </b>' + d.p 
        					+ ' <span style="opacity: 0.75; background-color: ' + mylegend.getColor(d.z);
        				h += '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        				
        				h += '<br>Gene: ' + gene.name;
        				if (gene.chr) h += '<br>Location: chr' + gene.chr;
        				if (gene.pos) h += ':' + gene.pos;
        				else h += ':0';
        				if (gene.epos) h += '-' + gene.epos;
         				// h += '<br>(click to see detail
					// card)';
        				h += '</div>';
        				page.tooltip.html(h);
        				// console.log("Showing tt: "+h);
        				page.tooltip.style("visibility", "visible");
        			    }
			    }
    			    return page.tooltip;

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
				//    log("Got x/y = "+x+"/"+y);
				    page.tooltip.style("top", (y) + "px").style("left",  x + "px");

				}).on("mouseout", function(d, i) {
				      page.tooltip.html("");
				    page.tooltip.style("visibility", "hidden");
				});	
			
			log("adding canvas sample mouse listeners");
			vizdata.canvas.addMouseListeners(vizdata, page);
			vizdata.canvas.addControlListeners(vizdata, page);
	    }
	    // ===================================================
	    // X/Y AXIS ORDERING
	    // ===================================================
	    function orderx(value) {
		log("================= Ordering x by " + value);
		vizdata.curxdomain = value;
		vizdata.xrange.domain(vizdata.sampleorders[value]);

		var delay = page.isexport ? 0 : 2000;
		// var t = vizdata.svg.transition().duration(delay);
		var t = d3.select("#"+svgid).transition().duration(delay);
		
		t.selectAll(".column").delay(function(d, i) {
		    return 0;
		}).attr("transform", function(d, i) {
		    return "translate(" + vizdata.xrange(i) + "), rotate(-90)";
		});

		if ((value == 'distance' || value == 'reversedistance') && vizdata.samplelinkage
			&& vizdata.samplelinkage.length > 0 && vizdata.nrsamples > MAX_NR_SAMPLES_FOR_TREE) {
		    showMessage("There are too many genes, I didn't compute the distance matrix");
		    $("#orderx option[value='"+value+"']").remove();
		}
		if ((value == 'distance' || value == 'reversedistance') && vizdata.samplelinkage
			&& vizdata.samplelinkage.length > 0 && vizdata.nrsamples <= MAX_NR_SAMPLES_FOR_TREE) {
		    // we don't want to do it for more than
		    // MAX_NR_SAMPLES_FOR_TREE samples :-)
		    topdendro();
		} else {
		    // remove dendrogram, and move labels further down
		    d3.selectAll("#svgtop").remove();
		    $("#svgtop").remove();
		    // svg.selectAll(".column")
		     // console.log("Moving sample labels to 5 ");
		    // vizdata.svg.selectAll(".samplelabel").attr("transform",
		    // "translate(" + 0 + ", 0)");
		    d3.selectAll(".samplelabel").attr("transform", "translate(" + 5 + ",  0)");
		}
		ordery(vizdata.curydomain);
	    }

	    function ordery(value) {
	// log("================== Ordering y by " + value);
		// check if distance, and if this matrix has already been
		// computed
		var maybeorder = (vizdata.geneorders[value]);
		if (!maybeorder || maybeorder.length < vizdata.nrgenes) {

			if ((value == 'distance' || value == 'reversedistance')) {
			    // we don't want to do it for more than 1000 samples
			    // :-)
			    showMessage("I didn't compute the value for "+value+" (I will remove the option)");
			    $("#ordery option[value='"+value+"']").remove();
			}
		     return;
		}
		vizdata.curydomain = value;		
		vizdata.yrange.domain(vizdata.geneorders[value]);

		var delay = page.isexport ? 0 : 2000;
		// var t = vizdata.svg.transition().duration(delay);
		var t = d3.select("#"+svgid).transition().duration(delay);

	
		var removeChr = vizdata.curydomain && vizdata.curydomain != "position";
		if (removeChr) {
		    log("removing chr, class .chrlabel");
		    t.selectAll(".chrlabel").style("opacity", 0);     //text("");			

		}
		else t.selectAll(".chrlabel").style("opacity", 1);     //text("");
	    	   
		t.selectAll(".row").delay(function(d, i) {
		    if (vizdata.nrgenes < 100 && !page.isexport)
			return vizdata.yrange(i);
		    else return 0;
		}).attr("transform", function(d, i) {
		    // console.log("Transforming d="+d);
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

		if ((value == 'distance' || value == 'reversedistance') && vizdata.genelinkage
			&& vizdata.genelinkage.length > 0 && vizdata.nrgenes <= MAX_NR_GENES_FOR_TREE) {
		    // we don't want to do it for more than 1000 samples :-)
		    sidedendro();
		} else {
		    // remove dendrogram, and move labels further down
		    d3.select("#svgside").remove();
		    // svg.selectAll(".column")
		    d3.selectAll(".maingroup").attr("transform", "translate(" + page.margin.left + ", "+ page.margin.top+")");
		    d3.selectAll("#svgtop").attr("transform", "translate(" + page.margin.left + ", "+ page.margin.top+")");
		}
	    }	  
	  
	    return {
		SvgCanvas : CnvCanvas,
		getURLParameter : getURLParameter,
		showMessage: showMessage,
		showLongMessage: showLongMessage,
		showLoading: showLoading,
		hideLoading: hideLoading
	    };
	});
