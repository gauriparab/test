define(['views/common/grid/kendoGridView',
        'models/sample/specimen',
        'hb!templates/grid/grid-column-specimen-actions.html',
        'hb!templates/grid/grid-column-specimen-notes.html',
        //'hb!templates/grid/grid-column-specimen-extraction.html',
        'hb!templates/grid/grid-column-specimen-name.html',
].concat(
	    'utils/templateFunctions',
	    'views/common/grid/plugins/rowSelectionGridPlugin',
	    'views/common/grid/plugins/actionsGridPlugin',
	    'views/common/grid/plugins/multiSelectionGridPlugin'), 
	function(
		KendoGridView,
		Specimen,
		actionsTemplate,
		notesTemplate,
		//extractionTemplate,
		nameTemplate){
	
	var centerAlignAttr = {
		style:'text-align:center;'
	}
	
	var specimenGridView = KendoGridView.extend({
		
		_url: '/ir/secure/api/specimen/list',
		
		_model: Specimen,
		
		_scrollable: true,
		
		_sort: [{
            field: 'receiveDate',
            dir: 'desc'
        }],
                
        initialize: function(options) {
        	this.hasViewPermission=options.hasViewPermission;
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
           // this.loadPlugin('rowSelection');
            this.loadPlugin('multiSelection', {columnWidth: "30px"});
        },
        
        _columns: function() {
        	var columns = [];
        	
        	var specimenIdColumn = this.cb()
	            .field('specimenId')
	            .title($.t('grid.label.specimenId'))
	            .width('200px')
	            .template(nameTemplate)
	            .build();
		
        	
        	if(this.hasViewPermission) {
        		var patientIdColumn = this.cb()
	            .field('patientId')
	            .width('110px')
	            .title($.t('grid.label.patientId'))
	            .build();
        		
        		var orderingPhysicianColumn = this.cb()
	            .field('orderingPhysician')
	            .title($.t('grid.label.orderingPhysician'))
	            .build();
        	}
        	

        	var specimenConditionColumn = this.cb()
	            .field('specimenCondition')
	            .title($.t('grid.label.specimenCondition'))
	            .build();
        	
        	var sampleTypeColumn = this.cb()
	            .field('sampleType')
	            .title($.t('grid.label.sampleType'))
	            .build();

        	var collectionDateColumn = this.cb()
	            .field('collectionDate')
	            .title($.t('grid.label.collectionDate'))
	            .build();

        	var receiveDateColumn = this.cb()
	            .field('receiveDate')
	            .title($.t('grid.label.receiveTime'))
	            .build();

        	var genderColumn = this.cb()
        		.field('gender')
        		.width('100px')
        		.title($.t('grid.label.gender'))
        		.build();
        	
        	/*var tumorSiteColumn = this.cb()
	    		.field('tumorSite')
	    		.attributes(fontSizeAttr)
	    		.title($.t('grid.label.tumorSite'))
	    		.build();*/
        	
        	var notesColumn = this.cb()
        		.field('notes')
        		.attributes(centerAlignAttr)
        		.headerAttributes(centerAlignAttr)
        		.width('68px')
        		.sortable(false)
        		.title($.t('sample.planARun.addNote'))
        		.template(notesTemplate)
        		.build();
        	
        	/*var extractionColumn = this.cb()
	            .field('extractionKit')
	            .template(extractionTemplate)
	            .title($.t('specimen.add.extractionKitBarcode.label'))
	            .build();
        	
        	var actionsColumn = this.cb()
        		.width('10%')
        		.title($.t('actions.dropdown.label'))
        		.template(actionsTemplate)
        		.build();*/
        	
        	
        	
			columns.push(specimenIdColumn);
			if(this.hasViewPermission) {
				columns.push(patientIdColumn);
				columns.push(orderingPhysicianColumn);
			}
			columns.push(collectionDateColumn);
			columns.push(receiveDateColumn);
			columns.push(specimenConditionColumn);
			columns.push(sampleTypeColumn);
			columns.push(genderColumn);
			//columns.push(tumorSiteColumn);
			columns.push(notesColumn);
			//columns.push(extractionColumn);
			//columns.push(actionsColumn);
			
			return columns;
        },
        
        _onGridDataBound: function() {
            this.trigger(Event.DATA_BOUND);
		
            _.each(this.$el.find("div.dropdown"), function(div) {
                $(div).parent().css("overflow", "visible");
            });

		    $("[data-toggle='tooltip']").tooltip();   
		    
		    if(this.$(".k-grid-body").height() >= 500){
		    	this.$(".k-grid-header").css("padding-right", "16px");
		    }else{
		    	this.$(".k-grid-header").css("padding-right", "0px");
		    }

            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridDataBound();
            });
            
            filters=this.getFilters();
            
            $.ajax({
      		    url: '/ir/secure/api/specimen/getCount?show='+filters["show"]+'&specimenId='+ filters["specimenId"],
      		    type: 'GET',
      		    contentType: 'application/json',
    		    success: function(data) {
    		    	
    		    }
    		});
        },
	});
	
	return specimenGridView;
});