define(
	[ "jquery", "deepmodel", "underscore", "d3", "pluginLib/svgbackboneview", "pluginLib/colorlegend" ],
	function($, Backbone, _, d3, svgbackbone, c) {

	    var debug = true;

	    var log = function(msg) {
		if (debug) {
		    var d = new Date();
		    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
		    console.log("legend.js " + time + " " + msg);
		}
	    };

	    // log("Loading color legend");
	    function ColorScale(key, name, colors) {
		this.key = key;
		this.name = name;
		this.colors = colors;
	    }

	    // the FIRST color is benign, the LAST color is damaging
	    var greenred = [ "rgb(0, 103, 31)", "rgb(200,200,103)", "rgb(103, 0, 31)" ];
	    var bluered = [ "rgb( 5, 48, 97)", "rgb(230,230,255)", "rgb(103, 0, 31)" ];
	    var grayScale = [ "rgb(235,235,235)", "rgb(128,128,128)", "rgb( 0,0,0)" ];
	    var redScale = [ "rgb(235,235,235)", "rgb(255, 0, 31)", "rgb(103, 0, 31)" ];
	    var redblue = [ "rgb(255, 0, 31)", "rgb(230,230,255)", "rgb( 5, 48, 97)" ];
	    var rainbow = ['#8833FF', '#1111BB', '#AAFF22', '#FFFF22', '#FFAA22', '#FF0000'];
	    
	    var thermoBlue = [ "rgb(200,200,200)", "rgb(158,206,235)", "rgb(41,62,107)" ];
	    var thermoePurple = [ "rgb(200,200,200)", "rgb(122,102,145)", "rgb(120,37,111)" ];
	    var thermoGreenRed = [ "rgb(85,132,118)", "rgb(242,203,101)", "rgb(238,49,52)" ];

	    var ColorScales = [ new ColorScale("bluered", "Blue-white-red", bluered),
		    new ColorScale("thermoblue", "Thermo white-blue", thermoBlue),
		    new ColorScale("thermopurple", "Thermo white-purple", thermoePurple),
		    new ColorScale("thermogreenred", "Thermo green-yellow-red", thermoGreenRed),
		    new ColorScale("gray", "White-gray-black", grayScale),
		    new ColorScale("red", "White-red", redScale), new ColorScale("redblue", "red-blue", redblue),
		    new ColorScale("greenred", "Green-yellow-red", redScale), 
		    new ColorScale("rainbow", "Rainbow", rainbow)];

	    function Scoring(key, name, desc, min, max, mid, rev, islog) {
		this.key = key;
		this.name = name;
		this.desc = desc;
		this.min = min;
		this.max = max;
		this.islog = islog;
		this.labels = undefined;
		if (mid)
		    this.middle = mid;
		else this.middle = (min + max) / 2;
		// whether large is actually good
		if (rev)
		    this.reverse = rev;
		else this.reverse = false;
	    }

	    var PlainScoring = new Scoring("plain", "Value", "Number of observations", 0, 100);

	    var PValueScoring = new Scoring("pvalue", "P-value", " Probabilistic scoring", -100, 100);

	    var EffectsScoring = new Scoring(
		    "effect",
		    "Variant Impact",
		    "functional impact and location impact",
		    0, 10, 5, false);

	    var SIFT = new Scoring(
		    "sift",
		    "SIFT",
		    "A SIFT score predicts whether an amino acid substitution affects protein function.\nThe SIFT score ranges from 0.0 (deleterious) to 1.0 (tolerated).",
		    0, 1.0, 0.5, true);

	    var Grantham = new Scoring(
		    "grantham",
		    "Grantham",
		    "The Grantham score attempts to predict the distance between two amino acids, in an evolutionary sense. A lower Grantham score reflects less evolutionary distance. A higher Grantham score reflects a greater evolutionary distance",
		    5, 215, 100, false);

	    var PolyPhen2 = new Scoring(
		    "polyphen2",
		    "PolyPhen2",
		    "The PolyPhen-2 score predicts the possible impact of an amino acid substitution on the structure and function of a human protein. This score represents the probability that a substitution is damaging. Ion Reporter™ Software reports the pph2-prob PolyPhen-2 score",
		    0, 1, 0.5, false);

	    var Ploidy = new Scoring("ploidy", "ploidy", "The ploidy", 0, 5, 2, false);

	    var FusionStrength = new Scoring("fusion_strength", "Fusion count",
		    "Fusion count (the number of reads)", 0, 1, 10000, true, true);

	    var PhyloP = new Scoring("phylop", "PhyloP",
		    "PhyloP scores measure evolutionary conservation at individual alignment sites", -14, 3, 0, false);

	    var ScoringFunctions = [ PlainScoring, PValueScoring, EffectsScoring, SIFT, Grantham, PhyloP, PolyPhen2,
		    Ploidy, FusionStrength ];

	    var Legend = Backbone.DeepModel.extend({
		initialize : function(args) {
		   // log("Creating new legend");
		},
		// overwrite in subclasses
		defaults : {
		    "color_scale" : ColorScales[1],
		    "scale" : undefined,
		    "color_scale_name" : "red blue scale",
		    "scoring" : PlainScoring,
		    "nr_boxes" : 50,
		    "width" : 600,
		    "height" : 50,
		    "marginleft" : 100,
		    "scale_type: " : "linear" // 'linear', 'quantile',
						// 'ordinal'
		},
		findScoring : function(key) {
		    // log("Finding score "+key);
		    for (s in ScoringFunctions) {
			var score = ScoringFunctions[s];

			if (score.key.toLowerCase() == key.toLowerCase()) {
			    // log("Found it: "+score.name);
			    this.setScoring(score);
			    return score;
			}
		    }
		    log("====== Could not find score: " + key);
		    return null;
		},
		findScale : function(key) {
		    for (s in ColorScales) {
			var scale = ColorScales[s];
			// log("Finding scale "+key+": "+scale.key);
			if (scale.key.toLowerCase() == key.toLowerCase()) {
			    // log("Found it: "+scale.name+", colors:
			    // "+scale.colors);
			    this.setColorScale(scale);
			    this.computeScale();
			    return scale;
			}
		    }
		    log("Could not find scale: " + key);
		    return null;
		},
		getWidth : function() {
		    return this.get("width");
		},
		setWidth : function(m) {
		    this.set({
			"width" : m
		    });
		},
		setHeight : function(m) {
		    this.set({
			"height" : m
		    });
		},
		setMarginLeft : function(m) {
		    this.set({
			"marginleft" : m
		    });
		},
		getScoring : function() {
		    return this.get("scoring");
		},
		setScoring : function(s) {
		    this.set({
			"scoring" : s
		    });
		},
		getScale : function() {
		    return this.get("scale");
		},
		setScale : function(s) {
		    this.set({
			"scale" : s
		    });
		},
		getNrBoxes : function() {
		    return this.get("nr_boxes");
		},
		setNrBoxes : function(m) {
		    this.set({
			"nr_boxes" : m
		    });
		},
		getMin : function() {
		    return this.getScoring().min;
		},
		setMin : function(m) {
		    this.getScoring().min = m;
		},
		getMax : function() {
		    return this.getScoring().max;
		},
		setMax : function(m) {
		    this.getScoring().max = m;
		},
		setMiddle : function(m) {
		    this.getScoring().middle = m;
		},
		getColorScale : function() {
		    return this.get("color_scale");
		},
		setColorScale : function(scale) {
		    this.set({
			"color_scale" : scale
		    });
		    this.computeScale();
		},
		getTitle : function() {
		    return this.getScoring().name;
		},
		getDescription : function() {
		    return this.getScoring().desc;
		},
		getColorScaleName : function() {
		    return this.get("color_scale_name");
		},
		setColorScaleName : function(scale) {
		    this.set({
			"color_scale_name" : scale
		    });
		},
		computeScale : function() {
		    // linear scale, 3 colors
		    var scale = this.getColorScale();
		    var scoring = this.getScoring();
		    var middle = scoring.middle;
		    // clone in case we reverse it!
		    // log("computeScale: Got color scale "+scale.key);
		    var colors = scale.colors.slice(0);
		    var reverse = scoring.reverse;
		    if (reverse == true) {
			colors = colors.reverse();
			//log("Reversing colors so that the third color is BAD. Color is: " + JSON.stringify(colors));
		    } 
		    //else ("Scale is NOT reverse");
		    var scale = undefined;

		    var islog = scoring.islog;
		    if (islog) { 
		//	log("Log scale");
			var max = Math.max(0.1, this.getMax());
			var min = Math.max(0.1, this.getMin());
//			var lmin = this.getMin()/max+0.001;
//			var lmax = 1;
			if (colors.length == 3) {
    			//    log("Log scale, 3 colors: "+min+", "+middle+", "+max+", mapping to : "+colors);			   			   
    			    scale = d3.scale.log().domain([ min, middle, max ]).range(colors);
    		    	} else if (colors.length == 2) {
    			    // log("2 colors");
    		    	    scale = d3.scale.log().domain([ lmin, lmax ]).range(colors);
    		    	}
		    }
		    else { 
        		    if (colors.length == 3) {
        			// log("3 colors");
        			scale = d3.scale.linear().domain([ this.getMin(), middle, this.getMax() ]).range(colors);
        		    } else if (colors.lengt == 2) {
        			// log("2 colors");
        			scale = d3.scale.linear().domain([ this.getMin(), this.getMax() ]).range(colors);
        		    }
        		    else {
        			scale = d3.scale.linear().domain([ this.getMin(), this.getMax() ]).range(colors);
        			
        		    }
		    }
		    this.setScale(scale);
		    return scale;
		},
		getColor : function(value, debug) {
		    var scale = this.getScale();
		    if (!scale) {
			scale = this.computeScale();
		    }
		    value = parseFloat(value);
		    if (value > this.getMax()) value = this.getMax();
		    if (value < this.getMin()) value = this.getMin();
		    if (debug) {
			log("Computing color for value "+ value+" and scale="+this.getColorScale().key+", min-max="+this.getMin()+"-"+this.getMax());
		    }
		    var color = scale(value);
		    return color;
		},
		addMouseListeners : function() {
		    var leg = this;
		   // log("Adding mouse listener to colorlegend-rects");
		    d3.selectAll(".colorlegend-rects").on("mouseover", function(arg, i) {
			var element = d3.select(this);// rect element
			var score = element.attr("s");

			//log("mouseover colorlegend, score = " + score + ", element=" + element);
			if (score) {
			    var s= parseFloat(score);
			    var h = '<div>';
			    var scoring = leg.getScoring();
			    h += '<b>Name: </b> ' + leg.getTitle();
			    h += '<br><b>Description: </b> ' + leg.getDescription();
			    
			    h += '<br><b>'+ scoring.name+':</b> ';
			    var value = parseFloat(score).toFixed(2);
			    if (scoring.islog) {
				 value = parseFloat(score).toFixed(0);
			    }
			    
			    if (scoring.labels && scoring.labels.length > 0) {
				value = parseFloat(score).toFixed(0);
				if (scoring.labels.length > value) {
				    h +=  scoring.labels[value];
				} 
				else h +=  value;
			    }
			    else {
				h +=  value;
			    }
			    h += ' <span style="opacity: 0.75; background-color: ' +  leg.getColor(s);
			    h += '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
			 //   var rev = leg.getScoring().reverse;
			 //   if (rev) h += '<br>scale is reversed';
			    h += '</div>';

			    page.tooltip.html(h);
			    page.tooltip.style("visibility", "visible");
			}
			return page.tooltip;

		    }).on("mousemove", function(d, i) {
			var x;
			var y;
			//log("Mousemove legend. offset=" + JSON.stringify($(this).offset()));
			var offset = $(this).offset();
			x = offset.left;
			y = offset.top - 300;
			//log("Got x/y = " + x + "/" + y);
			page.tooltip.style("top", (y) + "px").style("left", x + "px");

		    }).on("mouseout", function(d, i) {
			page.tooltip.html("");
			return page.tooltip.style("visibility", "hidden");
		    });
		},
		addLegend : function(divid) {
		    if (!divid) divid = "plotlegend";
		    var scale = this.computeScale();
		    var bw = this.getWidth() / this.getNrBoxes();
		    var target = "#" + divid;
		    d3.select(target).empty();
		    $(target).empty();

		    var marginleft = this.get("marginleft");
		    var height = this.get("height");
		    var type = "linear";
		    var scoring = this.getScoring();
		    if (scoring.islog) {
			//log("Using log scoring");
			type="log";
		    }
		    colorlegend(target, scale, type, {
			title : this.getTitle(),
			boxHeight : 10,
			boxWidth : bw,
			labels: scoring.labels,
			linearBoxes : this.getNrBoxes()
		    }, height, marginleft);
		    this.addMouseListeners();
		}
	    });

	    // return color legend object, scoring functions and color scales
	    return {
		Legend : Legend,
		ScoringFunctions : ScoringFunctions,
		ColorScales : ColorScales
	    };

	});
