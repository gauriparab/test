/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'views/data/auditTrailDetailsView',
    'models/data/audit'].concat(
    'utils/templateFunctions'
), 
    function($,
    		_, 
    		kendo, 
    		KendoGridView, 
    		AuditTrailDetailsView, 
    		Audit){

    	 'use strict';
    		var Transport = kendo.Class.extend({

    	        _grid: null,

    	        /**
    	         * Constructor
    	         * @param options
    	         */
    	        init: function(grid) {
    	            this._grid = grid;
    	        },

    	        /**
    	         * Method for fetching data
    	         *
    	         * @param options
    	         */
    	        read: function(options) {
    	            $.ajax({
    	                url: this._grid._url + '?' + $.param(_.extend({},
    	                    this._parameterMap(options.data),
    	                    this._grid._filters
    	                )),
    	                type: 'POST',
    			data: JSON.stringify(this._grid._filters),
    	                contentType: 'application/json',
    	                success: options.success,
    	                error: options.error
    	            });
    	        },

    	        /**
    	         * Convert kendo grid parameters to spring parameters
    	         *
    	         * @param options
    	         * @returns {Object|*|Mixed}
    	         * @private
    	         */
    	        _parameterMap: function(options) {
    	            return _.reduce(options, function(memo, v, k) {
    	                switch (k) {
    	                case 'take':
    	                    memo['page.size'] = v;
    	                    break;
    	                case 'page':
    	                    memo['page.page'] = v;
    	                    break;
    	                case 'sort':
    	                    _.each(v, function(sortObj) {
    	                        memo['page.sort'] = sortObj.field;
    	                        memo['page.sort.dir'] = sortObj.dir;
    	                    });
    	                    break;
    	                }
    	                return memo;
    	            }, {});
    	        }

    	    });

	 var auditTrailGridView = KendoGridView.extend({

            _url: '/ir/secure/api/auditmanagement/planbyresult',

            _model: Audit,
	
	    _sort: [{
               
            }],

	    initialize: function(options) {
	    	this._filters = { resultId : options.resultId};
            KendoGridView.prototype.initialize.apply(this, arguments);
        },
	
	    showDetails: function(e){
	    	var plan = this.dataItem($(e.currentTarget).closest("tr")).toJSON();
           	var temp = new AuditTrailDetailsView({
           		data: plan
           	});
            temp.render();
       	},

	    _columns: function() {

            	var userColumn  = this.cb()
                    .field('user')
                    .title('User')
                    .build();

                var actionPerformedColumn  = this.cb()
                    .field('actionPerformed')
                    .title('Action Performed')
                    .build();
         	
                var timestampColumn = this.cb()
                    .field('createdOn')
                    .title('Date')
                    .template('#= (createdOn != null) ? kendo.toString(new Date(Date.parse(createdOn)),"yyyy-MM-dd HH:mm") : "" #')
                    .width('18%')
                    .build(); 
                    
                var reasonColumn  = this.cb()
                    .field('reasonChange')
                    .title('Reason')
                    .build();
               
                var recordColumn = this.cb()
                	.field('revId')
                    .title('Record')
                    .command([{name:"details", text:"<img src='/ir/resources/img/record.png' />", click: this.showDetails }])
                    .build();

		 return [
                   timestampColumn,
                   userColumn,
                   actionPerformedColumn,
                   reasonColumn,
                   recordColumn
                ];
            }

        });

        return auditTrailGridView;
});
