
fs = require('fs');

var one, two;
one = JSON.parse(fs.read('./pearloutfull1'));
two = JSON.parse(fs.read('./pearloutfull2'));

setTimeout(function() {
	var diffs = {};
	for (var k in two) {
		var oneStyles = one[k];
		var twoStyles = two[k];
		if (!oneStyles) {
			//console.log('Warning: cannot find ' + k);
			continue;
		}
		for (var styleName in oneStyles) {
			var oneStyle = oneStyles[styleName];
			var twoStyle = twoStyles[styleName];

			if (oneStyle != twoStyle) {
				diffs[k] = diffs[k] || {};
				diffs[k][styleName] = [styleName, oneStyle, twoStyle];
				console.log(k + '   ' + styleName + '::' + oneStyle + ' | ' + twoStyle);
			}
		}
	}
	
	var page = require('webpage').create();
	var url = 'https://www.pearl.com/';
	page.open(url, function (status) {
		if (status != 'success') phantom.exit();
	
		page.evaluate(function() {
			$(".category-selector-block").css({
				backgroundColor: 'red',
				//'margin-top': '15px'
			});
		});
		
		var outbuffer = page.evaluate(function(diffs) {
			var nodeList = {};
			for (var diffKey in diffs) {
				var selectorStr = diffKey;
				var p = selectorStr.indexOf(':');
				var selector = selectorStr.substring(0, p),
					indexPos = selectorStr.substring(p+1);
				var matchedEl = null;
				$(selector).each(function(idx, el) {
					if (matchedEl) return;
					var nodeIndexOf = Array.prototype.indexOf.call(el.parentNode.childNodes, el);
					if (indexPos == nodeIndexOf)
						matchedEl = el;
				});

				if (matchedEl) {
					nodeList[diffKey] = matchedEl;
					$(matchedEl).attr('f-guid', diffs);
				}
			}
			
			for (var diffKey in diffs) {
				var matchedEl = nodeList[diffKey], $el = $(matchedEl);
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
		}, diffs);
		page.render('diff.png');		
	//	page.injectJs('http://codeorigin.jquery.com/jquery-1.10.2.min.js')
		phantom.exit();
	});
}, 1000);