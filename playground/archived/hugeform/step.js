(function() {
	window.Hugeform = window.Hugeform || {};

	Hugeform.Step = Backbone.Model.extend({
		initialize: function(stepConfig) {
			var stepInstance = this;

			this.on('change:inputs', function(model, inputs) {
				stepInstance.set('inputCol', new Backbone.Collection(inputs, {
					model: Hugeform.Input
				}));
			});
			this.set(stepConfig);

			stepInstance.set('inputCol', new Backbone.Collection(stepConfig.inputs, {
				model: Hugeform.Input
			}));


			if (!this.get('buttons')) {
				this.set('buttons', [{
					id: 'next',
					text: 'Next'
				}]);
			}

			this.view = new StepView({
				model: this
			});
		},
		
		activate: function(activationData) {
			var onEnter = this.get('onEnter');
			if (onEnter)
				onEnter.call(this, this.get('form'), this, activationData);
			this.set('visitState', 'activated');
		},
		
		deactivate: function() {
			this.set('visitState', 'deactivated');
		},
		
		markVisited: function() {
			this.set('visitState', 'visited');
		},

		takeAction: function(actionId) {
			var onAction;
			if (onAction = this.get('onAction'))
				onAction.call(this, actionId, this, this.get('form'));
		},
		
		getInput: function(inputId) {
			return this.get('inputCol').get(inputId);
		},
	});
	
	var StepView = Backbone.View.extend({
		tagName: 'div',
		
		initialize: function(config) {
			this.render();
//			this.model.on('change', this.render, this);	
			this.model.on('change:buttons', this.renderButton, this);			
			this.model.on('change:visitState', this.onVisitStateChanged, this);
			this.model.on('change:inputCol', this.renderInputs, this);
			this.model.on('change:stepSummary', this.renderVisitSummary, this);
			this.model.on('change:description', this.renderDescription, this);
		},
		
		renderVisitSummary: function(model, visitSummary) {
			var $summary = this.$el.find('.visited.visit-state .stepSummary');
			if (visitSummary.fields) {
				var html = "";
				for (var i=0; i<visitSummary.fields.length; i++) {
					var field = visitSummary.fields[i];
					html += "<div class='summary-item'><label>" + field.label + "</label><div class='text'>"
						+ field.text + "</div></div>";
				}
				$summary.html(html);
			} else if (visitSummary.description) {
				$summary.html(visitSummary.description);
			}
			if (visitSummary.isHidden) {
				$summary.hide();
			} else {
				$summary.show();
			}
		},
		
		onVisitStateChanged: function() {
			var $el = this.$el, model = this.model, visitState = model.get('visitState');

			switch (visitState) {
			case 'activated':
				
				break;
			}
			$el.find('.visit-state').hide();
			$el.find('.'+visitState).show();
		},
		
		renderButtons: function() {
			var stepModel = this.model,
				$actionContainer = this.$el.find('.actionContainer'),
				buttons = stepModel.get('buttons');

			$actionContainer.empty();
			for (var i=0; i<buttons.length; i++) {
				var button = buttons[i];
				var $button = $("<button>").attr({
					actionId: button.id
				}).html(button.text).on('click', function() {
					stepModel.takeAction($(this).attr('actionId'));
				});
				$button.appendTo($actionContainer);
			}
		},
		
		render: function() {
			var $el = this.$el, model = this.model;	
			$el.html($("#stepTemplate").html()).addClass('stepContainer');
			this.renderDescription();
			this.renderInputs();
			this.renderButtons();
			return this;
		},
		
		renderDescription: function() {
			this.$el.find('.description').html(this.model.get('description'));
		},
		
		renderInputs: function() {
			var $el = this.$el, stepModel = this.model, self = this,
				$inputContainers = $el.find('.inputContainers'),
				inputCol = stepModel.get('inputCol');
			$inputContainers.empty();

			inputCol.each(function(inputModel) {
				$inputContainers.append(inputModel.view.$el);
			});
		},

	});
})();