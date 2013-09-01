
var doShowside = true;
var doVirtualScroll = true;

$(document).ready(function() {
	var $tr = $('question');
	$tr.mouseenter(function() {
		$(this).addClass("selected");
	}).mouseleave(function() {
		$(this).removeClass("selected");			
	});

	var i = 0;
	var timer = setInterval(function() {
		var $newtr = $tr.clone().appendTo('questionlist')
			.addClass('row' + i)
			.removeClass('selected');

		$newtr.mouseenter(function() {
			$(this).addClass("selected");
		}).mouseleave(function() {
			$(this).removeClass("selected");			
		});
			
		$newtr.find('.topright').hide();
		$newtr.find('text').get(0).innerHTML += i;
		update();
		if (i++ > 25) {
			clearInterval(timer);
			$(document).trigger('dataready');
		}
	}, 250);

	var $scrollct = $('scrollbar');
	var $scroll = $('scrollbar handle');
	var $table = $('questionlist');
	
	if (!doVirtualScroll) {
		$scrollct.hide();
		$table.css({
			'overflow': 'auto',
			width: 720
		});
	}
	if (!doShowside) {
		$('eventlist').hide();
	}
	
	var update = function(changed) {
		changed = changed || {};
		var data = changed.data = changed.data || [];

		shrinkRatio = $table.get(0).scrollHeight / $table.height();

		$('.notify').each(function(i, el) {		
			$(el).css({
//				top: ($newtr.position().top + $table.scrollTop()) / shrinkRatio,
				height: 50 / shrinkRatio,
			});
		});

		for (var i=0; i<data.length; i++) {
			var row = data[i];
			var $newtr = $tr.clone();
			var randomRow = Math.floor((Math.random()*$table.find('question').size()));
			$table.find('question').eq(randomRow).before($newtr);
			var statenum = parseInt(Math.random()*3)+1;
			$newtr.addClass('row' + i)
				.addClass('add')
				.removeClass('selected')
				.addClass('state'+statenum)
				.prop('ttl', 100);
//				.find('question').get(0).innerHTML += row.id;
			$newtr.find('.topright').hide();
			$newtr.mouseenter(function() {
				$(this).addClass("selected");
			}).mouseleave(function() {
				$(this).removeClass("selected");			
			});

			$newevt = $('#newevent').clone().prependTo("eventlist").show();
			switch (statenum) {
			case 1:
//				$newevt.find('bar').css('background-color', 'rgb(216, 60, 85)');
				$newevt.find('bar').css('background-image', 
					'-webkit-gradient(linear, left top, right top, color-stop(0, #FFFFFF), color-stop(1, rgb(216, 60, 85)))');
				$newevt.find('strong').html("Question Removed");
				break;
			case 2:
//				$newevt.find('bar').css('background-color', 'rgb(4, 170, 182)');
				$newevt.find('bar').css('background-image', 
					'-webkit-gradient(linear, left top, right top, color-stop(0, #FFFFFF), color-stop(1, rgb(4, 170, 182)))');

				$newevt.find('strong').html("Question Updated");
				break;			
			default:
//				$newevt.find('bar').css('background-color', 'rgb(113, 181, 47)');
				$newevt.find('bar').css('background-image', 
					'-webkit-gradient(linear, left top, right top, color-stop(0, #FFFFFF), color-stop(1, rgb(113, 181, 47)))');
				$newevt.find('strong').html("New Mechanical Question");
				break;
			}

			var $newNoti = $("<div>")
				.addClass('notify')
				.addClass('state'+statenum)
				.appendTo($scrollct)
				.css({
					top: ($newtr.position().top + $table.scrollTop()) / shrinkRatio,
					height: $newtr.height() / shrinkRatio,
				}).prop({
					ttl: 100
				}).append("<label>" + 
					{ 1: 'new', 2: 'modified', 3: 'claimed' }[statenum]
					+ "</label>");
		}

		$scroll.height($scrollct.height() / shrinkRatio);
	};

	
	var l = function(color, p) {
		var diff = 255 - color;
		var ret = parseInt(color + diff * (100 - p) / 110.0);
		return ret;
	};
	
	setInterval(function() {
		$table.find('question').each(function(i, el) {
			var $this = $(el);
			var ttl = $this.prop('ttl');
			if (ttl) {
				ttl = parseInt(ttl);
				--ttl;
				if (ttl <= 0) {
					$this.removeProp('ttl');
					$this.removeClass('add').css('background-color', 'rgb(247, 247, 247)');
				} else {
					$this.prop('ttl', ttl);
					if ($this.hasClass('state1')) {
						$this.css('background-color', 'rgb('+l(216, ttl)+', '+l(60, ttl)+', '+l(85, ttl)+')');
					}
					if ($this.hasClass('state2')) {
						$this.css('background-color', 'rgb('+l(4, ttl)+', '+l(170, ttl)+', '+l(182, ttl)+')');
					}
					if ($this.hasClass('state3')) {
						$this.css('background-color', 'rgb('+l(113, ttl)+', '+l(181, ttl)+', '+l(47, ttl)+')');
					}
				}
			}
		});
		
		$('.notify').each(function(i, el) {
			var $this = $(el);
			var ttl = $this.prop('ttl');
			if (ttl) {
				ttl = parseInt(ttl);
				--ttl;
				if (!ttl) {
					$this.remove().css('opacity', 1.0);
				} else {
					$this.prop('ttl', ttl);
					$this.css('opacity', 1.0 - (100 - ttl) * 0.01);
				}
			}
		});
	}, 100);

	var tt = setInterval(function() {
			update({
				data: [{
					id: 'new row',
					type: 'addition',
				}]	      
			});
			if ($table.find('question').length > 40) clearInterval(tt);
	}, 1600);

	var shrinkRatio;
	var $tooltip = $('#tooltip');
	update(); 
	/*
	$table.scroll(function() {
		var t = $table.get(0).scrollTop;
		$scroll.css('top', t / shrinkRatio);
//		$scroll.val($table.get(0).scrollTop);
	});
	*/
	$scroll.change(function() {
		$table.scrollTop($scroll.val());
	});
	
	$(document).bind('dataready', function() {
		$scroll.draggable({
			axis: 'y',
			containment: 'scrollbar',
			drag: function(evt, ui) {
				var offset = $scroll.offset();
				var record = parseInt((offset.top - 55) * shrinkRatio / 50 + 1);
	
				$tooltip.css({
					top: offset.top + 10,
					left: offset.left + 20,
					display: 'block'
				}).html("Showing record#" + record + " to #" + (record + 7));
	
				$table.scrollTop($scroll.position().top * shrinkRatio);
			},
			start: function(evt, ui) {
			},
			stop: function() {
				$tooltip.css({
					display: 'none'
				});
			}
		});
	});		
		
});
