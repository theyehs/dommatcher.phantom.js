$(document).ready(function() {
	var form = new Hugeform.Form({
		sections: [{
			id: 'describeQuestion',
			title: 'Describing Your Question',
			description: 'section descriptpon',
		},{
			id: 'login',
			title: 'Log In Your Account'
		},{
			id: 'payment',
			title: 'Enter Your Payment Info'
		}],

		steps: [{
			id: 'questionText',
			sectionId: 'describeQuestion',
			description: 'Description text text text dfjsdfj ',
			inputs: [{
				id: 'questionText',
				type: 'textarea',
				text: "What is your question text",
				value: 'sample question text'
			},{
				text: 'Please select a category for your question.',
				id: 'primaryCategory',
				value: 'one',
				type: 'dropdown',
				options: [{
					value: 'medical',
					text: 'Medical'
				},{
					value: 'one',
					text: 'One'
				}]
			}],
			onEnter: function(form, step, data) {
			},
			onAction: function(btnPressed, step, form) {
				var catVal = step.getInput('primaryCategory').get('value'),
					catText = step.getInput('primaryCategory').get('text');
//				form.setNextStep('secondaryCategory', {
//					primaryCategory: catVal
//				});
				form.setNextStep('chooseAuthMethod');
				step.set('stepSummary', {
					fields: [{
						label: 'Question Text',
						text: step.getInput('questionText').get('value')
					},{
						label: 'Primary Category',
						text: catText
					}]
				});
			}
		},{
			id: 'secondaryCategory',
			sectionId: 'describeQuestion',
			inputs: [{
				id: 'secondaryCategory',
				text: 'Secondary Category',
				type: 'textarea'
			}],
			onAction: function(btnPressed, step, form) {
				var catVal = step.getInput('secondaryCategory').get('value'),
					catText = step.getInput('secondaryCategory').get('text');
				form.setNextStep('tertiaryCategory', {
					secondaryCategory: catVal
				});
				step.set('stepSummary', {
					fields: [{
						label: 'Secondary Category',
						text: catText
					}]
				});
			},
			onEnter: function(form, step, data) {
				if (data.primaryCategory) {
					step.set('inputs', [{
						id: 'secondaryCategory',
						text: 'Secondary Category',
						type: 'dropdown',
						options: [{
							value: 'second medical',
							text: 'Second Medical'
						},{
							value: 'one',
							text: 'Two'
						}]
					}]);
				}
			}
		},{
			id: 'tertiaryCategory',
			sectionId: 'describeQuestion',
			inputs: [{
				id: 'tertiaryCategory',
				type: 'text'
			}],
			onEnter: function(form, step, data) {
				if (data.secondaryCategory) {
					step.set('inputs', [{
						id: 'tertiaryCategory',
						text: 'Tertiary Category',
						type: 'dropdown',
						options: [{
							value: 'second medical',
							text: 'Second Medical'
						},{
							value: 'one',
							text: 'Two'
						}]
					}]);
				}
			},
			onAction: function(btnPressed, step, form) {
				var catVal = step.getInput('tertiaryCategory').get('value'),
					catText = step.getInput('tertiaryCategory').get('text');
				form.setNextStep('optionalDetails', {
					tertiaryCategory: catVal
				});
				step.set('stepSummary', {
					fields: [{
						label: 'Tierary Category',
						text: catText
					}]
				});
			},
		},{
			id: 'optionalDetails',
			sectionId: 'describeQuestion',
			inputs: [],
			onEnter: function(form, step, data) {
				if (data.tertiaryCategory) {
					step.set('inputs', [{
						id: 'petage',
						text: 'Pet Age',
						type: 'text'
					}]);
				}
			},
			onAction: function(btnPressed, step, form) {
				var petAge = step.getInput('petage').get('value');
				form.setNextStep('chooseAuthMethod');
				step.set('stepSummary', {
					fields: [{
						label: 'Pet Age',
						text: petAge
					},{
						label: 'Pet Gender',
						text: 'Male'
					}]
				});
			}
		},{
			id: 'chooseAuthMethod',
			sectionId: 'login',
			inputs: [],
			onEnter: function(form, step, data) {
				step.set('description', "You are currently logged in as <em>Chris</em>");
				step.set('inputs', [{
					id: 'authMethod',
					type: 'radiolist',
					text: "How would you like to log in?",
					value: 'proceed',
					options: [{
						value: 'proceed',
						text: 'Proceed As Chris'
					},{
						value: 'signin',
						text: 'Sign in as a different user'
					},{
						value: 'signup',
						text: 'Sign up a new account'
					}]
				}]);
			},
			onAction: function(btnPressed, step, form) {
				var authMethod = step.getInput('authMethod').get('value');
				switch (authMethod) {
				case 'proceed':					
					form.setNextStep('vipCustomer');
					break;
				default:
					form.setNextStep('signin');
					break;
				}
				step.set('stepSummary', {
					description: "Choosing to sign in"
				});
			}
		},{
			id: 'signin',
			sectionId: 'login',
			inputs: [{
				id: 'username',
				text: 'User Name'
			},{
				id: 'password',
				text: 'Password',
				type: 'password'
			}],
			onEnter: function(form, step, data) {
			},
			onAction: function(btnPressed, step, form) {
				var username = step.getInput('username').get('value'),
					password = step.getInput('password').get('value');
					
				setTimeout(function() {
					form.setNextStep('vipCustomer');
				}, 500);

				step.set('stepSummary', {
					isHidden: true
				});
				
				form.stepCol.get('chooseAuthMethod').set('stepSummary', {
					description: "Sign In As Roger"
				});
			}
		},{
			id: 'vipCustomer',
			sectionId: 'payment',
			inputs: [],
			onEnter: function(form, step, data) {

				if (step.setNextStep(''));
			}
		}],
		containerEl: $(".container")
	});
	
	form.setNextStep('questionText', {
		user: 'dd'
	});

});
