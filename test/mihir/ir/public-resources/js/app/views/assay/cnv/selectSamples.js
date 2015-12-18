/*global define:false*/
define([
        'views/ParentView',
        'events/eventDispatcher',
        'models/assay/cnv/selectedSpecimens',
        'models/sample/specimenDetails',
        'views/common/searchView',
        'views/assay/cnv/samplesGrid',
        'views/common/baseModalView',
        'views/samples/specimenDetailsView',
        'views/assay/assayDetailView',
        'views/assay/plannedRunsDetailsView',
        'hb!templates/assay/cnv/cnv-select-samples.html'],
    function(
    		ParentView,
    		dispatcher,
    		SelectedSpecimens,
    		Specimens,
    		SearchView,
    		SamplesGrid,
    		BaseModalView,
    		SpecimenDetailsView,
    		AssayDetailView,
    		PlannedRunDetailsView,
    		template) {
    "use strict";

    var SelectSampleView = ParentView.extend({
    	_searchEl: '#query-form',
    	_gridEl: '#select-samples-grid',
    	_countEl: $('#count'),

	    initialize: function(options) {
	    	//this.nextCallback = this._updateSelectedSamples;
	    	this.model = options.model;
	    	this.modelFragement = new SelectedSpecimens();
	    	this.validationModel = new SelectedSpecimens({getValidationParameters:true});
	    	this.isEdit = this.model.get('isEdit');
	    	this.isExistingReference = this.model.getIsExistingReference();
	    	var panelId = this.model.getPanelId();
	    	this.searchView = new SearchView({
                placeHolder: 'grid.column.specimenId'
            });

	    	this.normalSamples = {};
	    	this.selectedSamples = {};

	    	this.specimens = {};
	    	this.normalSpecimens = {};

	    	this.isDataAvailable = this.model.get('specimens');

	    	if(this.isDataAvailable){
	    		this.specimens = this.model.get('specimens');
	    		this.normalSamples = this.model.get('normalSpecimens');
	    	}else{
	    		if(this.isEdit){
	    			this.specimens = this._getMappedSpecimenIds();
	    			this.normalSamples = this._getMappedNormalSpecimenIds();
	    		}
	    	}
	    	
	    	this.gridView = new SamplesGrid({
	    		samples:this.specimens
	    	});

	    	this.gridView.addFilter('ids','');
	    	this.gridView.addFilter('specimenID','');
	    	this.gridView.on('multiSelect', this._normalGridMultiSelect, this);
            this.gridView.on('action:checked_normalMale',this._normalMaleChecked, this);
            this.gridView.on('action:specimen_details',this._specimenDetails, this);
            this.gridView.on('action:assay_details',this._assayDetails, this);
            this.gridView.on('action:plannedRun_details',this._plannedRunDetails, this);

	    	if(this.model.getCnvBaselineId()){
	    		this.gridView.addFilter('cnvBaselineId',this.model.getCnvBaselineId().toString());
	    	}else{
	    		this.gridView.addFilter('cnvBaselineId','');
	    	}
	    	this.gridView.addFilter('panelId',panelId);

            dispatcher.on('change:selection', _.bind(this._changedSelection, this));
            dispatcher.on('mark:selection', _.bind(this._markSelectedOnGrid, this));
            //dispatcher.on('update:samples',_.bind(this._updateSelectedSamples, this));

            this.searchView.on('search', this._onSearch, this);
            this.searchView.on('reset', this._onReset, this);

            this.modelFragement.setPanelId(panelId);
            if(this.isEdit){
            	this.gridView.addFilter('cnvBaselineId',this.model.toJSON().editData.id.toString());
            	this.modelFragement.set('cnvBaselineId',this.model.toJSON().editData.id);
            	this.gridView.addFilter('isEdit',true.toString());
            	this.modelFragement.set('isEdit',"true");
            	this.modelFragement.set('panelId',panelId);
            } else{
            	this.modelFragement.setCnvBaselineId('');
            	this.modelFragement.set('isEdit',false.toString());
            }
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
                width:'950px',
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
        
        _changedSelection:function(elem){
        	var isChecked = elem.prop('checked');
        	var id = elem.data('id');
        	var isValid = parseInt(id);

        	if(!isChecked){
        		this._deselectSample(id);
        		delete this.specimens[id];
        	} else{
        		if(!isNaN(isValid)){
        			this.specimens[id] = id;
        		}
        	}

        	this.model.set('specimens',this.specimens);
        	this.model.set('normalSpecimens',this.normalSamples);

        },

        _normalGridMultiSelect: function(models){
        	var that = this;
        	if(!models){
        		models = this.gridView.getSelected();
        	}

        	this._setSelectedSamples(models);
        	this._updateSelectedCount(models.length);
        },

        _setSelectedSamples: function(models){
        	var that = this;
        	this.selected = _.object(_.map(models.toJSON(), function(item) {
   				return [item.id, item.id];
			}));
        },
        
        _updateSelectedCount: function(count){
        	$('#count').html(count);
        	this.model.set('count',count);
        },

        _onSearch: function(val){
        	this.gridView.addFilter('specimenID',val);
        	this.gridView.$el.data('kendoGrid').dataSource.page(1);
        },

        _onReset: function(){
        	this.gridView.addFilter('specimenID','');
        },

        events:{
        	'click button#allButton': '_showAll',
        	'click button#selectedButton': '_showSelected',
        	'click #togglePanes button': '_changeState',
        	'click #planRunCancelButton' : '_hide',
        	'click #btnSpecimenClose' : '_hide'
        },

        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },
        
        render: function() {
        	var that = this;
        	this.validationModel.fetch({
        		success: function(){
        			that.$el.html(template({
        				data:that.validationModel.toJSON(),
        				isExistingReference:that.isExistingReference
        			}));
        			that.renderSubView(that.searchView, that._searchEl);
        			that.renderSubView(that.gridView, that._gridEl);
                	return that;
        		}
        	});
        },

        _markSelectedOnGrid: function(){
        	var that = this;
        	var gridEl = this.gridView.$el;
        	this.buffer = this.specimens;

        	for(var sample in this.buffer){
        		var query = 'input[data-id="'+ this.buffer[sample]+'"]';
        		var elem = gridEl.find(query);
        		if(!elem.prop('checked')){
        			gridEl.find(query).trigger('click');
        		}
        	}

        	var defauleNormalMaleSamples = this.normalSamples;

        	for(var sample in defauleNormalMaleSamples){
        		that._mapNormalSampleSelection(defauleNormalMaleSamples[sample], true);
        		that._toggleNormalMaleSelection(defauleNormalMaleSamples[sample], true);
        	}
        	this.gridView.trigger('multiSelect');
        },
        
        _normalMaleChecked:function(ev,model){
        	if(!this.model.getIsExistingReference()){
        		var thisId = model.get('id');
        		if(this.selected[thisId]){
        			if(this.normalSamples[thisId]){
        				this._mapNormalSampleSelection(thisId,false);
        				this._toggleNormalMaleSelection(thisId, false);
        				
        			} else {
        				this._mapNormalSampleSelection(thisId,true);
        				this._toggleNormalMaleSelection(thisId, true);
        			}
        		}
        	}
        },
        
        _toggleNormalMaleSelection: function(id,state){
        	var elem = this.gridView.$el.find('input[data-id="'+id+'"]');

        	var tr = elem.parents('tr');
        	var lastTr = tr.find('td:last-child');

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
        
        _deselectSample: function(id){
        	this._toggleNormalMaleSelection(id,false);
			this._mapNormalSampleSelection(id,false);
        },
        
        _mapNormalSampleSelection: function(id,state){
        	if(state){
        		this.normalSamples[id] = id;
        	} else{
        		delete this.normalSamples[id];
        	}
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
        },
        
        _getMappedSpecimenIds: function(){
        	var specimens = this._getSelectedSpecimenIds();
        	var ret = {};
        	for(var id in specimens){
				ret[specimens[id]] = specimens[id];
			}
        	return ret;

        },
        
        _getMappedNormalSpecimenIds: function(){
        	var normalSamples = this._getSelectedNormalMaleIds();
        	var ret = {};
			for(var id in normalSamples){
				ret[normalSamples[id]] = normalSamples[id];
			}
			return ret;
        },
        
        _nextClick: function(){
        	var that = this;
        	var samples = this.gridView.getSelected().toJSON();
        	
        	var that = this;
        	var selectedSamples = _.object(_.map(samples, function(item) {
        		if(that.normalSamples[item.id]){
        			item.isNormalMale = true;
        		} else{
        			item.isNormalMale = false;
        		}
        		item.isChecked = true;
   				return [item.id, item];
			}));
        	
        	var keys = _.keys(selectedSamples);
        	var values = _.values(selectedSamples);

        	this.modelFragement.setSampleDto(values);
        	this.model.set('ids',keys);
        	this.model.set('selectedSpecimens',values);
        }

    });
    return SelectSampleView;
});