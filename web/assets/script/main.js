$(function () {
	var videos = [], videoLookup, inMobileMode, lastInteraction = 0;

	var container = $('#videos');

	checkState();

	$(window).resize(checkState);
	function checkState () {
		lastInteraction = Date.now();
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

		videoLookup = {};
		videos.forEach(function (video) {
			videoLookup[video.getTitle()] = video;
		})

		setGlobalHover(false);
	})

	function updateStatus() {
		$.getJSON('/api/getstatus', function (data) {
			setActive(videoLookup[data.video]);
		})
	}
	updateStatus();

	function checkStatus() {
		if ((Date.now() - lastInteraction) > 60000) updateStatus();
	}
	setInterval(checkStatus, 60000);

	function setActive(video) {
		if (!video) return;
		var y = video.getCenterY() - window.innerHeight/2;
		window.scrollTo(0, y);
		setGlobalHover(video);
	}

	function setGlobalHover(hoverVideo) {
		lastInteraction = Date.now();
		videos.forEach(function (video) { video.setHover(video === hoverVideo) });
	}
	
	function checkScrollHover() {
		lastInteraction = Date.now();

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
				lastInteraction = Date.now();
				console.log(response);
			})
		})

		node.find('.playButton').get(0).insertAdjacentHTML('beforeend','<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#000" stroke-width="15" stroke="#fff"/><polygon points="70,55 70,145 145,100" fill="#fff"/></svg>');

		var me = {
			setHover: setHover,
			getCenterY: function () { return preview.offset().top + preview.height()/2 },
			getTitle: function () { return data.title },
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
