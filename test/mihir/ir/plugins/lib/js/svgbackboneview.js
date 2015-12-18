define(
[ "jquery", "backbone", "underscore" ],
function($, Backbone, _) {
	
	var debug = true;
	
	var log = function(msg) {
		if (debug)console.log("svgbackboneview.js: "+msg);
	};
	
	var SvgBackboneView = Backbone.View.extend({		    
	      nameSpace: "http://www.w3.org/2000/svg",
	      _ensureElement: function() {
		//  log("_ensureElement called. This.el="+this.el);
		
	         if (!this.el) {
	            var attrs = _.extend({}, _.result(this, 'attributes'));
	            if (this.id) attrs.id = _.result(this, 'id');
	            if (this.className) attrs['class'] = _.result(this, 'className');
	            var $el = $(window.document.createElementNS(_.result(this, 'nameSpace'), _.result(this, 'tagName'))).attr(attrs);
	            this.setElement($el, false);
	         } else {
	            this.setElement(_.result(this, 'el'), false);
	         }
	      },	     
	      setSvgId: function(name) {		  
		    this.svgid = name ;
	      },
	      getSvgId: function() {
		  if (!this.svgid) {
		      this.svgid = "mysvg";
		  }
		  return this.svgid;
	      }
	  
	   });
		  
	return  {
		SvgBackboneView: SvgBackboneView		
	};
});
