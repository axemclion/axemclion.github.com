var redirects = {
	'/trialtool/examples/default.html': '/trialtool/examples/Template.html',
	'/IndexedDB/jquery/': '/jquery-indexeddb/',
	'/IndexedDB/LINQ/': '/Linq2IndexedDB/',
	'/ttd/IndexedDB/': '/IndexedDB//trialtool/',
	'/ttd/firefox/': '/IndexedDB/trialtool/',
	'/metrialtool': '/projects/metrialtool.html', // TODO - FIX THIS

	'/misc.html': '#misc',
	'/about.html': '#about',

	'/projects/trialtool.html': 'https://github.com/axemclion/trialtool/',
	'/projects/flashresizer.html': 'https://github.com/axemclion/mediaplus',
	'/projects/gids.html': 'https://code.google.com/p/gids/',
	'/projects/twitteybot.html': 'https://code.google.com/p/twitteybot/',
	'/projects/sneakoscope.html': 'https://code.google.com/p/sneakoscope/',
	'/projects/seamcarving.html': 'https://github.com/axemclion/seamcarving',
	'/projects/go-sync.html': 'http://code.google.com/p/go-sync/',
	'/projects/tackle.html': 'https://code.google.com/p/googlepages/source/browse/trunk/Tackle.js',
	'/projects/chromahash.html': 'http://axemclion.github.com/Chroma-Hash/',
	'/projects/scrapstimeout.html': 'http://axemclion.github.com/scrapstimeout/',
	'/projects/linkify.html': 'http://gist.github.com/28928',
	'/projects/bookmark.html': 'http://gist.github.com/26425',
	'/projects/visionizzer.html': 'http://code.google.com/p/visionizzer/',
	'/projects/greasemonkey.html': 'http://userscripts-mirror.org/users/17966/scripts',
	'/projects/gmsimulator.html': 'http://googlepages.googlecode.com/svn/trunk/SignOnManager.html',
	'/projects/mapdoodle.html': 'http://googlepages.googlecode.com/svn/trunk/mapdoodle.html',
	'/projects/signonmanager.html': 'http://googlepages.googlecode.com/svn/trunk/SignOnManager.html'
};

(function redirect(redirects, currentLocation) {
	for (var url in redirects) {
		var regex = new RegExp(url);
		if (currentLocation.match(regex)) {
			var loc = currentLocation.replace(regex, redirects[url]);
			if (redirects[url].indexOf('http') === 0) {
				loc = redirects[url];
			}
			window.location = loc;
			if (loc.indexOf("#") !== -1) {
				window.location.reload();
			}
			break;
		}
	}
})(redirects, window.location.href);