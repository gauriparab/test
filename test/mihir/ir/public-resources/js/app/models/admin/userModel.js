/*global define:false*/
define([
        'backbone',
        'jquery',
        'underscore',
        "i18n",
        'models/baseModel',
        'views/common/auditReasonView',
        'models/common/reasonModel'
        ], function(
        	Backbone,
        	$,
        	_,
        	i18,
        	BaseModel,
        	AuditReasonView,
        	ReasonModel
        ) {

    'use strict';

    var EDIT_USER_ACTION = 'EDIT';
    
    var UserModel = Backbone.Model.extend({

        urlRoot : '/ir/secure/api/user',

        methodUrl : {
        	'create' : '/ir/secure/api/user/create',
        	'update' :'/ir/secure/api/user/update'
        },
        
        defaults : {
            visibilityPreference : "DEFAULT",
            rdxState : "ENABLED"
        },
        
        initialize: function(options) {
        	var that = this;
        	/*this.needsReason = false;
        	
        	this.reasonModel = new ReasonModel({
        		obj:'user'
        	});
        	
        	this.reasonModel.fetch({
        		success:function(){
        			var temp = that.reasonModel.toJSON();
        			that.needsReason = temp.needsReason;
        		}
        	});*/
        	
        },
        
        sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	}
		    else {
		    	options.url= this.urlRoot+'/getUser?id='+model.toJSON().id;
		    }
		    /*if(method === 'create' || method ==='update'){
            	if(this.needsReason){
            		AuditReasonView.open(function() {
    		  			model.set("reason", document.getElementById("reason").value);
    		  	    	Backbone.sync(method, model, options);
    		  		});
            	} else{
            		Backbone.sync(method, model, options);
            	}
		    }else{
		    	Backbone.sync(method, model, options);
		    }*/
		    Backbone.sync(method, model, options);
		},

        fetch : function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType : 'application/json'
            }));
        },

        fetchAllowedNextStates: function(opts) {
            var options = opts || {};
            return Backbone.ajax({
                url: this.urlRoot + '/' + this.get('id') + '/allowedStatusTransitions',
                type: 'GET',
                contentType: 'application/json',
                success: options.success
            });
        },

        destroy : function(options) {
            options = _.extend(options || {}, {
                url : this.urlRoot + '/' + this.id,
                contentType : "application/json;charset=UTF-8",
                wait: true
            });
            return BaseModel.prototype.destroy.call(this, options);
        },

        accept : function(options) {
            options = _.extend(options || {}, {
                url : this.urlRoot + '/accept/' + this.id,
                contentType : "application/json;charset=UTF-8"
            });
            return this.save(null, options);
        },

        reject : function(options) {
            options = _.extend(options || {}, {
                validate: false,
                url : this.urlRoot + '/reject/' + this.id,
                contentType : "application/json;charset=UTF-8"
            });
            return this.save(null, options);
        },

        getOrganization: function() {
            return this.get('organization');
        },

        getOrganizationName: function() {
            var org = this.has('organization') ? this.get('organization') : null;
            if (!org) {
                return null;
            } else if (org instanceof Backbone.Model) {
                return org.get('name');
            } else {
                return org.name;
            }
        },

        getPrimaryAction: function() {
            var allActions = this.get('actions');
            return _.contains(allActions, EDIT_USER_ACTION) ? EDIT_USER_ACTION : null; 
        }
    });

    return UserModel;
});