//confirmSamples
/*global define:false*/
define([
        'views/ParentView', 
        'events/eventDispatcher',
        'models/assay/cnv/saveCnv',
        'models/sample/specimenDetails',
        'views/assay/cnv/selectedSamplesGrid',
        'views/common/baseModalView',
        'views/samples/specimenDetailsView',
        'views/assay/assayDetailView',
        'views/assay/plannedRunsDetailsView',
        'hb!templates/assay/cnv/cnv-confirm-selected-samples.html'],
    function(
    		ParentView, 
    		dispatcher,
    		SaveModel,
    		Specimens,
    		SelectedSamplesGrid,
    		BaseModalView,
    		SpecimenDetailsView,
    		AssayDetailView,
    		PlannedRunDetailsView,
    		template) {
    "use strict";

    var ConfirmSamplesView = ParentView.extend({
    	_gridEl: '#selected-samples-grid',
    	_countEl: $('#count'),
    	
	    initialize: function(options) {
	    	this.model = options.model;
	    	this.modelFragement = new SaveModel();
	    	this.isEdit = this.model.get('isEdit');
	    	var panelId = this.model.getPanelId();
	    	this.count = this.model.get('count');
	    	this.gridView = new SelectedSamplesGrid();
	    	this.normalSamples = this.model.get('normalSpecimens');
	    	
	    	var _ids = this.model.get('ids');
	    	var ids = '';
	    	
	    	for(var id in _ids){
	    		ids+=_ids[id];
	    		if(id < _ids.length-1){
	    			ids+=',';
	    		}
	    	}
	    	
	    	
	    	this.gridView.addFilter('ids',ids);
	    	if(this.model.getCnvBaselineId()){
	    		this.gridView.addFilter('cnvBaselineId',this.model.getCnvBaselineId().toString());
	    	}else{
	    		this.gridView.addFilter('cnvBaselineId','');
	    	}
	    	this.gridView.addFilter('panelId',panelId);

            dispatcher.on('save:cnv', _.bind(this._saveCnv, this));  
            dispatcher.on('mark:normals', _.bind(this._markNormalOnGrid, this));
            
            this.gridView.on('action:specimen_details',this._specimenDetails, this);
            this.gridView.on('action:assay_details',this._assayDetails, this);
            this.gridView.on('action:plannedRun_details',this._plannedRunDetails, this);

            this.modelFragement.set('isEdit',this.isEdit);
            this.modelFragement.set('panelId',panelId);
        },
        
        _specimenDetails: function(e,model){
        	var that = this;
        	
        	var specimen = new Specimens({id:model.toJSON().libraryPrepDto.specimenId});
        	specimen.fetch({
        		success: function(){
        			BaseModalView.open(null, {
                        el: "#viewSpecimen",
                        model: specimen
                    }, SpecimenDetailsView);
        		}
        	});
        },
        
        _assayDetails: function(e,model){
        	var that = this;
        	model = model.toJSON();
        	var id = model.resultInfoDto.assay.id;
            BaseModalView.open(null, {
                el: "#viewAssayDetails",
                assayId : id,
                onHide:function(){}
            }, AssayDetailView);
        },
        
        _plannedRunDetails: function(e,model){
        	var self= this;
        	model = model.toJSON();
        	var plan = model.resultInfoDto.planRun;
        	var assay = model.resultInfoDto.assay;
        	plan.assayId=assay.id;
	    	BaseModalView.open(null, {
	    		plan: plan,
                showEdit: false,
                onHide:function(){}
	    	}, PlannedRunDetailsView);
        },

        events:{},
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var that = this;
        	this.$el.html(template({
        		count:this.count
        	}));
        	this.renderSubView(this.gridView, this._gridEl);
            return this;
        },

        _markNormalOnGrid: function(){
        	var that = this;
        	var gridEl = this.gridView.$el;
        	var defauleNormalMaleSamples = this.normalSamples;
        	for(var sample in defauleNormalMaleSamples){
        		that._mapNormalSampleSelection(defauleNormalMaleSamples[sample], true);
        		that._toggleNormalMaleSelection(defauleNormalMaleSamples[sample], true);
        	}
        },
        
        _toggleNormalMaleSelection: function(id,state){
        	var elem = this.gridView.$el.find('div[data-normal-id="'+id+'"]');
        	var lastTr = elem.parent();
        	
        	if(state){
        		this._enableNormalMaleSelection(lastTr);
        	} else{
        		this._removeNormalMaleSelection(lastTr);
        	}
        },

        _enableNormalMaleSelection: function(parent){
        	parent.find('.no').css('display','none');
        	parent.find('.yes').css('display','block');
        },
        
        _removeNormalMaleSelection: function(parent){
        	parent.find('.yes').css('display','none');
        	parent.find('.no').css('display','block');
        },

        _mapNormalSampleSelection: function(id,state){
        	if(state){
        		this.normalSamples[id] = id;
        	} else{
        		delete this.normalSamples[id];
        	}
        },
        
        _saveCnv: function(ev,model){
        	$('#save-cnv').attr('disabled',true);
        	this.modelFragement.unset('cid');
        	this.modelFragement.setPanelId(this.model.getPanelId());
        	this.modelFragement.set('cnvBaselineId',this.model.getCnvBaselineId()||'');
        	this.modelFragement.set('isEdit',this.isEdit);
        	if(this.isEdit){
        		this.modelFragement.set('id',1);
        	}

        	this.modelFragement.set('sampleInfoDtoList',this.model.get('selectedSpecimens'));
        	
        	this.modelFragement.save(null, {
        		success:function(req,res){
        			$.ajax({
    					url : '/ir/secure/api/cnv/createBaseline?id='+res.id,
    					type : 'GET',
    					contentType : 'application/json',
    					success:function(req,res) {
    						window.location = '/ir/secure/assay-presets.html#cnv';
    					},
    					error: function(req,res){
    						console.log('Error');
    						$('#save-cnv').attr('disabled',false);
    					}
    				});
        		},
        		error:function(req,res){
        			console.log('Failure');
        			$('#save-cnv').attr('disabled',false);
        		}
        	});
        },
        
        _getSelectedSamplesData: function(){
        	return this.model.toJSON().editData.selectSampleDto.sampleInfoDtoList;
        },
        
        _setSelectedSamplesData: function(data){
        	this.model.toJSON().editData.selectSampleDto.sampleInfoDtoList = data;
        },
        
        _getSelectedNormalMaleIds: function(){
        	return this._extractIds(_.filter(this._getSelectedSamplesData(),function(el){return el.isNormalMale}));
        },
        
        _getSelectedSpecimenIds: function(){
        	return this._extractIds(this._getSelectedSamplesData());
        },
        
        _extractIds: function(items){
        	return _.chain(items).map(function(sample){return sample.id}).value();
        }
    });
    return ConfirmSamplesView;
});