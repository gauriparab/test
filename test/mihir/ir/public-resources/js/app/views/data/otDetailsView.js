/*global define:false*/
define(['views/common/baseModalView', 
        'models/data/otModel',
        'hb!templates/data/ot-details-view.html',
        'hb!templates/common/view-details-footer.html'
       ]
	.concat(
    	'bootstrap.modal', 
    	'bootstrap.modalmanager'),
    function(BaseModalView, 
    		OTModel, 
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var OTDetailsView = BaseModalView.extend({
        
        _options: function(){
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'data.results.otDetails',
				onHide: function(){},
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                }
			}
		},

        initialize: function(options) {
        	this.otId = options.otId;
	        this.grid = options.grid;
	        this.model = new OTModel({
	        	otId : this.otId
	        });
	        
	        BaseModalView.prototype.initialize.call(this, options);
        },

        events: {
            'click #closeAssayDetailsBtn' : '_hide',
            'click button#print' : 'print'
        },
        
        delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },


        render: function() {
			var self=this;
		    this.model.fetch({
			   success: function(){
				   BaseModalView.prototype.render.call(self);
				   self.$('#modalFooter').html(footerTemplate({
		            	closeKey: 'dialog.close',
				    	printId: 'print',
		            	cancelId: 'closeAssayDetailsBtn'
		           }));
			}});
            return this;
        },
        
        print: function(){
        	var html = '<html><head></head><body>';
        	var body = this.$el.find('.modal-body').html();
        	var head = '<h3>'+this.$el.find('.modal-header h3').html()+'</h3>';
        	
        	html+=head;
        	html+=body;
        	html+='</body></html>';
        	
        	var printString = head+body;
        	var printWindow = window.open();
            if (!printWindow) {
                alert("Please allow pop-ups");
            } else {
                printWindow.document.write(printString);
                printWindow.print();
                printWindow.close();
            }
        	
        }

    });

    return OTDetailsView;
});
