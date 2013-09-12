// RUN "phantomjs diffBinary.js oldarchive.ext newarchive.ext screenshotFile.png');

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
//				console.log(nodeId + '   ' + styleName + '::' + oldStyle + ' | ' + newStyle);
			}
		}
	}
	
	var page = require('webpage').create();
	page.open(url, function (status) {
		if (status != 'success') phantom.exit();
	
		page.evaluate(function() {
			$(".category-selector-block").css({
				'margin-top': '3px'
			});
			$(".container.full-width").css("font-family", 'Arial');
		});

		setTimeout(function() {
			var outbuffer = page.evaluate(function(diffs) {
				var nodeList = {};
				// reconstruct the list of DOM nodes with style changes
				for (var nodeId in diffs) {
					var p = nodeId.indexOf(':');
					var nodeSelector = nodeId.substring(0, p),
						indexPos = nodeId.substring(p+1);
	
					// find the one matched element based on its nodeIndex
					var matchedEl = null;
					$(nodeSelector).each(function(idx, el) {
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
				var hLayoutStyles = ['height', 'border-width', 'border-style', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'position', 'overflow', 'font-size'];
				var wLayoutStyles = ['width', 'border-width', 'border-style', 'margin-left', 'margin-right', 'padding-left', 'padding-right', 'position', 'overflow', 'font-size'];	

				// this is an incomplete list for prototyping 
				var nonInheritableStyles = ['height', 'border-width', 'border-style', 'margin-top', 'margin-left', 'margin-bottom', 'margin-right', 'padding-top', 'padding-left', 'padding-bottom', 'padding-right', 'position', 'overflow', 'background-image'];
	
				var outbuffer = [];
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
	
					if (changedStyles.width) {
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
	
					// for each inheritable change, if a parent element also has that, skip
					var inheritedStyles = {};
					$el.parents("[f-nodeid]").each(function(idx, el) {
						var nodeId = $(el).attr('f-nodeid'), changedStyles = el.deltaStyles;
						for (var styleName in changedStyles) {
							if (nonInheritableStyles.indexOf(styleName) == -1) {
								inheritedStyles[styleName] = true;
							}
						}
					});
	
					var realChangeStyles = [], changeCounter = 0, changeText = '';
					for (var styleName in changedStyles) {
						var styleArr = changedStyles[styleName];
						if (styleName == 'width' && hasChildWLayoutChange) continue;
						if (styleName == 'height' && hasChildHLayoutChange) continue;
						if (inheritedStyles[styleName]) continue;
						outbuffer.push(nodeId + '[' + styleName + ']:' + styleArr[1] + ':' + styleArr[2] + "\n");
						changeText += styleName + ': ' + styleArr[1] + ' || ' + styleArr[2];
						if (changeCounter++ > 3) {
							break;
						}
						changeText += "<br>";
					}
	
					// highlight the node				
					if (changeCounter > 0) {
						var elOffset = $el.offset();
						$("<div>").html(changeText).css({
							position: 'absolute',
							color: 'black',
							zIndex: 19999,
							opacity: 0.85,
							fontWeight: 'bold',
							fontSize: '12px',
							left: elOffset.left,
							top: elOffset.top - 20
						}).appendTo($(document.body));
						$el.css({
							border: '4px solid red'
						});
					}
				}
				return outbuffer;
			}, diffs);
			
			if (screenshotFile)
				page.render(screenshotFile);		
			console.log(outbuffer);
			phantom.exit();
		}, 3000);
	});
}, 1000);
