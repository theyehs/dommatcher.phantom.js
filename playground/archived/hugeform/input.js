(function() {
	window.Hugeform = window.Hugeform || {};
	
	Hugeform.Input = Backbone.Model.extend({
		initialize: function(config) {
			this.set(config);

			switch (config.type) {
			case 'dropdown':
				this.view = new DropdownInputView({
					model: this
				});
				break;	
			case 'textarea':
				this.view = new TextareaInputView({
					model: this
				});
				break;
			case 'radiolist':
				this.view = new RadiolistInputView({
					model: this
				});
				break;
			default:
				this.view = new InputView({
					model: this
				});
				break;
			}
		},
	});

	var InputView = Backbone.View.extend({
		tagName: 'div',

		events: {
		},
		
		initialize: function(cfg) {
			var model = this.model;
			model.on('change:value', this.onValueChanged, this);
			this.render();
		},
		
		onValueChanged: function(model, newValue) {
			this.setValue(newValue);
		},
		
		onAttached: function(parentModel) {
		/*
			var parentView = parentModel.view;
			this.render();
			this.$stepView = parentView.$el;
			this.$stepView.append(this.$el);
		*/
		},

		render: function() {
			var $el = this.$el;
			$el.html($("#inputTemplate").html());
			$el.find('.text').html(this.model.get('text'));
			this.renderInput();
			return this;
		},

		renderInput: function() {
			var $el = this.$el, model = this.model, $input = this.$input = $("<input>");
			$input.attr({
				type: 'text',
			})
			.val(model.get('value'))
			.on('change', function() {
				model.set('value', $(this).val());
			});
			$el.find('.input').append($input);
		},

		setValue: function(val) {
			this.$input.val(val);
		},
	});
	
	var DropdownInputView = InputView.extend({
		renderInput: function() {
			var $el = this.$el, model = this.model,
				$input = this.$input = $("<select>").html("<option>Please select an option</option>");
				
			var options = model.get('options');
			
			for (var i=0; i<options.length; i++) {
				var option = options[i];
				$input.append($("<option>").attr('value', option.value).html(option.text));
			}
			$input.val(model.get('value'));

			$input.on('change', function() {
				model.set('value', $(this).val());
				model.set('text', $(this).find("option:selected").text());
			});
			$el.find('.input').append($input);		
		},
		
	});
	
	var TextareaInputView = InputView.extend({
		renderInput: function() {
			var $el = this.$el, model = this.model, 
				$input = this.$input = $("<textarea>");
			$input.attr({
				type: 'text',
			})
			.val(model.get('value'))
			.on('change', function() {
				model.set('value', $(this).val());
			});
			$el.find('.input').append($input);
		}
	});

	var RadiolistInputView = InputView.extend({
		renderInput: function() {
			var $el = this.$el, model = this.model,
				$input = this.$input = $("<ul></ul>"),
				modelId = model.id;
				
			var options = model.get('options');

			for (var i=0; i<options.length; i++) {
				var option = options[i], $li = $("<li><input type='radio'>" + option.text + "</li>");
				$li.find('input').attr({
					'name': modelId,
					'value': option.value
				});
				$li.appendTo($input);
			}
			$input.find("input[value='" + model.get('value') + "']").prop('checked', true);

			$input.find('input').on('change', function() {
				model.set('value', $(this).val());
			});
			$el.find('.input').append($input);
		},
	
		setValue: function(val) {
			this.$input.find("input[value='" + val + "']").prop('checked', true);		
		}

	});
})();