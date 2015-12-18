define(['views/common/baseModalView',
        'hb!templates/sample/view-specimen.html',
        'hb!templates/common/view-details-footer.html'].concat('jBarcode'), 
    function(
    	BaseModalView,
    	bodyTemplate,
    	footerTemplate) {
	'use strict';
	
	var SpecimenDetailsView = BaseModalView.extend({
		
		_options: function(){
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'spacimen.view.label',
				onHide: function(){},
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width:'400px'
                }
			}
		},
		
		initialize: function(options) {
			this.options.hasViewPermission=options.hasViewPermission;
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		events: {
			'click #btnSpecimenExport' : '_onExport',
			'click #btnSpecimenClose' : '_hide'
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },
        
        render: function() {
        	BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	closeKey: 'dialog.close',
		    	printId: 'btnPrintDetails',
            	cancelId: 'btnCloseDetails'
            }));
            $("#extractionKit").barcode($("#extractionKit").text().trim(), "code128", {	barWidth : 2, barHeight : 30 });
            $("#extractionKit > div:first").remove();
			$("#extractionKit > div:nth-last-child(2)").remove();
            return this;
        },
        
        _onExport: function() {
        	//Call export
        }
		
	});
	return SpecimenDetailsView;
});