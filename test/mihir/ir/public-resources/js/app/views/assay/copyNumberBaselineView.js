/* global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'global',
        'events/eventDispatcher',
        'views/common/bannersView',
        'views/common/confirmModalView',
        'views/common/baseModalView',
        'views/addNotesView',
        'views/viewNotes',
        'views/assay/cnvGridView',
        'views/assay/cnvDetailView',
        'views/assay/cnvImportView',
        'views/assay/cnvLogView',
		    'hb!templates/assay/copy-number-baseline-view.html'
       ].concat('bootstrap.fileupload'),

function(
		$,
		_,
		Backbone,
		Global,
		Dispatcher,
		BannerView,
		Confirm,
		BaseModalView,
		AddNotesView,
		ViewNotes,
		CNVGridView,
		CNVDetailView,
		ImportView,
		CNVLogView,
		template) {
	'use strict';

	var CopyNumberBaselineView = Backbone.View.extend({

		_template : template,
		_gridEl: '#copy-number-baseline-grid',
		_cnvEl: '#grid-view',
    	_importEl:'#import-view',

		initialize : function(options) {
			options = options || {};
			this.canAddCNVBaseline = options.canAddCNVBaseline;
			this.canImportCNVBaseline = options.canImportCNVBaseline;
			this.gridView = new CNVGridView();
			this.gridView.addFilter('name', "");
			this.needsReason = false;// options.needsReason;

			this.gridView.on('action:view_details',this._viewDetails,this);

			this.gridView.on('action:edit',this._edit,this);
			this.gridView.on('action:audit_trail',this._auditTrail,this);
			this.gridView.on('action:delete',this._delete,this);
			this.gridView.on('action:evaluate',this._evaluate,this);
			this.gridView.on('action:create',this._createBaseline,this);
			this.gridView.on('action:obsolete',this._obsolete,this);
			this.gridView.on('action:export',this._export,this);
			this.gridView.on('action:lock',this._lock,this);
			this.gridView.on('action:log',this._cnvLog,this);

			this.gridView.on('action:view-notes',this._viewNotes,this);
			this.gridView.on('action:add-notes',this._addNotes,this);
			
			//Dispatcher.on('upload:success', this._cnvUploadSuccess, this);
			
		},

	    events:{
	    	'click #importCnvBaseline':'_showImportView',
	    	'click #showCnvBaselines':'_showBaselineView',
	    	'click #removeFile': 'onRemove'
	    },

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function(options) {
			var stayOnImportPage = (options && options.stayOnImportPage) || false;
			if(stayOnImportPage){
				this._showImportView(!stayOnImportPage);
				return;
			}
			this.$el.html(this._template({
				canAddCNVBaseline: this.canAddCNVBaseline,
				canImportCNVBaseline: this.canImportCNVBaseline
			}));
			this.gridView.setElement(this.$(this._gridEl)).render();
		},
		
		_cnvUploadSuccess: function(data){
			//this.gridView.refresh();
			//this.render();
			//new BannerView(data).render();
		},

		_viewDetails : function(e, model) {
			var that = this;
            BaseModalView.open(null, {
                el: "#viewCNVDetails",
                cnvId : model.toJSON().id
            }, CNVDetailView);
		},

	    _showImportView: function(isErase){
	    	$('.alert').remove();
	    	$(this._cnvEl).css('display','none');
	    	$(this._importEl).css('display','block');
	    	this.importView = new ImportView();
	    	this.importView.setElement(this.$(this._importEl)).render();
	    },
	    
	    _showBaselineView: function(){
	    	$('#ajaxerror').remove();
	    	this.gridView.refresh();
	    	$(this._importEl).css('display','none');
	    	$(this._cnvEl).css('display','block');
	    },

		_cnvLog: function(e, model){
			var _model = model.toJSON();
			var url = '/ir/secure/api/cnv/logs/showLogFile?path='+_model.logFilePath;

			var win = window.open(url, '_blank');
		},

		_edit : function(e, cnv) {
			window.location.href = "edit-cnvBaseline/"+ cnv.toJSON().id;
		},

		_obsolete: function(e, model){
			var url = '/ir/secure/api/cnv/obsoleteCnvBaseline';
			var action = 'obsolete';
			var method = 'DELETE';
			var id = {id:model.toJSON().id};
			var data = JSON.stringify(id);
			this._showPopup(url, method, data, action);
		},


		_delete: function(e, model){
			var url = '/ir/secure/api/cnv/deleteCnvBaseline';
			var action = 'delete';
			var method = 'DELETE';
			var id = {id:model.toJSON().id};
			var data = JSON.stringify(id);
			this._showPopup(url, method, data, action);
		},

		_evaluate: function(e, model){

			var action = 'evaluate';
			var method = 'GET';
			var id = {id:model.toJSON().id};
			var data = JSON.stringify(id);
			var url = '/ir/secure/api/cnv/evaluate?id='+id.id;
			this._showPopup(url, method, data, action);
		},

		_createBaseline: function(e, model){
			var action = 'create.baseline';
			var method = 'GET';
			var id = {id:model.toJSON().id};
			var data = JSON.stringify(id);
			var url = '/ir/secure/api/cnv/createBaseline?id='+id.id;
			this._showPopup(url, method, data, action);
		},

		_lock: function(e, model){
			var action = 'lock.baseline';
			var method = 'PUT';
			var id = {
				id:model.toJSON().id,
				value:'Locked'
			};
			var data = JSON.stringify(id);
			var url = '/ir/secure/api/cnv/updateCnvBaselineState?value=Locked&id='+id.id;
			this._showPopup(url, method, data, action);
		},

	    _export: function(e, model){
	    	var action = 'export.baseline';
			var method = 'GET';
			var id = {
				id:model.toJSON().id
			};
			var data = JSON.stringify(id);
			var url = '/ir/secure/api/cnv/zipFile?id='+id.id;
			this._showPopup(url, method, data, action);
	    },

		_viewNotes: function(e, model){
			var self = this;
            BaseModalView.open(null, {
                el: "#viewNotes",
                entityId: model.toJSON().id,
                entity: 'cnv',
                url: '/ir/secure/api/cnv/notes?id=' + model.toJSON().id
            }, ViewNotes);
		},

		_addNotes: function(e, model){
			 var self = this;
             BaseModalView.open(null, {
                 el: "#addCNVNotes",
                 entityId: model.toJSON().id,
                 entity: 'cnv',
                 onComplete: function() {
                     self._onCompleteFunc('specimen.add.notes.success');
                 }
             }, AddNotesView);
		},

		_showPopup: function(url,method,data,action){
			var that = this;
			this.currentAction = action;
			Confirm.open(function() {
				console.log(this);
				$.ajax({
					url : url,
					type : method,
					data:data,
					contentType : 'application/json',
					success: _.bind(that._onCompleteFunc,that),
					error: _.bind(that._onErrorFunc,that)
				});
			},{
				headerKey : 'cnv.grid.action.'+action+'.confirm.title',
				bodyKey : 'cnv.grid.action.'+action+'.confirm.message',
				needsReason:that.needsReason
			});
		},

		_onCompleteFunc: function(messageKey) {
			var that = this;
			if(this.currentAction === 'export.baseline'){
				this.currentAction = ''
				window.location = messageKey;
			}else{
				if(this.currentAction !== 'export.baseline'){
					new BannerView({
		                container: $('.main-content'),
		                style: 'success',
		                titleKey: $.t('cnv.grid.action.'+this.currentAction+'.confirm.success')
		            }).render();
					if (this.gridView) {
		                this.gridView.refresh();
		            }
				}
			}
            
        },

        _onErrorFunc: function(messageKey) {
            new BannerView({
                container: $('.main-content'),
                style: 'error',
                titleKey:  $.t('cnv.grid.action.'+this.currentAction+'.confirm.failure')
            }).render();
        },
	});

	return CopyNumberBaselineView;
});
