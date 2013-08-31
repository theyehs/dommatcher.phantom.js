
var page = require('webpage').create();
//var url = 'http://qa2.justanswer.local/';
var url = 'https://www.pearl.com/';
page.open(url, function (status) {
	if (status != 'success') phantom.exit();
//	page.injectJs('http://codeorigin.jquery.com/jquery-1.10.2.min.js')

	page.evaluate(function() {
		$(".category-selector-block").css({
			backgroundColor: 'red',
			'margin-top': '15px'
		});
	});

	var output = page.evaluate(function() {
		var ret = {};
		var counter = 0;
		var nodes = document.querySelectorAll("*");
		for (var i=0; i<nodes.length; i++) {
			var el = nodes[i];
			 var id, cls, nodeIndexOf;
			 id = el.getAttribute('id') || '';
			 cls = (el.getAttribute('class') || '').replace(/\s+/, '.').substring(0, 100);
			 if (!id && !cls) continue;
			 nodeIndexOf = Array.prototype.indexOf.call(el.parentNode.childNodes, el);
			 
			 var nodeGuid = '';
			 if (id)
			 	nodeGuid += '#' + id;
			 if (cls)
			 	nodeGuid += '.' + cls;
			 nodeGuid += ':' + nodeIndexOf; 
//			 if (counter++ > 100) continue;
	
			var s = window.getComputedStyle(el, null)
			var styles = {};
			for (var j=0; j<s.length; j++) {
				var name = s[j];
				if (name.match(/^-/)) continue;
				styles[name] = s.getPropertyValue(name);
			}

/*
//			var s = window.getComputedStyle(el, null)
			var s = el.style;
			var styles = {};
			for (var styleName in s) {
				if (!s.hasOwnProperty(styleName)) continue;
				if (styleName.match(/^webkit/)) continue;
				styles[styleName] = s[styleName];
			}
*/
			ret[nodeGuid] = styles;
		}; 	
		return ret;
	});	
	console.log(JSON.stringify(output));
	phantom.exit();
});
