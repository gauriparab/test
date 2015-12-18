/*global define:false*/
define(['views/ParentView',
        'views/common/bannersView', 
        'events/eventDispatcher',
        'models/cnv',
        'collections/assayCNVBaselines',
        'hb!templates/cnv.html',
        'hb!templates/common/spinner.html'],
    function(ParentView, 
    		BannerView,
    		dispatcher,
    		CNV,
    		AssayCNVBaselines,
    		template,
    		Spinner) {
    "use strict";
            
    var CnvView = ParentView.extend({
    	initialize: function(options) {
    		this.collection = new AssayCNVBaselines({
    			panelId: this.model.getPanel().id
    		});
	        this.listenTo(this.collection, 'sync', this.render);
	        this.collection.fetch();
            this.modelFragement = new CNV();
            this.modelFragement.setAssayId(this.model.getAssayId());
            /*this.modelFragement.set('panelId',this.model.getPanel().id);
            this.modelFragement.setRunCnv(false);
            this.modelFragement.setApplyCnv(false);
            this.modelFragement.setCnvCalibrator(false);
            this.modelFragement.setCnvId('');
            this.modelFragement.setCnvName('');*/
            
            //dispatcher.on('load:tab',this._bindEvents,this);
        },
        
        events: {
        	'click #copyNumberAdjustment': 'copyNumberAdjustmentChange',
        	'change #sampleCellularity' : 'cellularityChanged',
        	'click #runCnvAlgo': 'runCnvAlgoChange',
        	'change select#cnvSelect': 'cnvChanged'
        },

        render: function() {
        	var that = this;
            this.$el.html(Spinner());
            this.modelFragement.fetch({
            	success:function(req,res,staus){
            		that.model.setRunCnv(that.modelFragement.getRunCnv());
            		that.len = res.length;
            		console.log(that.modelFragement.toJSON());
            		that.$el.html(template({
            			data:res,
            			len:res.length,
            			cnvBaselines: that.collection.toJSON()
            		}));
            		var selectedCNV=that.model.getCnvId();
                    that.runCnvAlgoChange();
                    if(selectedCNV) { 
                        $("#cnvSelect").val(selectedCNV); 
                        that.$el.find('#cnvSelect').trigger('change',{}); 
		            } else{ 
	                   var cnv =that.collection.toJSON()[0]; 
	                   if(cnv){ 
	                       that.model.setCnvId(cnv.id); 
	                       if(cnv.cnvBaselinePanelDto){
	                    	   that.model.setCnvName(cnv.cnvBaselinePanelDto.name); 
	                       }
	                   } 
		            }

            	}
            });
            return this;
        },
        
        /*_bindEvents: function(){
        	var that = this;
        	var _runCnvAlgoEl = this.$el.find('#runCnvAlgo');
        	var _cnvSelectEl = this.$el.find('#cnvSelect');
        	
        	_runCnvAlgoEl.on('click', function(){
        		var state = $(this).prop('checked');
        		that.modelFragement.setRunCnv(state);
        		that.model.setRunCnv(state);
        		if(state){
        			_cnvSelectEl.prop('disabled',false);
        			that.$el.find('#cnv-items').css('display','block');
        			that.$el.find('#cnvSelect').trigger('change',{});
        		} else{
        			_cnvSelectEl.prop('disabled',true);
        			that.$el.find('#cnv-items').css('display','none');
        		}
        	});
        	
        	_cnvSelectEl.on('change',function(){
        		
        		var id;
        		var name;
        		
				id = $(this).val();
	    		name = $(this).find('option:selected').text();

        		that.modelFragement.setCnvId(id);
        		that.modelFragement.setCnvName(name);
        		that.model.setCnvId(id);
        		that.model.setCnvName(name);
        	});
        },*/
        
        runCnvAlgoChange: function() {
        	var state = this.$el.find('#runCnvAlgo').prop('checked');
        	var _cnvSelectEl = this.$el.find('#cnvSelect');
        	this.modelFragement.setRunCnv(state);
        	this.model.setRunCnv(state);
    		if(state){
    			_cnvSelectEl.prop('disabled',false);
    			this.$el.find('#cnv-items').css('display','block');
    			this.$el.find('#cnvSelect').trigger('change',{});
    			this.copyNumberAdjustmentChange();
    		} else{
    			_cnvSelectEl.prop('disabled',true);
    			this.$el.find('#cnv-items').css('display','none');
    			this.modelFragement.setCellularityFlag(state);
            	this.model.setCellularityFlag(state);
    			
    		}
        },
        
        cnvChanged: function() {
        	var id = this.$el.find('#cnvSelect').val();
        	if(id){
        		var name = this.$el.find('#cnvSelect option:selected').attr('name');

        		this.modelFragement.setCnvId(id);
        		this.modelFragement.setCnvName(name);
        		this.model.setCnvId(id);
        		this.model.setCnvName(name);
        	}
        },
       
        copyNumberAdjustmentChange: function() {
        	var isChecked=$("#copyNumberAdjustment").is(':checked');
        	if(isChecked) {
        		this.$("#sampleCellularitySection").show();
        		this.getPercentageCellularity();
        	} else {
        		this.$("#sampleCellularitySection").hide();
        	}
        	this.modelFragement.setCellularityFlag(isChecked);
        	this.model.setCellularityFlag(isChecked);
        },
        
        getPercentageCellularity: function() {
        	var self=this;
        	if(this.model.getPercentCellularity()) {
        		self.$('#sampleCellularity').val(this.model.getPercentCellularity());
        	} else {
	        	$.ajax({
	                url: '/ir/secure/api/assay/loadCellularity?id='+this.model.getAssayId(),
	                type: 'GET',
	                contentType: 'application/json',
	                dataType: 'json',
	                success: function(data) {
	                	self.$('#sampleCellularity').val(data);
	                	self.cellularityChanged();
	                }
	            }); 
        	}
        },
        
        cellularityChanged: function() {
        	this.modelFragement.setPercentCellularity(this.$('#sampleCellularity').val());
        	this.model.setPercentCellularity(this.$('#sampleCellularity').val());
        }
        
    });

    return CnvView;
});