/**
 * 
 */
 
define('global', {
        _version: "e699609",
        rootcontext: "/ir/",
        //resources: "../../public-resources/",
        resources: "/ir/resources/",
        csrfToken: "0b6e2441-d545-4f86-99d6-837a13d7d3c1" 
	}
);

var multiviz = '/ir/plugins/multiviz/';
var pluginLib = '/ir/plugins/lib/js/';

require.config({
	urlArgs : 'v=123',
	baseUrl : '/ir/resources/js/',	
	paths : {
	    	/** standard libararies of IR */
		jquery : 'lib/jquery-1.9.1.min',
		underscore : 'lib/underscore-1.6.0',
		backbone : 'lib/backbone-min-1.0.0',		
		bootstrap : 'lib/bootstrap.min',					
		igv : 'lib/igv',
		
		/** general libraries that are not part of the IR libraries (yet), such as d3 etc */
		'pluginLib': pluginLib,
		 		
		 /** extension of Backbone to support nested variables */
		 deepmodel : pluginLib+'deep-model.min',		
		 
		 /** d3 graphics libary for charts */
		 d3 : pluginLib+'d3/d3.v3',
		 
		 /** better canvas support */
		 fabric : pluginLib+'fabric.require',
		 		 
		 /** object for dealing with color scales and legends */
		 legend : multiviz+'js/legend',
		 analysisview : multiviz+'js/model/analysisview',
		 
		 /** base folder for multi viz related code */
		 'multiviz': multiviz+'js',	
			
		 /** The adapter determines how the client talks to the server.*/
		 serveradapter : multiviz+'js/adapter/serveradapter',	
		 /** iradapter: through ir. The python server is defined on the IR server side. 
		  *  mordoradapter: talks directly to the mordor test python server on port 9000. 
		  *  localadapter: talks to localhost python server 
		 *   directadapter: talks to production python server, but without going through IR layer */
		 adapter : multiviz+'js/adapter/directadapter',
		 
		 /** the references to the plugins */
		 'geneffects': multiviz+'geneffects/js',
		 'fusion': multiviz+'genefusions/js',
		 'cnv': multiviz+'cnv/js'
	},
	shim : {
		underscore : {
			exports : '_'
		},
		jquery : {
			exports : '$'
		},						
		d3 : {
		    	deps : [ "jquery" ],
			exports : 'd3'
		},
		deepmodel : {
			deps : [ "underscore", "backbone" ],
		},
		backbone : {
			deps : [ "underscore", "jquery" ],
			exports : "Backbone"
		},		
		bootstrap : {
			deps : [ "jquery" ],
			exports : "$.fn.popover"
		}		
		
	}
});