define(['views/common/baseModalView',
        'models/sample/specimen',
        'hb!templates/sample/add-edit-specimen.html',
        'hb!templates/common/confirm-modal-footer.html', 
        'hb!templates/common/spinner.html'].concat('bootstrap.datepicker'), 
    function(
        BaseModalView,
        Specimen,
        bodyTemplate,
        footerTemplate,
        Spinner) {
	'use strict';
	
	var addSpecimenView = BaseModalView.extend({
				
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
		events: {
			'click #btnSpecimenSave' : '_onSave',
			'click #btnSpecimenCancel' : '_hide'
		},
		
		initialize: function(options){
			this.options.headerKey = "specimen." + options.type + ".label";
			this.options.needsReason = options.data.reason;
			this.options.hasViewPermission=options.hasViewPermission;
			this.model = new Specimen(options.data);
			BaseModalView.prototype.initialize.call(this, options);
			this.onComplete = options.onComplete;
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },
		
		render: function() {
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'dialog.save',
            	confirmId: 'btnSpecimenSave',
            	cancelId: 'btnSpecimenCancel'
            }));
            $('.input-append.date').datepicker({
                endDate: "today",
                orientation: "top auto",
                todayHighlight: true,
                autoclose: true,
                format: "yyyy-mm-dd"
            });
			
			return this;
		},
		
		_onSave: function() {
			this.disableButton();
			var self = this;
			var specimenAttributes = [];
			var currentAttributes = this.model.toJSON().specimenAttributes;
			_.each(this.$el.find('input[type=text]'), function(textbox){
				if($(textbox).attr('data-type') !== "custom"){
					self.model.set($(textbox).attr('name'), $(textbox).val());
				}else{
					var attribute = _.filter(currentAttributes, function(attr){
						return $(textbox).attr('name') === attr.attributeName;
					})[0];
					attribute.value = $(textbox).val();
					specimenAttributes.push(attribute);
				}
			});
			this.model.set('specimenAttributes', specimenAttributes);
			var gender = this.$el.find('input:radio:checked');
			this.model.set($(gender).attr('name'), $(gender).val());
			if(this.options.type !== "edit"){
				this.model.set("notes", $(this.$el.find('#notes')).val());
			}
			if(this.options.data.reason){
				this.model.set('reason',$('#reason-for-change').val());
			}
			this.model.save(null, {
				success: function(){
					self.$el.modal('hide');
					self.onComplete();
				},
				error: _.bind(self.enableButton, self)
			});
		}
		
	});
	
	return addSpecimenView;
});