(function () {
	'use strict';

	window.lifecycle = {
		afterEach: function () {
			var cookie;
			// Remove the cookies created using js-cookie default attributes
			for (cookie in Cookies.get()) {
				Cookies.remove(cookie);
			}
			// Remove the cookies created using browser default attributes
			for (cookie in Cookies.get()) {
				Cookies.remove(cookie, {
					path: ''
				});
			}
		}
	};

	window.addEvent = function (element, eventName, fn) {
		var method = 'addEventListener';
		if (element.attachEvent) {
			eventName = 'on' + eventName;
			method = 'attachEvent';
		}
		element[ method ](eventName, fn);
	};

	window.using = function (assert) {
		function getQuery(key) {
			var queries = location.href.split('?')[1];
			if (!queries) {
				return;
			}
			var pairs = queries.split(/&|=/);
			var indexBaseURL = pairs.indexOf(key);
			var result = pairs[indexBaseURL + 1];
			if (result) {
				return decodeURIComponent(result);
			}
		}
		function setCookie(name, value) {
			return {
				then: function (callback) {
					var iframe = document.getElementById('request_target');
					var serverURL = getQuery('integration_baseurl');
					Cookies.set(name, value);
					if (!serverURL) {
						callback(Cookies.get(name), document.cookie);
					} else {
						var requestURL = [
							serverURL,
							'encoding?',
							'name=' + encodeURIComponent(name),
							'&value=' + encodeURIComponent(value)
						].join('');
						var done = assert.async();
						addEvent(iframe, 'load', function () {
							var iframeDocument = iframe.contentWindow.document;
							var root = iframeDocument.documentElement;
							var content = root.textContent;
							if (!content) {
								ok(false, [
									'"' + requestURL + '"',
									'content should not be empty'
								].join(' '));
								done();
								return;
							}
							try {
								var result = JSON.parse(content);
								callback(result.value, iframeDocument.cookie);
							} finally {
								done();
							}
						});
						iframe.src = requestURL;
					}
				}
			};
		}
		return {
			setCookie: setCookie
		};
	};

	window.loadFileSync = function (path) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', path, false);
		xhr.send(null);
		return xhr.status === 200 ? xhr.responseText : null;
	};

	window.quoted = function (input) {
		return '"' + input + '"';
	};

}());
