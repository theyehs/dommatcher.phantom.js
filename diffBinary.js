
var fs = require('fs');
var system = require('system');

var oldFile = system.args[1];
var newFile = system.args[2];
var url = system.args[3];
var screenshotFile = system.args[4];

if (!oldFile || !newFile || !url) {
	console.log('RUN "phantomjs diffBinary.js oldarchive.ext newarchive.ext screenshotFile.png');
	phantom.exit();
}

var oldArchive, newArchive;
oldArchive = JSON.parse(fs.read(oldFile));
newArchive = JSON.parse(fs.read(newFile));

setTimeout(function() {
	var diffs = {};
	for (var nodeId in newArchive) {
		var oldNodeStyles = oldArchive[nodeId];
		var newNodeStyles = newArchive[nodeId];
		if (!oldNodeStyles) {
			//console.log('Warning: cannot find ' + k);
			continue;
		}
		
		for (var styleName in oldNodeStyles) {
			var oldStyle = oldNodeStyles[styleName];
			var newStyle = newNodeStyles[styleName];

			if (oldStyle != newStyle) {
				diffs[nodeId] = diffs[nodeId] || {};
				diffs[nodeId][styleName] = [styleName, oldStyle, newStyle];
//				console.log(nodeId + '   ' + styleName + '::' + oneStyle + ' | ' + twoStyle);
			}
		}
	}
	
	var page = require('webpage').create();
	page.open(url, function (status) {
		if (status != 'success') phantom.exit();
	
	/*
		page.evaluate(function() {
			$(".category-selector-block").css({
				backgroundColor: 'red',
				//'margin-top': '15px'
			});
		});
	*/
		
		var outbuffer = page.evaluate(function(diffs) {
			var nodeList = {};
			// reconstruct the list of DOM nodes with style changes
			for (var nodeId in diffs) {
				var p = nodeId.indexOf(':');
				var nodeSelector = nodeId.substring(0, p),
					indexPos = nodeId.substring(p+1);

				// find the one matched element based on its nodeIndex
				var matchedEl = null;
				$(selector).each(function(idx, el) {
					if (matchedEl) return;
					var nodeIndexOf = Array.prototype.indexOf.call(el.parentNode.childNodes, el);
					if (indexPos == nodeIndexOf)
						matchedEl = el;
				});

				if (matchedEl) {
					nodeList[nodeId] = matchedEl;
					matchedEl.deltaStyles = diffs[nodeId];
					$(matchedEl).attr('f-nodeid', nodeId);
				}
			}

			// traverse the DOM tree to filter out the false positives
			var hLayoutStyles = ['height', 'border-width', 'border-style', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'position', 'overflow'];
			var wLayoutStyles = ['width', 'border-width', 'border-style', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'position', 'overflow'];			
				
			for (var nodeId in nodeList) {
				var matchedEl = nodeList[nodeId], $el = $(matchedEl);
				if (!matchedEl) continue;
				var changedStyles = matchedEl.deltaStyles;
				
				// for each layout change, if a child element also has that. skip
				var hasChildWLayoutChange = false, hasChildHLayoutChange = false;
				if (changedStyles.height) {
					$el.find("[f-nodeid]").each(function(idx, el) {
						var nodeId = $(el).attr('f-nodeid'), changedStyles = el.deltaStyles;
						for (var i=0; i<hLayoutStyles.length; i++) {
							if (changedStyles[hLayoutStyles[i]]) {
								hasChildHLayoutChange = true;
								break;
							}
						}
					});
				}

				if (hasChildLayoutChange && changedStyles.width) {
					$el.find("[f-nodeid]").each(function(idx, el) {
						var nodeId = $(el).attr('f-nodeid'), changedStyles = el.deltaStyles;
						for (var i=0; i<wLayoutStyles.length; i++) {
							if (changedStyles[wLayoutStyles[i]]) {
								hasChildWLayoutChange = true;
								break;
							}
						}
					});
				}
				
				var realChangeStyles = [], changeCounter = 0;
				for (var styleName in changedStyles) {
					var styleArr = changedStyles[styleName];
					console.log(styleName + ':' + styleArr[1] + ':' + styleArr[2]);
				}
			}
			/*
			for (var nodeId in diffs) {
				var matchedEl = nodeList[nodeId], $el = $(matchedEl);
				if (!matchedEl) continue;

				var diffArr = diffs[diffKey];
				// for each layout change, if a child element also has that. skip
				if (diffArr['width'] || diffArr['height']) {
					var hasChildLayoutChange = false;
					$el.find("[f-guid]").each(function(idx, el) {
						var fGuid = $(el).attr('f-guid');
						
					});
				
				var text = '', cc = 0;
				for (var ss in diffArr) {
					var arr = diffArr[ss];
					text += ss  + ':' + arr[1] + ':' + arr[2];
					if (cc++ > 2) {
						text += '...';
						break;
					}
					text += '<br>';
				}
//				for (var i=0; i<diffArrs.length; i++) {
	//				var diffArr = diffArrs[i];
		//		}

				var elOffset = $el.offset();
				$("<div>").html(text).css({
					position: 'absolute',
					color: 'red',
					zIndex: 19999,
					opacity: 0.8,
					fontWeight: 'bold',
					fontSize: '14px',
					left: elOffset.left,
					top: elOffset.top - 20
				}).appendTo($(document.body));

				$el.css({
					border: '4px solid red'
				});
			}
			*/
		}, diffs);
		page.render('diff.png');		
		phantom.exit();
	});
}, 1000);
