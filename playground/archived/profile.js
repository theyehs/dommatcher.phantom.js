
var Entity = function(nodeData) {
	nodeData = nodeData || {};
	if (nodeData.children) {
		this.children = [];
		for (var i=0; i<nodeData.children.length; i++) {
			this.children.push(Entity.createNode(nodeData.children[i]));
		}
	}
	for (var k in nodeData) {
		if (k == 'children') continue;
		this[k] = nodeData[k];
	}
	this.boxDim = { x: 350, y: 50 };
	return this;	
};
$.extend(Entity.prototype, {
	calculateBoxsize: function(depthLevel, depthModifier) {
		this.boxDim.x *= Math.pow(depthModifier, 0-depthLevel);

		if (this.children) {
			var totalWidth = 0;
			for (var i=0; i<this.children; i++) {
				var childNode = this.children[i];
				childNode.calculateBoxsize(depthLevel+1, depthModifier);
				totalWidth += childNode.boxDim.x;
			}
		}
	}
});

Entity.createNode = function(data) {
	switch (data.type) {
	default:
		var node = new Entity(data);	
	}
	return node;
};

var OrgchartView = function(initialConfig) {
	$.extend(this, initialConfig || {});
	this.persons = {};
	this.groups = [];
	this.depthModifier = 1.2;
	return this;
};
$.extend(OrgchartView.prototype, {
	addPerson: function(personId) {
		var width = 150, height = 35,
			data = T[personId];
		var $person = $(document.getElementById('shortprofileTmpl').innerHTML);
		$(".name", $person).html(data.name || "");
		$(".jobTitle", $person).html(data.jobTitle || "");			

		this.persons[personId] = {
			data: data,
			$el: $person,
			dim: { x:width, y:height }
		};
	},
	calculateBoxsize: function(node, depthLevel) {
		this.rootNode.calculateBoxsize(0, 1.2);

		if (node.children) {
			var childrenWidth = 0;
			for (var i=0; i<node.children.length; i++) {
				var childNode = node.children[i];
				this.calculateBoxsize(childNode, 0-depthLevel+1);
				childrenWidth += childNode.width;
			}

		}
	},

	setRootnode: function(node) {
		this.rootNode = Entity.createNode(node);
	},
	render: function(config) {
		var persons = this.persons;
		
		
		for (var personId in this.persons) {
			this.$el.append(this.persons[personId].$el);
		}
	}
});

var T = {
	'roger': {
		name: 'Roger Yeh',
		jobTitle: 'HTML developer',
	},
	'adam': {
		name: 'Adam Hugos',
		jobTitle: 'Senior Manager',
	},
	'nathan': {
		name: 'Nathan Cruoos',
		jobTitle: 'Business Analyst',
	},
	john1: {
		name: 'John 1',
		jobTitle: 'Developer'
	},
	john2: {
		name: 'John 2',
		jobTitle: 'Quality Assurance'
	}
};

var Config = {
	templates: {
		shortprofile: {
			templateId: 'shortprofile-tmpl',
			minwidth: 350,
			minheight: 50
		}
	}
};

$(document.body).ready(function() {
	var o = new OrgchartView({
		$el: $('.orgChart'),
		width: 700,
		height: 450,
	    	T: T,
	    	Config: Config
	});
	o.setRootnode({
		type: 'person',
		id: 'adam',
		children: [{
			type: 'person',
			id: 'nathan'
		},{
			type: 'person',
			id: 'roger'	
		},{
			type: 'team',
			id: 'pearl',
			children: [{
				type: 'person',
				id: 'john1'
			},{
				type: 'person',
				id: 'john2'	
			}]
		}]

	});
	o.calculatePos();
	o.render();
	return;
	
	var t1 = getT({ name: 'John', jobTitle: 'Developer'});
	t1.css({left: 100,top: 30});
	$orgChart.append(t1);

	var t2 = getT({ name: 'Mike', jobTitle: 'Business Analyst'});
	t2.css({left: 300,top: 100});
	$orgChart.append(t2);
	
	/// raphael
	var paper = Raphael($('.orgChart').get(0), 700, 450);
	paper.path("M10,20L130,140").attr({
		stroke: '#b22f2f',
		fill: 'red',
		'stroke-width': "4",
		'stroke-linecap': 'round'
	});
});
