define([
	'core/dom', // dom.get, dom.query
	'core/on',
	'dojo/domReady!'
], function(dom, on) {

	var images = dom.query('.photos > a'),
		photoViewer = dom.get('photo-viewer'),
		photoViewerImg = photoViewer ? dom.query('#photo-viewer img')[0] : undefined;

	dom.query('#photo-viewer .close').on('click', function (e) {
		e && e.preventDefault();
		dom.modify(photoViewer, '.hidden');
	});

	if (photoViewer) {
		on(photoViewer, 'click', function (e) {
			e && e.preventDefault();
			dom.modify(photoViewer, '.hidden');
		});
	}

	if (images.length) {
		images.on('click', function (e) {
			e && e.preventDefault();
			photoViewerImg.src = e.target.src.replace('/thumb/', '/full/');
			dom.modify(photoViewer, '!.hidden');
		});
	}

});