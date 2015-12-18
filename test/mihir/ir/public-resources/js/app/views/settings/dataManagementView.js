/* global define:false*/
define([ 'd3',
         'views/ParentView',
         'models/settings/dataManagement',
         'models/settings/dataUsage',
         'views/common/bannersView',
         'views/settings/incompleteRunsView',
         'views/common/baseModalView',
         'views/common/auditTrailView',
         'hb!templates/settings/data-management-view.html'],

function(
		d3,
		ParentView,
		DataManagement,
		DiskUsage,
		BannerView,
		IncompleteRunsView,
		BaseModalView,
		AuditTrailView,
		template) {

	'use strict';

	var AuditSearchView = ParentView.extend({

		_template : template,

		initialize : function(options) {
			var that = this;
			this.dataset = null;
			this._incompleteRunsEl = '#runs'
			this.archieveSettings = {};
			this.getModel = new DataManagement({type : 'get'});
			this.setModel = new DataManagement({type : 'set'});
			this.incompleteRunsView = new IncompleteRunsView();
			this.diskUsageModel = new DiskUsage();
			this.getModel.fetch({
				success : function() {
					that.archieveSettings = that.getModel.toJSON();
					that.render();
				}
			});
			if(options.auditConfig && options.auditConfig['System Setup']){
            	this.needsReason = options.auditConfig['System Setup'].needsReason;
            } else{
            	this.needsReason=false;
            }
		},

		events : {
			'click #audit_trail' : '_viewAuditTrail',
			'click #archiveDir_audit_trail' : '_archiveAuditTrail',
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			var that = this;
			this.setModel.unset('type');
			this.$el.html(this._template({
				'settings' : this.archieveSettings,
				reason : this.needsReason
			}));

			$('#auto-archieve-after').val(this.archieveSettings.autoArchiveAfter);

			this.$('#archieve-save').on('click', function() {
				var interval = that.$('#auto-archieve-after').val();
				var archive = that.$('#archieve-directory').val();
				var output = that.$('#archieve-output-directory').val();
				var input = that.$('#data-input-directory').val();

				that.setModel.set('archiveDirectory', archive);
				that.setModel.set('autoArchiveAfter', interval);
				that.setModel.set('dataOutputDirectory', output);
				that.setModel.set('dataInputDirectory', input);
				
				if(that.needsReason) {
					var reason = that.$('#reason-for-change').val();
					that.setModel.set('reason', reason);
				}

				console.log(that.setModel.toJSON());

				that.setModel.save(null, {
					type : 'PUT',
					success : function(data) {
						that._renderDiskSpaceUsage();
						new BannerView({
							id : 'success-banner',
							container : $('.main-content'),
							style : 'success',
							static : false,
							title : $.t('settings.dataManagement.autoArchive.success')
						}).render();
					}
				});

			});
			
			this._renderDiskSpaceUsage();
			
			this.incompleteRunsView.setElement(this.$(this._incompleteRunsEl)).render();

		},
		
		_renderDiskSpaceUsage : function() {
			var that=this;
			//if(this.dataset === null){
				this.dataset = {};
				this.diskUsageModel.fetch({
					success:function(){
						var d = that.diskUsageModel.toJSON().archiveDirDto;
						that.$("#pie-chart-archive").empty();
						that._renderPieChart(d, "#pie-chart-archive");
						var outputDirDto = that.diskUsageModel.toJSON().outputDirDto;
						that.$("#pie-chart-data-output").empty();
						that._renderPieChart(outputDirDto, "#pie-chart-data-output");
						var directoryName='('+d.path+')';
						that.$("#directoryName").html(directoryName);
					}
				});
			//}
		},
		
		_renderPieChart : function(d, element) {
			var a = d.availableSpace;
			var u = d.usedSpace;
			var t = d.totalSpace;
			
			var uP = d.usedSpacePercentage;
			var aP = d.availableSpacePercentage;
			
			this.dataset = [{label : $.t('settings.dataManagement.diskInfo.usedSpace'),value : uP,text: u+' GB'},{label : $.t('settings.dataManagement.diskInfo.availableSpace'),value : aP,text: a+' GB'}]
			
			if(!(u >= 0 && a >= 0)){
				new BannerView({
					container : $('.main-content'),
					style : 'error',
					static : false,
					title : $.t('settings.dataManagement.diskInfo.error')
				}).render();
			} else {
				this._drawPieChart(this.dataset, element);
			}
			
		},
		
		_drawPieChart : function(dataset, element) {
			// Width and height
			var w = 500;
			var h = 200;
			var legendRectSize = 18;
			var legendSpacing = 4;

			var outerRadius = 100;
			var innerRadius = 0;
			var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(
					outerRadius);

			var pie = d3.layout.pie().value(function(d) {
				return d.value;
			}).sort(null);

			// Easy colors accessible via a 10-step ordinal scale
			var color = d3.scale.category20();

			// Create SVG element
			var svg = d3.select(element).append("svg").attr("width", w)
					.attr("height", h);

			// Set up groups
			var arcs = svg.selectAll("g.arc").data(pie(dataset)).enter()
					.append("g").attr("class", "arc").attr(
							"transform",
							"translate(" + outerRadius + "," + outerRadius
									+ ") rotate(90)");

			// Draw arc paths
			arcs.append("path").attr("fill", function(d, i) {
				return color(i);
			}).attr("d", arc);

			// Labels
			arcs.append("text").attr("transform", function(d) {
				return "translate(" + arc.centroid(d) + ") rotate(-90)";
			}).attr("text-anchor", "middle").text(function(d) {
				return d.value + '%';
			});

			var legend = svg.selectAll('.legend')
			.data(color.domain())
			.enter() 
			.append('g')
			.attr('class', 'legend')
			.attr('transform', function(d, i) {
				var height = legendRectSize + legendSpacing;
				var offset = height * color.domain().length / 2;
				var horz = 250;
				var vert = i * 22;
				return 'translate(' + horz + ',' + vert + ')';
			}); // NEW

			legend.append('rect') 
			.attr('width', legendRectSize)
			.attr('height', legendRectSize)
			.style('fill', color)
			.style('stroke', color);

			legend.append('text')
			.attr('x', legendRectSize + legendSpacing)
			.attr('y', legendRectSize - legendSpacing)
			.text(function(d) {
				return dataset[d].label + ' : ' + dataset[d].text;
			});
		},
		
		_viewAuditTrail:function() {
			BaseModalView.open(null, {
				type: "audit_trail",
				el: "#auditTrailModal",
				gridViewUrl:'/ir/secure/api/auditmanagement/systemsetup/getAuditData',
				filters:{systemsetupId:2},
				detailsViewUrl:'/ir/secure/api/auditmanagement/systemsetup/getAuditDetails?systemsetupId=2'
			}, AuditTrailView);	
        },
        
        
        _archiveAuditTrail:function(e, model){
        	BaseModalView.open(null, {
				type: "audit_trail",
				el: "#auditTrailModal",
				gridViewUrl:'/ir/secure/api/auditmanagement/systemsetup/getAuditData',
				filters:{systemsetupId:3},
				detailsViewUrl:'/ir/secure/api/auditmanagement/systemsetup/getAuditDetails?systemsetupId=3'
			}, AuditTrailView);	
        },
        
        
	});
	return AuditSearchView;
});
