/*global define:false*/
define(['jquery', 'underscore', 'global', 'views/ParentView', 'events/eventDispatcher', 'hb!templates/workflow-primers.html',
        'collections/assay/primers', 'models/data/primer', 'hb!templates/error.html'], 
       function ($, _, Global, ParentView, dispatcher, template, Primers, Primer, errorTemplate) {
    "use strict";
    var PrimersContentView = ParentView.extend({
        initialize: function () {
            this.model = this.options.model || null;
            var self = this;
            this.modelFragement = new Primer();
            this.collection = new Primers();
        },

        events: {
            'click input[type="radio"]': '_toggle',
            'change select#selectPrimer': '_selectionChanged'
        },

        render : function() {
        	var self = this;
        	$.when(this.collection.fetch()).done(function(){
                self.$el.html(template({
                	primers : self.collection.toJSON()
        		}));
                
                var primers = self.model.getPrimers();
                if(!_.isEmpty(primers)){
                	if(primers[0].factoryProvided){
                		self.model.setPrimerSelection("Default Primer"); 
                		$("#defaultPrimers").click();                		
                	}else{
                		$("#selectPrimer").val(primers[0].id);
                		self.model.setPrimerSelection("Custom Primer");
                		$("#customPrimers").click();
                	}
                }else{
                    self.model.setPrimerSelection("No Primer");
                }                
                self._setActivePrimerType();
        	});
            return this;
        },

        _toggle: function(e) {
            var id = $(e.currentTarget).val();
            this.model.setPrimerSelection(id);
            this._setActivePrimerType();
        },
        
        _selectionChanged: function(e) {
        	var object = _.find(this.collection.toJSON(), function(obj){
        		return  obj.id == $(e.currentTarget).val();
        	});
        	this.modelFragement = new Primer(object);
        	this.model.setPrimers([object]);
        },

        _setActivePrimerType: function() {
            var primerSelection = this.model.getPrimerSelection();
            this.$el.find(".active").removeClass('active');
            this.model.setPrimersValid(true);
            if (primerSelection === "Default Primer") {
                this.$el.find("#customPrimersUploadSection").addClass("hidden");
                var object = _.find(this.collection.toJSON(), function(obj){
            		return obj.name == "Default Primer";
            	});
                object.factoryProvided = true;
                this.modelFragement = new Primer(object);
                this.model.setPrimers([object]);
            } else if(primerSelection === "Custom Primer") {
                this.$el.find("#customPrimersUploadSection").removeClass("hidden");
                var object = _.find(this.collection.toJSON(), function(obj){
            		return obj.id == $("#selectPrimer").val();
            	});
            	this.modelFragement = new Primer(object);
            	this.model.setPrimers([object]);
            } else {
                this.$el.find("#customPrimersUploadSection").addClass("hidden");
                this.modelFragement = new Primer();
                this.model.setPrimers([]);
            }
        },
        
        _clearErrors : function() {
            this.$(".alert.alert-error").remove();
        },
        
        _displayError : function(errors) {
            this.$("#primers-errors").html(errorTemplate(errors));
        }
   
    });

    return PrimersContentView;
});
