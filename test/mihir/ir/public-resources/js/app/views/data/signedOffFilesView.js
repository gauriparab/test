/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/signedOffFiles',
    'views/common/baseModalView',
    'views/common/bannersView',
    'hb!templates/data/signedOff-files.html',
    'hb!templates/common/confirm-modal-footer.html'
],
    function(
        $,
        Backbone,
        Files,
        BaseModalView,
        BannerView,
        bodyTemplate,
        footerTemplate) {
	'use strict';

    var FilesView = BaseModalView.extend({

        _options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: '750px'
                }
			}
		},
		
		events: {
			'click #downloadBtn' : '_onDownload',
			'click #checkAllFiles' : '_onCheckAll',
			'click input[type="checkbox"]' : '_onSelected'
		},

        initialize: function(options) {
        	this.options.headerKey = "data.tab.downloadfiles";
        	this.resultId= options.resultId;
        	this.qcState = options.qcState;
        	this.model = new Files({
            	id: options.resultId
            });
        	
			BaseModalView.prototype.initialize.call(this, options);
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	this.model.fetch({
        		success: function(){
        			BaseModalView.prototype.render.call(self);
        			self.$('#modalFooter').html(footerTemplate({
                    	confirmClass: 'btn-primary',
                    	cancelClass: 'btn-default',
                    	cancelKey: 'dialog.cancel',
                    	confirmKey: $.t('actions.DOWNLOAD'),
                    	confirmId: 'downloadBtn',
                    	cancelId: 'downloadCancel'
                    }));
        			self.$("#downloadBtn").prop("disabled", "disabled");
        		}
        	});
            
        },
        
        _onDownload: function() {
        	var self = this;
        	var filesList=[];
            this.$("input[type=checkbox]").each(function() {
            	if(this.checked == true)
            		filesList.push($(this).val()); 
            });
            this.$("#resultId").val(this.options.resultId);
            this.$("#filesList").val(filesList.toString());
            this.$("#downloadForm").submit();
            this._hide();        	
        },
        
        _onCheckAll : function(){
        	if($("#checkAllFiles").prop("checked")){
        		$("input[type=checkbox]").prop('checked', true);
        	}else{
        		$("input[type=checkbox]").prop('checked', false);
        	}
        },

        _onSelected: function(){
                if(this.$('.modal-body').find('input[type=checkbox]:checked').length > 0){
                        this.$("#downloadBtn").removeProp("disabled");
                }else{
                        this.$("#downloadBtn").prop("disabled", "disabled");
                }
         }

	
    });

    return FilesView;
});
