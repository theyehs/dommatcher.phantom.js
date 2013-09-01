
(function() {
	window.Hugeform = window.Hugeform || {};
	Hugeform.Form = Backbone.Model.extend({
		initialize: function(formConfig) {
			this.history = new StepHistory();
			this.set(formConfig);
			this.stepCol = new Backbone.Collection(formConfig.steps, {
				model: Hugeform.Step
			});
			this.view = new HugeformView({
				model: this
			});
		},

		// move user focus to the next step, if that next step already exists, reuse it and persist prior user input
		setNextStep: function(stepId, stepData) {
			var newStepModel = this.stepCol.get(stepId);
			var oldStepModel = this.activeStepModel;

			if (oldStepModel)
				oldStepModel.markVisited();
			newStepModel.activate(stepData);
			this.activeStepModel = newStepModel;
			newStepModel.set('form', this);
			this.trigger('stepAdded', {
				stepModel: newStepModel,
				stepData: stepData
			});

			return;
		
			var stepObj = this.stepCache[stepName],
				stepConfig = this.get('steps')[stepName];
	
			// has this next step been added to the history?
			var newStepInstance = this.stepCache[stepName];

			// if currently not at end of history
			if (this.history.doesExist(stepName)) {

			}

			// change section if necessary			
			if (stepConfig.sectionId != this.activeSection) {
				this.activeSection = stepConfig.sectionId;
				this.trigger('sectionChanged', this.activeSection);
			}

			var oldStepName = this.activeStep;
			this.activeStep = stepName;
			this.activeStepInstance = this.stepCache[this.activeStep];
			this.history.push(this.activeStep, this.activeStepInstance);
			
			this.trigger('stepChanged', {
				oldStep: oldStepName,
				newStep: stepName,
				stepData: stepData
			});
			stepObj.trigger('entering', stepData);
		}
	});
	
	var appRouter = Backbone.Router.extend({
		initialize:function() {},
   });
	Backbone.history.start();
	
	var StepHistory = Backbone.Model.extend({
		initialize: function() {
			this.queue = [];
		},
		doesExist: function(id) {
			return this.getIndex(id) > -1;
		},
		push: function(id, obj) {
			this.queue.push({
				id: id,
				obj: obj
			});
		},
		getIndex: function(id) {
			for (var i=0; i<this.queue.length; i++) {
				if (this.queue[i].id == id) return i;
			}
			return -1;
		},
		setAnchor: function(stepId) {
			var anchorIndex = this.getIndex(stepId);
			this.queue.splice(anchorIndex + 1, 2000);
		}
	});	
	
	var HugeformView = Backbone.View.extend({
		initialize: function() {
			var model = this.model;
			this.$steps = {};
			model.on('stepAdded', this.onStepAdded, this);
			
			this.render();
		},
		render: function() {
			this.setElement(".container");
			var $el = this.$el, model = this.model;
//			this.renderSection();
			return this;
		},
		
		onStepChanged: function(cmd) {
			var $step = this.$steps[cmd.newStep];
			var $section = this.$el.find("section[name='" + this.model.activeSection + "'] .content");
			$section.append($step);
		},
		
		onStepAdded: function(info) {
			this.$el.append(info.stepModel.view.$el);
		},
		
		renderSection: function() {
			var sections = this.model.get('sections'),
				$el = this.$el;
			var templateHtml = $("#sectionTemplate").html();

			for (var i=0; i<sections.length; i++) {
				var section = sections[i],
					$section = $("<section>").html(templateHtml).css({
					}).attr({
						name: section.id
					});
				$section.find('.header').html(section.title);
				$section.appendTo($el);
			}
		}
	});
})();