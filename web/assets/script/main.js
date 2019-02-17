$(function () {
	var videos = [], activeVideo, inMobileMode;

	var container = $('#videos');

	checkState();

	$(window).resize(checkState);
	function checkState () {
		inMobileMode = (window.innerWidth < 700);
		checkScrollHover();
	}

	$(window).scroll(checkScrollHover);

	$('#stopButton').click(function () {
		$.getJSON('/api/stop', function () {})
	})

	$.getJSON('/api/getvideos', function (data) {
		container.html(null);
		videos = data.map(function (entry) { return new Video(entry) });

		setGlobalHover(false);
	})

	function setGlobalHover(hoverVideo) {
		videos.forEach(function (video) { video.setHover(video === hoverVideo) });
	}
	
	function checkScrollHover() {
		if (!inMobileMode) return;

		var y0 = $(window).scrollTop() + window.innerHeight/2;
		var minDistance = 1e10;
		var hoverVideo = false;
		
		videos.forEach(function (video) {
			var y = video.getCenterY();
			var distance = Math.abs(y - y0);
			if (minDistance > distance) {
				minDistance = distance;
				hoverVideo = video;
			}
		})


		setGlobalHover(hoverVideo);
	}

	function Video(data) {
		var preview, previewInterval;
		var isHover = false;
		var offset = 0;

		var node = $([
			'<div class="video">',
				'<div class="preview" style="background-image:url(\'/assets/thumbs/'+data.thumbnailName+'\')">',
					'<div class="playButton"></div>',
				'</div>',
				'<div class="title">'+data.title+'</div>',
			'</div>'
		].join(''));

		preview = node.find('.preview');

		container.append(node);

		node.on('mouseover', function () { setGlobalHover(me) });
		node.on('mouseout',  function () { setGlobalHover(false) });

		node.on('click', function () {
			$.getJSON('/api/play/'+data.title, function (response) {
				console.log(response);
			})
		})

		node.find('.playButton').get(0).insertAdjacentHTML('beforeend','<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#000" stroke-width="15" stroke="#fff"/><polygon points="70,55 70,145 145,100" fill="#fff"/></svg>');

		var me = {
			setHover: setHover,
			getCenterY: function () { return preview.offset().top + preview.height()/2; }
		}

		function setHover(hover) {
			if (hover === isHover) return;

			node.toggleClass('hover', hover);

			if (hover) {
				startPreview();
			} else {
				stopPreview();
			}

			isHover = hover;
		}

		function startPreview() {
			offset = 0;
			preview.css('background-position', '0 '+(-48*128-1)+'px');
			previewInterval = setInterval(function () {
				offset = (offset+1) % 96;
				preview.css('background-position', '0 '+(-offset*128-1)+'px');
			}, 80)
		}

		function stopPreview() {
			if (previewInterval) clearInterval(previewInterval);
			previewInterval = false;

		}

		return me;
	}
})
