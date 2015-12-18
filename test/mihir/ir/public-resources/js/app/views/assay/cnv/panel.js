/*global define:false*/
define([
        'views/ParentView',
        'events/eventDispatcher',
        'models/assay/cnv/panel',
        'models/assay/cnv/panelModel',
        'models/assay/cnv/cnvId',
        'views/assay/cnv/cnvSelectView',
        'views/assay/cnv/cnvExistingView',
        'hb!templates/assay/cnv/cnv-panels.html'],
    function(
    		ParentView,
    		dispatcher,
    		Panel,
    		PanelModel,
    		CNVId,
    		CNVSelectView,
    		CNVExistingView,
    		template) {
    "use strict";

    var PanelView = ParentView.extend({

    	_panelEl:'#selectPanel',
    	_referenceEl:'#cnvReference',

    	events:{
    		'change input#isCnvReference': '_toggleCNVReference',
    		'change input#cnvName': '_nameChanged',
    		'change #cnvNote': '_noteChanged'
    	},

	    initialize: function(options) {
	    	var that = this;

	    	//this.model = options.model;

	    	this.data = {};
	    	this.panelModel = new PanelModel();
	    	this.modelFragement = new Panel();
	    	this.panelSelectView = {};
	    	this.referenceSelectView = {};

	    	this.isEdit = this.model.get('isEdit');

	    	if(this.isEdit){
	    		this.data = this._getPanelData();
	    		this.data.cnvBaselineId = options.model.toJSON().editData.id;
	    		this.data.panelId = this.data.panelFile.id;
	    	} else{
	    		this.data = this.model.getPanel() || {
	    			cnvBaselineId:'',
	    			name:'',
	    			displayName:'',
	    			notes:'',
	    			panelFile:null,
	    			existingReference:false,
	    			referenceCnvBaseline:null,
	    			panelId:'-1',
	    			referenceId:'-1'
	    		};
	    	}
	    	this.modelFragement.set('isEdit',this.isEdit);
	    	this.modelFragement.setCnvBaselineId(this.data.cnvBaselineId || '');
	    	this.modelFragement.setIsExistingReference(this.data.referenceCnvBaseline != null? true:false);
	    	this.modelFragement.setName(this.data.name || '');
	    	this.modelFragement.setNotes(this.data.notes || '');
	    	this.modelFragement.setDisplayName(this.data.displayName || this.data.displayname || '');
	    	this.modelFragement.setReferenceFile(this.data.referenceCnvBaseline);
	    	this.modelFragement.setPanelFile(this.data.panelFile);

	    	this.model.set('cnvBaselineId',this.data.cnvBaselineId || '');
	    	this.model.set('panelId',this.data.panelId);
	    	this.model.setIsExistingReference(this.modelFragement.getIsExistingReference());

	    	dispatcher.on('change:file',this._panelChanged, this);
	    	dispatcher.on('change:reference',this._referenceChanged, this);

        },

        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            var that = this;

            if(this.isEdit){
            	this.$el.html(template({
                	data:this.data,
                	isEdit:true
                }));
            } else{
            	this.panelModel.fetch({
                	success:function(){
                		that.$el.html(template({
                			data:that.data,
                        	isEdit:false
                        }));
                		that.panelSelectView = new CNVSelectView({
                			data:that.panelModel.toJSON(),
                			isEdit:false,
                			selected:that.data.panelId || '-1'
                		});
                		that.renderSubView(that.panelSelectView, that._panelEl);
                	}
                });
            }
            return this;
        },

        _panelChanged: function(data){
        	var that = this;

        	if($(data).find('select').length > 0){
        		data = $(data).find('select');
        	} else {
        		data = $(data);
        	}

        	var v = data.val();
        	var mod = {
                id:v,
                name:data.find('option:selected').text()
            }
        	this.data.panelFile=mod;
        	this.data.panelId=v;

        	this.data.referenceCnvBaseline=null;
        	this.data.referenceId="-1";

        	this.modelFragement.setPanelFile(mod);
    		this.modelFragement.setReferenceFile(null);

        	var v = data.val();
        	this.referenceSelectView = new CNVExistingView({
        		panelId: v,
        		isDisabled:!this.modelFragement.getIsExistingReference(),
        		selected:that.data.referenceId || '-1'
    		});
    		that.renderSubView(that.referenceSelectView, that._referenceEl);
        	this.model.setPanel(this.data);
        	this.model.setPanelId(v);
        },

        _referenceChanged: function(el){
        	var data;
        	if($(el).find('select').length > 0){
        		data = $(el).find('select');
        	} else{
        		data = $(el);
        	}

        	if(this.modelFragement.getIsExistingReference()){
    			this.$el.find('#cnvReference select').prop('disabled',false);
    			var mod = {
                	id: data.val(),
                	value:data.find('option:selected').text()
                }
    			this.data.referenceCnvBaseline = mod;
    			this.data.referenceId=mod.id;
            	this.modelFragement.setReferenceFile(mod);

    		} else{
    			this.$el.find('#cnvReference select').prop('disabled',true);
    			this.data.referenceCnvBaseline = null;
    			this.data.referenceId="-1";
        		this.modelFragement.setReferenceFile(null);
    		}
        	this.model.setPanel(this.data);
        },

        _toggleCNVReference: function(ev){
        	var target = $('#cnvReference select');
        	var val = $(ev.target).prop('checked');

        	this.data.existingReference=val;

        	this.modelFragement.setIsExistingReference(val);

        	if(val){
        		target.prop('disabled',false);
        		var mod = {
            		id: target.val(),
            		value:target.find(':selected').text()
            	}
        		this.data.referenceCnvBaseline = mod;
        		this.modelFragement.setReferenceFile(mod);
        	} else {
        		target.val('-1');
        		target.prop('disabled',true);
        		this.data.referenceCnvBaseline = null;
        		this.modelFragement.setReferenceFile(null);
        	}
        	this.model.setPanel(this.data);
        	this.model.setIsExistingReference(val);
        },

        _nameChanged: function(ev){
        	var target = $(ev.target);
        	var cnvName =
        	this.data.name = target.val();
        	this.data.displayName = target.val();

        	this.modelFragement.setName(target.val());
        	this.modelFragement.setDisplayName(target.val());

          this.model.setName(this.data.name);
          this.model.setDisplayName(this.data.name);

        	this.model.setPanel(this.data);
        },

        _noteChanged: function(ev){
        	var target = $(ev.target);
        	this.data.notes = target.val()

        	this.modelFragement.setNotes(target.val());
        	this.model.setPanel(this.data);
        },

        _getPanelData: function(){
        	return this.model.toJSON().editData.cnvBaselinePanelDto;
        },

        _setPanelData: function(data){
        	this.model.toJSON().editData.cnvBaselinePanelDto = data;
        }
    });
    return PanelView;
});
