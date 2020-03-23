(function (factory) {
typeof define === 'function' && define.amd ? define(factory) :
factory();
}((function () { 'use strict';

if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
	var el = this;

	do {
		if (el.matches(s)) return el;
		el = el.parentElement || el.parentNode;
	} while (el !== null && el.nodeType === 1);

	return null;
	};
}

// IE11 Polyfill .forEach
if ("NodeList" in window && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function (callback, thisArg) {
	thisArg = thisArg || window;

	for (var i = 0; i < this.length; i++) {
		callback.call(thisArg, this[i], i, this);
	}
	};
}

if (!Object.entries) {
	Object.entries = function (obj) {
	var ownProps = Object.keys(obj),
		i = ownProps.length,
		resArray = new Array(i); // preallocate the Array

	while (i--) {
		resArray[i] = [ownProps[i], obj[ownProps[i]]];
	}

	return resArray;
	};
}

function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	_typeof = function (obj) {
		return typeof obj;
	};
	} else {
	_typeof = function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};
	}

	return _typeof(obj);
}

var Noop = function Noop() {};

var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

var Log = function Log(t) {
	if (window.TOnlineMediaplayerFramework.IsInDebugMode() === false) return Noop;
	t = t || "info";
	var colors = {
	info: {
		bg: "#19cf85",
		fg: "#272b30"
	},
	warn: {
		bg: "#ffd866",
		fg: "#272b30"
	},
	debug: {
		bg: "#3c92d1",
		fg: "#272b30"
	},
	error: {
		bg: "#ff6188",
		fg: "#272b30"
	}
	};
	var c;

	if (t in colors === false) {
	if (_typeof(t) === "object") {
		c = {
		fg: t.fg || "#777",
		bg: t.bg || "transparent"
		};
	} else {
		c = colors.info;
	}
	} else {
	c = colors[t];
	}

	return function (desc) {
	for (var _len = arguments.length, logs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		logs[_key - 1] = arguments[_key];
	}

	if (isIE11) {
		var _window$console;

		(_window$console = window.console).log.apply(_window$console, [desc].concat(logs));
	} else {
		var _window$console2;

		(_window$console2 = window.console).log.apply(_window$console2, ["%c" + desc, "color:" + c.fg + ";background:" + c.bg + ";"].concat(logs));
	}
	};
};

var IsTouchDevice = function IsTouchDevice() {
	if (window.matchMedia("(pointer: coarse)").matches) {
	return true;
	} else {
	return false;
	}
};

var OMIDWhiteList = {
	"meetrics.com-omid": ["https://s418.mxcdn.net/bb-serve/omid-meetrics-v1.js"]
};

var OMIDUtils = function OMIDUtils(opts) {
	opts = opts || {};
	opts.videoEl = opts.videoEl || null;
	var sessionStartEventsAlreadyTriggered = false;
	var vendorRessources = [];
	var registeredSessionObservers = [];
	var verificationResources = opts.verificationResources;
	var player = opts.player;
	var adSessionID = opts.adSessionID;

	var StartSession = function StartSession() {
	// Fire the sessionStart event to each registered session observer.
	registeredSessionObservers.forEach(function (sessionObserver) {
		var observerCallback = sessionObserver.observer;
		var parameters = sessionObserver.verificationParameters;
		var observerParams = {
		adSessionId: adSessionID,
		type: "sessionStart",
		timestamp: Date.now(),
		data: {
			verificationParameters: parameters,
			context: {
			apiVersion: "1.0",
			environment: "web",
			accessMode: "full",
			videoElement: opts.videoEl,
			adSessionType: "html",
			adCount: 1,
			omidJsInfo: {
				omidImplementer: "TOnlineMediaplayerFramework",
				serviceVersion: "4.1.1"
			}
			}
		}
		};
		Log()("TOnlineMediaplayer", "OMIDUtils", "Event", "sessionStart", observerParams, sessionObserver);
		observerCallback(observerParams);
	});
	sessionStartEventsAlreadyTriggered = true;
	};

	var getParametersFromVastForVendor = function getParametersFromVastForVendor(vendorKey) {
	var retval = null;
	vendorRessources.forEach(function (vendorRessource) {
		Log()("TOnlineMediaplayer", "OMIDUtils", "AdVerifications Vendor Key:", vendorKey);

		if (vendorRessource.getAttribute("vendor") === vendorKey) {
		retval = vendorRessource.querySelector("JavaScriptResource").textContent;
		}
	});
	return retval;
	};

	var registerSessionObserverImpl = function registerSessionObserverImpl(observer, vendorKey) {
	registeredSessionObservers.push({
		observer: observer,
		verificationParameters: getParametersFromVastForVendor(vendorKey)
	});
	};

	var getUnixTimestamp = function getUnixTimestamp() {
	return Math.floor(Date.now() / 1000);
	};

	var waitForSessionEventsFunc = function waitForSessionEventsFunc(callbackFunc) {
	if (sessionStartEventsAlreadyTriggered) {
		callbackFunc();
	} else {
		setTimeout(function () {
		waitForSessionEventsFunc(callbackFunc);
		}, 100);
	}
	};

	var addEventListenerImpl = function addEventListenerImpl(type, fn) {
	if (type === "video") {
		var onAdLoadedCb = function onAdLoadedCb() {
		var _tmpdata1 = {
			type: "loaded",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {
			skippable: false,
			autoplay: false
			}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "loaded", _tmpdata1);
		fn(_tmpdata1);

		var _tmpduration = opts.player.GetDuration();

		var t = function t() {
			var _tmpdata2 = {
			type: "start",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {
				duration: opts.player.GetDurationFull(),
				videoPlayerVolume: opts.player.GetVolume()
			}
			};
			Log()("TOnlineMediplayer", "OMIDUtils", "Event", "start", _tmpdata2);
			fn(_tmpdata2);
			opts.player.GetVideoEl().removeEventListener("loadedmetadata", t);
		};

		if (_tmpduration === null || isNaN(_tmpduration)) {
			opts.player.GetVideoEl().addEventListener("loadedmetadata", t);
		} else {
			t();
		}
		};

		if (player.IsPlayingAd()) {
		waitForSessionEventsFunc(onAdLoadedCb);
		} else {
		player.On("adLoaded", function () {
			waitForSessionEventsFunc(onAdLoadedCb);
		});
		}

		var onAdPauseCb = function onAdPauseCb() {
		var _tmpdata1 = {
			type: "pause",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "pause", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("adPause", onAdPauseCb);

		var onAdResumeCb = function onAdResumeCb() {
		var _tmpdata1 = {
			type: "resume",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "resume", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("adResume", onAdResumeCb);

		var onPlayerStateChangeCb = function onPlayerStateChangeCb() {
		setTimeout(function () {
			if (player.IsInFullScreenMode() === false) {
			var _tmpdata1 = {
				type: "playerStateChange",
				adSessionId: adSessionID,
				timestamp: getUnixTimestamp(),
				data: {
				state: "normal"
				}
			};
			Log()("TOnlineMediplayer", "OMIDUtils", "Event", "playerStateChange", "normal", _tmpdata1);
			fn(_tmpdata1);
			} else {
			var _tmpdata2 = {
				type: "playerStateChange",
				adSessionId: adSessionID,
				timestamp: getUnixTimestamp(),
				data: {
				state: "fullscreen"
				}
			};
			Log()("TOnlineMediplayer", "OMIDUtils", "Event", "playerStateChange", "fullscreen");
			fn(_tmpdata2);
			}
		}, 500);
		};

		player.On("enterFullscreen,exitFullscreen", onPlayerStateChangeCb);

		var onVolumeChangeCb = function onVolumeChangeCb() {
		var vol = player.GetVolume();
		if (player.IsMuted()) vol = 0;
		var _tmpdata1 = {
			type: "volumeChange",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {
			videoPlayerVolume: vol
			}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "volumeChange", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("volumechange", onVolumeChangeCb);

		var onAdFirstQuartileCb = function onAdFirstQuartileCb() {
		var _tmpdata1 = {
			type: "firstQuartile",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "firstQuartile", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("adFirstQuartile", onAdFirstQuartileCb);

		var onAdMidpointCb = function onAdMidpointCb() {
		var _tmpdata1 = {
			type: "midpoint",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "midpoint", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("adMidpoint", onAdMidpointCb);

		var onAdThirdQuartileCb = function onAdThirdQuartileCb() {
		var _tmpdata1 = {
			type: "thirdQuartile",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "thirdQuartile", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("adThirdQuartile", onAdThirdQuartileCb);

		var onAdClickCb = function onAdClickCb() {
		var _tmpdata1 = {
			type: "adUserInteraction",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {
			interactionType: "click"
			}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "adUserInteraction", _tmpdata1);
		fn(_tmpdata1);
		};

		player.On("adClick", onAdClickCb);

		var onAdCompleteCb = function onAdCompleteCb() {
		var _tmpdata1 = {
			type: "complete",
			adSessionId: adSessionID,
			timestamp: getUnixTimestamp(),
			data: {}
		};
		Log()("TOnlineMediplayer", "OMIDUtils", "Event", "complete", _tmpdata1);
		fn(_tmpdata1);
		player.Off("adLoaded", onAdLoadedCb);
		player.Off("adPause", onAdPauseCb);
		player.Off("adResume", onAdResumeCb);
		player.Off("volumechange", onVolumeChangeCb);
		player.Off("adComplete", onAdCompleteCb);
		player.Off("adFirstQuartile", onAdFirstQuartileCb);
		player.Off("adMidpoint", onAdMidpointCb);
		player.Off("adThirdQuartile", onAdThirdQuartileCb);
		player.Off("adClick", onAdClickCb);
		player.Off("enterFullscreen,exitFullscreen", onPlayerStateChangeCb);
		registeredSessionObservers.forEach(function (sessionObserver) {
			var observerCallback = sessionObserver.observer;
			var parameters = sessionObserver.verificationParameters;
			var _tmpdata2 = {
			adSessionId: adSessionID,
			type: "sessionFinish",
			timestamp: Date.now(),
			data: {
				verificationParameters: parameters
			}
			};
			Log()("TOnlineMediaplayer", "OMIDUtils", "Event", "sessionFinish", _tmpdata2, sessionObserver);
			observerCallback(_tmpdata2);
		});
		registeredSessionObservers = [];
		};

		player.On("adComplete", onAdCompleteCb);
	}
	};

	var totalToBeLoadedCounter = verificationResources.length;
	var loadedCounter = 0;

	var onloadedCb = function onloadedCb() {
	loadedCounter++;

	if (loadedCounter >= totalToBeLoadedCounter) {
		StartSession();
	}
	};

	verificationResources.forEach(function (verificationResource) {
	vendorRessources.push(verificationResource);
	var frame = document.createElement("iframe");
	frame.style.display = "none";
	document.body.appendChild(frame);
	var frameWin = frame.contentWindow; // Expose OMID.

	frameWin.omid3p = {
		registerSessionObserver: registerSessionObserverImpl,
		addEventListener: addEventListenerImpl
	}; // Load verification script.

	var verificationScript = frameWin.document.createElement("script");
	var scriptSrc = verificationResource.querySelector("JavaScriptResource").textContent;
	Log()("TOnlineMediaplayer", "OMIDUtils", "Verification ressource:", verificationResource);
	verificationScript.addEventListener("error", onloadedCb);
	verificationScript.addEventListener("load", onloadedCb);
	verificationScript.src = scriptSrc; // wait and execute in the next tick, not right now
	// -- to fix weird firefox behaviour --

	setTimeout(function () {
		frameWin.document.body.appendChild(verificationScript);
	}, 0);
	});
};

var VASTErrorCodes = {
	100: "XML Parsing Error.",
	101: "VAST schema validation error.",
	102: "VAST version of response not supported.",
	200: "Trafficking error. Media player received an Ad type that it was not expecting and/or cannot play.",
	201: "Media player expecting different linearity.",
	202: "Media player expecting different duration.",
	203: "Media player expecting different size.",
	204: "Ad category was required but not provided.",
	205: "Inline Category violates Wrapper BlockedAdCagetories (refer 3.19.2).",
	206: "Ad Break shortened. Ad was not served.",
	300: "General Wrapper error.",
	301: "Timeout of VAST URI provied in Wrapper element, or of VAST URI provied in a subsequent Wrapper element. (URI was either unavailable or reached a timeout as defined by the media player.)",
	302: "Wrapper limit reached, as defined by the media player. Too many Wrapper responses have been received with no InLine response.",
	303: "No VAST response after one or more Wrappers.",
	304: "InLine response returned ad unit that failed to result in ad display withing defined time limit.",
	400: "General Linear error. Media player is unable to display the Linear Ad.",
	401: "File not found. Unable to find Linear/MedaFile from URI.",
	402: "Timeout of MediaFile URI.",
	403: "Could't find MediaFile that is supported by this media player, based on the attributes of the MediaFile element.",
	405: "Problem displaying MediaFile. Media player found a MediaFile with supported type but couldn't display it. MediaFile may include: unsupported codecs, different MIME type than MediaFile@type, unsupported delivery method, etc.",
	900: "Undefined Error.",
	901: "General VPAID error.",
	902: "General InteractiveCreativeFile error code"
};

function TrackingRequest(url, cb, opts) {
	url = url || false;

	cb = cb || function () {};

	opts = opts || {};
	opts.parent = opts.parent || document.body;
	if (url === false) return;
	var img = document.createElement("img");
	img.src = url;

	function cleanup() {
	img.parentNode.removeChild(img);
	}

	function onLoadCallback() {
	cb(false, img);
	cleanup();
	}

	function onErrorCallback() {
	cb("Error", img);
	cleanup();
	}

	function onAbortCallback() {
	cb("Abort", img);
	cleanup();
	}

	function run() {
	if (img) {
		if (cb) {
		img.onerror = onErrorCallback;
		img.onabort = onAbortCallback;
		img.onload = onLoadCallback;
		}

		opts.parent.appendChild(img);
	}
	}

	run();
}

var VPAIDCreative = null;

function GetIframeDocument(ifr) {
	var ifrDoc = ifr.contentWindow && ifr.contentWindow.document;
	if (!ifrDoc) return false;
	return ifrDoc;
}

var CheckVPAIDInterface = function CheckVPAIDInterface(VPAIDCreative) {
	if (VPAIDCreative.handshakeVersion && typeof VPAIDCreative.handshakeVersion === "function" && VPAIDCreative.initAd && typeof VPAIDCreative.initAd === "function" && VPAIDCreative.startAd && typeof VPAIDCreative.startAd === "function" && VPAIDCreative.stopAd && typeof VPAIDCreative.stopAd === "function" && VPAIDCreative.skipAd && typeof VPAIDCreative.skipAd === "function" && VPAIDCreative.resizeAd && typeof VPAIDCreative.resizeAd === "function" && VPAIDCreative.pauseAd && typeof VPAIDCreative.pauseAd === "function" && VPAIDCreative.resumeAd && typeof VPAIDCreative.resumeAd === "function" && VPAIDCreative.expandAd && typeof VPAIDCreative.expandAd === "function" && VPAIDCreative.collapseAd && typeof VPAIDCreative.collapseAd === "function" && VPAIDCreative.subscribe && typeof VPAIDCreative.subscribe === "function" && VPAIDCreative.unsubscribe && typeof VPAIDCreative.unsubscribe === "function") {
	return true;
	}

	return false;
};

var checkIfrLoaded = function checkIfrLoaded(cw, cb) {
	var c = cw.__LOADED;
	cb = cb || Noop;

	if (c && c === true) {
	var fn = cw.getVPAIDAd;

	if (fn && typeof fn === "function") {
		VPAIDCreative = fn();

		if (CheckVPAIDInterface(VPAIDCreative)) {
		cb(false, VPAIDCreative);
		} else {
		cb("No valid VPAID", {});
		}
	} else {
		Log("error")("TOnlineMediplayer", "VPAIDUtils", "iframe has been fully loaded, but getVPAIDAd is not a fn, but this:", fn);
	}
	} else {
	setTimeout(function () {
		checkIfrLoaded(cw, cb);
	}, 200);
	}
};

function CreateIframe(url, currentAd, player, playerDataStore, opts) {
	var ifr = document.createElement("iframe");
	ifr.href = "about:blank";
	ifr.setAttribute("style", "height:1px;width:1px;border:0 none;position:absolute;top:-10px;left:-10px;");
	ifr.id = "VPAIDAdLoaderFrame" + Date.now();

	var onIframeWriteCb = function onIframeWriteCb() {
	var cw = ifr.contentWindow;
	checkIfrLoaded(cw, function (VPAIDCreativeErr, VPAIDCreative) {
		if (VPAIDCreativeErr) {
		Log("error")("TOnlineMediaplayer", "VPAIDUtils", VPAIDCreativeErr, VPAIDCreative);
		return;
		}

		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID is", VPAIDCreative);
		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID currentAd", currentAd);
		var origVideoSrc = player.GetOriginalVideoSource();
		player.ShowAdIsPlaying("preroll");

		function _onfullscreenchange(evt) {
		Log()("TOnlineMediaplayer", "VPAIDUtils", "fullscreenchange", evt);
		VPAIDCreative.resizeAd(player.GetWidth(), player.GetHeight(), "normal");
		}

		function _onorientationchange(evt) {
		setTimeout(function () {
			VPAIDCreative.resizeAd(player.GetWidth(), player.GetHeight(), "normal");
		}, 500);
		}

		player.GetEl().addEventListener("fullscreenchange", _onfullscreenchange);
		window.addEventListener("orientationchange", _onorientationchange);

		function _cleanupListeners() {
		player.GetEl().removeEventListener("fullscreenchange", _onfullscreenchange);
		window.removeEventListener("orientationchange", _onorientationchange);
		}

		function onInit() {
		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID onInit");
		player.HideLoadingSpinner();
		player.HidePosterImage();
		VPAIDCreative.startAd();
		}

		function ResumeOrigVideo() {
		_cleanupListeners();

		var videoEl = player.GetVideoEl(); // it seems as if some vpaid spots restore the origVideoSrc by themselves

		if (videoEl.src !== origVideoSrc.src) {
			videoEl.src = origVideoSrc.src;
			player.Play();
		} else {
			// some of them even fire the play event again?!
			if (!player.IsPlaying()) {
			player.Play();
			}
		}

		player.HideAdIsPlaying("preroll"); // Generate a clean clickJackingOverlayEl

		player.CleanClickjackingOverlay();
		}

		function onVideoComplete() {
		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID onVideoComplete");
		ResumeOrigVideo();
		}

		function onAdSkipped() {
		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID Ad skipped");
		ResumeOrigVideo();
		}

		function onAdStop() {
		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID Ad stop");
		ResumeOrigVideo();
		}

		function onAdError(e) {
		Log("error")("TOnlineMediaplayer", "VPAIDUtils", "VPAID onAdError:", e);
		var errorCode = 405;
		playerDataStore.userEventListeners.adError.forEach(function (cb) {
			cb(errorCode, VASTErrorCodes[errorCode], e);
		});
		Log("error")("TOnlineMediaplayer", "VPAIDUtils", VASTErrorCodes[errorCode], e); //@TODO
		// Track AdError and kill all other AdTracking-Events

		ResumeOrigVideo();
		}

		VPAIDCreative.on = function (n, cb) {
		this.subscribe(cb, n);
		};

		VPAIDCreative.on("AdError", onAdError);
		VPAIDCreative.on("AdLoaded", onInit);
		VPAIDCreative.on("AdSkipped", onAdSkipped);
		VPAIDCreative.on("AdStopped", onAdStop);
		VPAIDCreative.on("AdVideoComplete", onVideoComplete);
		VPAIDCreative.on("AdClickThru", function (clickThruURL, _, clickThruPlayerHandles) {
		if (clickThruPlayerHandles) {
			window.open(clickThruURL);
		}

		opts.clickTrackings.forEach(function (trackingURL) {
			Log()("TOnlineMediplayer", "VPAIDUtils", "Event", "ClickThru ClickTracking", trackingURL);
			TrackingRequest(event.url);
		});
		});
		var adParamsTxt = "";
		var adParamsNode = currentAd.querySelector("AdParameters");

		if (adParamsNode) {
		adParamsTxt = adParamsNode.textContent;
		}

		Log()("TOnlineMediaplayer", "VPAIDUtils", "VPAID adParams", adParamsTxt);
		VPAIDCreative.initAd(player.GetWidth(), player.GetHeight(), "normal", -1, {
		AdParameters: adParamsTxt
		}, {
		slot: player.GetClickjackingOverlayEl(),
		videoSlot: player.GetVideoEl(),
		videoSlotCanAutoPlay: false
		});
	});
	};

	document.body.appendChild(ifr);
	var ifrDoc = GetIframeDocument(ifr);
	ifrDoc.write("<!DOCTYPE html+" + ">" + "<he" + "ad><ti" + "tle></ti" + "tle></he" + "ad><bo" + "dy><script src=\"" + url + "\"></scr" + "ipt>" + "<scr" + "ipt>__LOADED=true;" + "</scr" + "ipt></body></html>");
	onIframeWriteCb();
}

function LoadAdUnit(url, currentAd, player, playerDataStore, opts) {
	Log("error")("TOnlineMediaplayer", "VPAIDUtils", "Loading VPAID URL:", url);
	CreateIframe(url, currentAd, player, playerDataStore, opts);
}

var VPAIDUtils = {
	LoadAdUnit: LoadAdUnit
};

function UUID() {
	function randomDigit() {
	if (crypto && crypto.getRandomValues) {
		var rands = new Uint8Array(1);
		crypto.getRandomValues(rands);
		return (rands[0] % 16).toString(16);
	} else {
		return (Math.random() * 16 | 0).toString(16);
	}
	}

	var crypto = window.crypto || window.msCrypto;
	return "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, randomDigit);
}

var AddHelperFuncsToEl = function AddHelperFuncsToEl(el) {
	el.html = function (h) {
	el.innerHTML = h;
	return el;
	};

	el.append = function (_contents) {
	if (_contents.length) {
		_contents.forEach(function (contentEl) {
		el.appendChild(contentEl);
		});
	} else {
		el.appendChild(_contents);
	}

	return el;
	};

	el.on = function (t, cb, p) {
	p = p || false;

	if (t.indexOf(",") !== -1) {
		t.split(",").forEach(function (t1) {
		el.addEventListener(t1, cb, p);
		});
	} else {
		el.addEventListener(t, cb, p);
	}

	return el;
	};

	el.off = function (t, cb, p) {
	el.removeEventListener(t, cb, p);
	return el;
	};
};

var CreateEl = function CreateEl(type, attrs, contents) {
	attrs = attrs || null;
	contents = contents || null;
	var el = document.createElement(type);
	AddHelperFuncsToEl(el);

	if (attrs && attrs.length) {
	attrs.forEach(function (attr) {
		el.setAttribute(attr[0], attr[1]);
	});
	}

	if (contents) {
	switch (_typeof(contents)) {
		case "object":
		if (contents.length) {
			contents.forEach(function (contentEl) {
			el.appendChild(contentEl);
			});
		} else {
			el.appendChild(contents);
		}

		break;

		case "string":
		if (contents.length) {
			el.innerHTML = contents;
		}

		break;
	}
	}

	return el;
};

function StringUtils(str) {
	str = new String(str);

	function startsWith(needle) {
	return str.indexOf(needle) === 0;
	}

	return {
	startsWith: startsWith
	};
}

function AjaxRequest(url, cb, opts) {
	url = url || false;
	cb = cb || false;
	opts = opts || {};
	opts.followRedirects = _typeof(opts.followRedirects) === undefined ? true : opts.followRedirects;
	if (url === false) return;
	var req = new XMLHttpRequest();
	req.withCredentials = opts.withCredentials || false;
	req.requestContentType = opts.requestContentType || null;

	function onReadyStateChangeCallback() {
	if (req.readyState !== 4) return;
	var strUtils = StringUtils(req.status);

	if (strUtils.startsWith(30)) {
		return new AjaxRequest(url, cb, opts);
	}

	if (req.status !== 200) return cb(req, {});
	cb(false, req);
	}

	function run() {
	if (req) {
		req.open("GET", url, true);
		req.responseType = opts.responseType || "";

		if (cb) {
		req.onerror = function (e) {
			cb(e, {});
		};

		req.onreadystatechange = onReadyStateChangeCallback;
		}

		req.send();
	}
	}

	run();
}

function ErrorTrackingRequest(url, errorCode, cb, opts) {
	url = url || false;
	cb = cb || Noop;
	opts = opts || {};
	opts.parent = opts.parent || document.body;
	if (url === false) return;
	var img = document.createElement("img");
	url = url.replace("[ERRORCODE]", errorCode);
	img.src = url;

	function cleanup() {
	img.parentNode.removeChild(img);
	}

	function onLoadCallback() {
	cb(false, img);
	cleanup();
	}

	function onErrorCallback() {
	cb("Error", img);
	cleanup();
	}

	function onAbortCallback() {
	cb("Abort", img);
	cleanup();
	}

	function run() {
	if (img) {
		if (cb) {
		img.onerror = onErrorCallback;
		img.onabort = onAbortCallback;
		img.onload = onLoadCallback;
		}

		opts.parent.appendChild(img);
	}
	}

	run();
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} input
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
function clamp() {
	var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 255;
	return Math.min(Math.max(input, min), max);
}
var numbers = {
	clamp: clamp
};

function GetNodeValue(node) {
	return node.nodeValue || node.textContent;
}

var IsInOMIDWhitelist = function IsInOMIDWhitelist(adVerification) {
	var retval = false;
	var vendorUrl = "";
	var len;
	var i = 0;
	var vendorKey = adVerification.getAttribute("vendor");
	var jsres = adVerification.querySelector("JavaScriptResource");
	if (jsres && GetNodeValue(jsres)) vendorUrl = GetNodeValue(jsres);else return retval;
	if (typeof OMIDWhiteList[vendorKey] === "undefined") return retval;
	len = OMIDWhiteList[vendorKey].length;

	for (; i < len; i++) {
	if (vendorUrl.indexOf(OMIDWhiteList[vendorKey][i]) === 0) {
		retval = true;
		break;
	}
	}

	return retval;
};

function ClosestInArray(array, num) {
	var i = 0;
	var minDiff = 1000;
	var ans;

	for (i in array) {
	var m = Math.abs(num - array[i]);

	if (m < minDiff) {
		minDiff = m;
		ans = array[i];
	}
	}

	return ans;
}

var ParserUtils = {
	ReplaceMacrosIn: {
	VASTURL: function VASTURL(str) {
		if (str.indexOf("[TIMESTAMP]") !== -1) {
		var unix_timestamp = Date.now(); // replace macro for unix timestamp

		str = str.replace("[TIMESTAMP]", unix_timestamp);
		}

		if (str.indexOf("%%CACHEBUSTER%%") !== -1) {
		var random = numbers.clamp(0, 0, 9999999999); // replace macro for unix timestamp

		str = str.replace("%%CACHEBUSTER%%", random);
		}

		return str;
	}
	}
}; // function ArrayMerge(arrays) {
// 	const mergedArray = [];
// 	arrays.forEach(arr => {
// 		mergedArray.concat(arr);
// 	});
// 	return mergedArray;
// }
// function GetXMLNodeAttributes(xmlNode, filter) {
// 	let i = 0;
// 	let attr = null;
// 	filter = filter || [];
// 	const attrs = xmlNode.attributes;
// 	const len = attrs.length;
// 	const retval = [];
// 	for (; i < len; i++) {
// 		attr = attrs[i];
// 		if (filter.indexOf(attr.name) !== -1) continue;
// 		retval.push({ name: attr.name, value: attr.value });
// 	}
// 	return retval;
// }

function OnStartEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

function OnPauseEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

function OnResumeEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

function OnCompleteEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

function OnFirstQuartileEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

function OnThirdQuartileEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

function OnMidpointEvent(event) {
	Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
	TrackingRequest(event.url);
}

var triggerUEL = function triggerUEL(player, uel, n, evt) {
	evt = evt || null;

	if (uel[n] && uel[n].length) {
	uel[n].forEach(function (cb) {
		cb(evt, player, n);
	});
	}
};

function AttachUserEventsToPlayer(player, playerDataStore) {
	var events = [// {
	// 	name: "progress"
	// },
	{
	name: "start"
	}, {
	name: "pause"
	}, {
	name: "resume"
	}, {
	name: "firstQuartile"
	}, {
	name: "midpoint"
	}, {
	name: "thirdQuartile"
	}, {
	name: "complete"
	}, {
	name: "mute"
	}, {
	name: "unmute"
	}, {
	name: "fullscreen"
	}, {
	name: "exitFullscreen"
	}];
	var videoEl = player.GetVideoEl();
	var _timeupdateEvents = [];
	var _cleanup = [];
	var uel = playerDataStore.userEventListeners; // user events

	events.forEach(function (event) {
	var _OnStartEvent = function _OnStartEvent() {
		if (!player.IsPlayingAd()) return;
		if (videoEl.currentTime > 1) return;
		triggerUEL(player, uel, "adStart");
	};

	var _OnPauseEvent = function _OnPauseEvent() {
		if (videoEl.currentTime >= videoEl.duration || videoEl.currentTime <= 0) return;
		triggerUEL(player, uel, "adPause");
	};

	var _OnResumeEvent = function _OnResumeEvent() {
		if (videoEl.currentTime < 1) return;
		triggerUEL(player, uel, "adResume");
	};

	var _OnCompleteEvent = function _OnCompleteEvent() {
		triggerUEL(player, uel, "adComplete");
	};

	var _OnFirstQuartileEvent = function _OnFirstQuartileEvent() {
		triggerUEL(player, uel, "adFirstQuartile");
	};

	var _OnMidpointEvent = function _OnMidpointEvent() {
		triggerUEL(player, uel, "adMidpoint");
	};

	var _OnThirdQuartileEvent = function _OnThirdQuartileEvent() {
		triggerUEL(player, uel, "adThirdQuartile");
	};

	switch (event.name) {
		case "complete":
		_cleanup.push({
			event: "ended",
			func: _OnCompleteEvent
		});

		videoEl.addEventListener("ended", _OnCompleteEvent);
		break;

		case "midpoint":
		_timeupdateEvents.push({
			callback: _OnMidpointEvent,
			time: function time() {
			return videoEl.duration / 2;
			}
		});

		break;

		case "firstQuartile":
		_timeupdateEvents.push({
			callback: _OnFirstQuartileEvent,
			time: function time() {
			return videoEl.duration / 4;
			}
		});

		break;

		case "thirdQuartile":
		_timeupdateEvents.push({
			callback: _OnThirdQuartileEvent,
			time: function time() {
			return videoEl.duration / 4 * 3;
			}
		});

		break;

		case "progress":
		// the offset is based on a percentage value
		// so we need to calculate the value now
		if (event.offset.indexOf("%") !== -1) {
			_timeupdateEvents.push({
			callback: function callback() {
				Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
				TrackingRequest(event.url);
			},
			time: function time() {
				return videoEl.duration / 100 * parseInt(event.offset, 10);
			}
			});
		}

		break;

		case "start":
		_cleanup.push({
			event: "play",
			func: _OnStartEvent
		});

		videoEl.addEventListener("play", _OnStartEvent);
		break;

		case "pause":
		_cleanup.push({
			event: "pause",
			func: _OnPauseEvent
		});

		videoEl.addEventListener("pause", _OnPauseEvent);
		break;

		case "resume":
		_cleanup.push({
			event: "play",
			func: _OnResumeEvent
		});

		videoEl.addEventListener("play", _OnResumeEvent);
		break;
	}
	});

	var _timeupdateEventsTicker = function _timeupdateEventsTicker() {
	if (_timeupdateEvents.length > 0) {
		var tue = null;
		var i = _timeupdateEvents.length;

		while (i--) {
		tue = _timeupdateEvents[i];

		if (videoEl.currentTime >= tue.time()) {
			tue.callback();

			_timeupdateEvents.splice(i, 1);
		}
		}
	}
	};

	videoEl.addEventListener("timeupdate", _timeupdateEventsTicker);

	var _allClean = function _allClean() {
	videoEl.removeEventListener("timeupdate", _timeupdateEventsTicker);

	_cleanup.forEach(function (clean) {
		videoEl.removeEventListener(clean.event, clean.func);
	});

	videoEl.removeEventListener("ended", _allClean);
	};

	videoEl.addEventListener("ended", _allClean);
}

function AttachTrackingEventsToPlayer(events, player) {
	var videoEl = player.GetVideoEl();
	var _timeupdateEvents = [];
	var _cleanup = []; // for each tracking event

	events.forEach(function (event) {
	// create a intermediate functions, so we can remove the event listeners right after firing it.
	var _OnStartEvent = function _OnStartEvent() {
		videoEl.removeEventListener("play", _OnStartEvent);
		OnStartEvent(event);
	};

	var _OnPauseEvent = function _OnPauseEvent() {
		if (videoEl.currentTime >= videoEl.duration || videoEl.currentTime <= 0) return;
		OnPauseEvent(event);
	};

	var _OnResumeEvent = function _OnResumeEvent() {
		if (videoEl.currentTime <= 0) return;
		OnResumeEvent(event);
	};

	var _OnCompleteEvent = function _OnCompleteEvent() {
		OnCompleteEvent(event);
	};

	var _OnFirstQuartileEvent = function _OnFirstQuartileEvent() {
		OnFirstQuartileEvent(event);
	};

	var _OnMidpointEvent = function _OnMidpointEvent() {
		OnMidpointEvent(event);
	};

	var _OnThirdQuartileEvent = function _OnThirdQuartileEvent() {
		OnThirdQuartileEvent(event);
	};

	switch (event.name) {
		case "complete":
		_cleanup.push({
			event: "ended",
			func: _OnCompleteEvent
		});

		videoEl.addEventListener("ended", _OnCompleteEvent);
		break;

		case "midpoint":
		_timeupdateEvents.push({
			callback: _OnMidpointEvent,
			time: function time() {
			return videoEl.duration / 2;
			}
		});

		break;

		case "firstQuartile":
		_timeupdateEvents.push({
			callback: _OnFirstQuartileEvent,
			time: function time() {
			return videoEl.duration / 4;
			}
		});

		break;

		case "thirdQuartile":
		_timeupdateEvents.push({
			callback: _OnThirdQuartileEvent,
			time: function time() {
			return videoEl.duration / 4 * 3;
			}
		});

		break;

		case "progress":
		// the offset is based on a percentage value
		// so we need to calculate the value now
		if (event.offset.indexOf("%") !== -1) {
			_timeupdateEvents.push({
			callback: function callback() {
				Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
				TrackingRequest(event.url);
			},
			time: function time() {
				return videoEl.duration / 100 * parseInt(event.offset, 10);
			}
			});
		}

		break;

		case "start":
		videoEl.addEventListener("play", _OnStartEvent);
		break;

		case "pause":
		_cleanup.push({
			event: "pause",
			func: _OnPauseEvent
		});

		videoEl.addEventListener("pause", _OnPauseEvent);
		break;

		case "resume":
		_cleanup.push({
			event: "play",
			func: _OnResumeEvent
		});

		videoEl.addEventListener("play", _OnResumeEvent);
		break;

		case "mute":
		videoEl.addEventListener("mute", function () {
			Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
			TrackingRequest(event.url);
		});
		break;

		case "unmute":
		videoEl.addEventListener("unmute", function () {
			Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
			TrackingRequest(event.url);
		});
		break;

		case "exitFullscreen":
		// @TODO implemment exit fullscreen event
		break;

		case "fullscreen":
		// @TODO fix fullscreen events
		document.addEventListener("webkitfullscreenchange", function () {
			var isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;

			if (event.name === "fullscreen" && isFullscreen) {
			TrackingRequest(event.url);
			Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
			}
		});
		break;
	}
	});

	var _timeupdateEventsTicker = function _timeupdateEventsTicker() {
	if (_timeupdateEvents.length > 0) {
		var tue = null;
		var i = _timeupdateEvents.length;

		while (i--) {
		tue = _timeupdateEvents[i];

		if (videoEl.currentTime >= tue.time()) {
			tue.callback();

			_timeupdateEvents.splice(i, 1);
		}
		}
	}
	};

	videoEl.addEventListener("timeupdate", _timeupdateEventsTicker);

	var _allClean = function _allClean() {
	videoEl.removeEventListener("timeupdate", _timeupdateEventsTicker);

	_cleanup.forEach(function (clean) {
		videoEl.removeEventListener(clean.event, clean.func);
	});

	videoEl.removeEventListener("ended", _allClean);
	};

	videoEl.addEventListener("ended", _allClean);
}

function GetTrackingEvents(trackingEventsNodes) {
	var events = [];
	var eventName;
	var tmpEvent;
	if (trackingEventsNodes.length === 0) return events;
	trackingEventsNodes.forEach(function (eventNode) {
	eventName = eventNode.getAttribute("event");
	tmpEvent = {
		name: eventName,
		url: GetNodeValue(eventNode)
	};

	if (eventName === "progress") {
		tmpEvent.offset = eventNode.getAttribute("offset");
	}

	events.push(tmpEvent);
	});
	return events;
}

function GetUnixTimestamp() {
	return Math.floor(Date.now());
}

function VASTParser(opts) {
	var _adSessionID = UUID();

	opts = opts || {};
	opts.videoEl = opts.videoEl || null;
	opts.onParsingDoneCallback = opts.onParsingDoneCallback || Noop;
	opts.timeout = opts.timeout || 5000;
	opts.maxRedirects = opts.maxRedirects || 10;
	var __dataStore = opts;
	var publicMethods = {};
	__dataStore._startTime = GetUnixTimestamp();
	__dataStore._maxEndTime = __dataStore._startTime + opts.timeout;
	var collectedItems = {
	errors: [],
	impressions: [],
	creatives: []
	};
	var trackingEvents = [];
	var ClickTrackings = [];
	var mediaFiles = [];

	publicMethods.SetOnParsingDoneCallback = function (cb) {
	opts.onParsingDoneCallback = cb;
	};

	publicMethods.Reset = function () {
	trackingEvents = [];
	ClickTrackings = [];
	mediaFiles = [];
	collectedItems = {
		errors: [],
		impressions: [],
		creatives: []
	};
	};

	var GetLinearAd = function GetLinearAd(linearNode) {
	if (!linearNode) return null;

	var GetMediaFiles = function GetMediaFiles() {
		var mediaFilesNodes = linearNode.querySelectorAll("MediaFiles MediaFile");
		if (!mediaFilesNodes) return mediaFiles;
		mediaFilesNodes.forEach(function (mediaFileNode) {
		mediaFiles.push({
			src: mediaFileNode.textContent || mediaFileNode.src || "",
			delivery: mediaFileNode.getAttribute("delivery") || null,
			type: mediaFileNode.getAttribute("type") || null,
			width: mediaFileNode.getAttribute("width") || null,
			bitrate: mediaFileNode.getAttribute("bitrate") || null,
			height: mediaFileNode.getAttribute("height") || null
		});
		});
		return mediaFiles;
	};

	var GetMediaFileClosestTo = function GetMediaFileClosestTo(k, value) {
		Log()("TOnlineMediplayer", "VASTParser", "Get closest media file based on " + k + ":", value);
		var mediaFile = null; // try to guess the best fit

		var i = 0;
		var len = mediaFiles.length;
		var possibleValues = [];
		var mf; // gather all available heights

		for (i = 0; i < len; i++) {
		mf = mediaFiles[i];

		if (mf.type.indexOf("mp4") !== -1) {
			possibleValues.push(parseInt(mf[k], 10));
		}
		}

		var closestValue = null;
		closestValue = ClosestInArray(possibleValues, value);
		mediaFiles.forEach(function (mf) {
		// VPAID, exit early
		if (mf.type === "application/javascript") {
			mediaFile = mf;
			return false;
		}

		if (mf.type.indexOf("mp4") !== -1) {
			if (parseInt(mf[k], 10) === closestValue) {
			mediaFile = mf;
			return false;
			}
		}
		});
		Log()("TOnlineMediplayer", "VASTParser", "Selected media file:", mediaFile);
		return mediaFile;
	};

	return {
		GetMediaFiles: GetMediaFiles,
		GetMediaFileClosestTo: GetMediaFileClosestTo
	};
	};

	publicMethods.GetMediaFiles = function () {
	return mediaFiles;
	};

	publicMethods.Parse = function (xml, url) {
	var errorCode;

	if (xml === null) {
		publicMethods.Reset();
		errorCode = 301; // Cache Error Events for HOMAD

		opts.playerDataStore.adErrorsCache.push([null, opts.player, "adError", opts.playerDataStore, {
		vastErrorCode: errorCode,
		vastErrorMessage: VASTErrorCodes[errorCode]
		}]);
		opts.playerDataStore.userEventListeners.adError.forEach(function (cb) {
		cb(null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode],
			rawErrorObject: {}
		});
		});
		collectedItems.errors.forEach(function (errUrl) {
		ErrorTrackingRequest(errUrl, 301);
		});
		return;
	} else {
		Log()("TOnlineMediplayer", "VASTParser", "VAST URL:", url);
		Log()("TOnlineMediplayer", "VASTParser", "VAST Document:", xml.cloneNode(true));
	}

	var doc = xml.documentElement;

	if (!doc) {
		errorCode = 303; // Cache Error Events for HOMAD

		opts.playerDataStore.adErrorsCache.push([null, opts.player, "adError", opts.playerDataStore, {
		vastErrorCode: errorCode,
		vastErrorMessage: VASTErrorCodes[errorCode]
		}]); // trigger user events

		opts.playerDataStore.userEventListeners.adError.forEach(function (cb) {
		cb(null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
		});
		});
		collectedItems.errors.forEach(function (errUrl) {
		ErrorTrackingRequest(errUrl, 303);
		});
		publicMethods.Reset();
		Log("error")("TOnlineMediplayer", "VASTParser", "No root element found");
		return;
	}

	var wrapper = doc.querySelector("Wrapper");
	var adVerifications = doc.querySelectorAll("AdVerifications Verification");
	var errpixels = doc.querySelectorAll("Error");

	if (errpixels && errpixels.length) {
		errpixels.forEach(function (errpixel) {
		collectedItems.errors.push(errpixel.textContent);
		});
	}

	var impression = doc.querySelectorAll("Impression");
	var impressions = doc.querySelectorAll("Impressions"); // are there any impression(s) tracking pixels?

	if (impression && impression.length) {
		impression.forEach(function (imp) {
		if (imp.textContent && imp.textContent.length) {
			collectedItems.impressions.push(imp.textContent);
		}
		});
	}

	if (impressions && impressions.length) {
		impressions.forEach(function (imp) {
		if (imp.textContent && imp.textContent.length) {
			collectedItems.impressions.push(imp.textContent);
		}
		});
	}

	var _ClickTrackings = doc.querySelectorAll("ClickTracking");

	if (_ClickTrackings) {
		_ClickTrackings.forEach(function (_ClickTracking) {
		ClickTrackings.push(GetNodeValue(_ClickTracking));
		});
	}

	var trackingEventsNodes = doc.querySelectorAll("TrackingEvents Tracking");
	trackingEvents.push(GetTrackingEvents(trackingEventsNodes));
	Log()("TOnlineMediplayer", "VASTParser", "Tracking events:", trackingEvents); // clean up ad verifications based on a whitelist

	if (adVerifications.length > 0) {
		var _cleanAdverifications = [];
		adVerifications.forEach(function (adVerification) {
		Log()("TOnlineMediplayer", "VASTParser", "adVerification:", adVerification);

		if (IsInOMIDWhitelist(adVerification) === true) {
			_cleanAdverifications.push(adVerification);
		} else {
			Log("error")("TOnlineMediplayer", "VASTParser", "OMID", "Is not in whitelist", adVerification);
		}
		});
		adVerifications = _cleanAdverifications;
	}

	if (adVerifications.length > 0) {
		new OMIDUtils({
		adSessionID: _adSessionID,
		verificationResources: adVerifications,
		videoEl: opts.videoEl,
		player: opts.player,
		playerDataStore: opts.playerDataStore
		});
	}

	if (!wrapper) {
		Log()("TOnlineMediplayer", "VASTParser", "Finish", "No additional wrapper found!");
		Log()("TOnlineMediplayer", "VASTParser", "ClickTrackings", ClickTrackings);
		var creatives = doc.querySelectorAll("Creatives Creative");

		if (creatives.length === 0) {
		errorCode = 303; // Cache Error Events for HOMAD

		opts.playerDataStore.adErrorsCache.push([null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
		}]); // trigger user events

		opts.playerDataStore.userEventListeners.adError.forEach(function (cb) {
			cb(null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
			});
		});
		Log("error")("TOnlineMediplayer", "VASTParser", "Nothing to show/display.");
		collectedItems.errors.forEach(function (errUrl) {
			ErrorTrackingRequest(errUrl, 303);
		});
		Log()("TOnlineMediplayer", "VASTParser", "Collected Items:", collectedItems);
		publicMethods.Reset();
		opts.player.HideAdIsPlaying();
		opts.onParsingDoneCallback();
		return;
		}

		var linearAd = null;
		var linearNode = null;
		var clickJackingOverlayEl = opts.player.GetClickjackingOverlayEl();
		var ClickThroughCallbackFunc = Noop;
		creatives.forEach(function (creative) {
		if (!creative.querySelector("Linear")) return;
		linearNode = creative.querySelector("Linear");

		var _ClickThrough = linearNode.querySelector("ClickThrough");
		console.log("ClickThrough");
		console.log(_ClickThrough);

		if (_ClickThrough) {
			ClickThroughCallbackFunc = function ClickThroughCallbackFunc(evt) {
			if (evt.target.classList.contains("big-play-icon")) return;

			if (IsTouchDevice() && !evt.target.classList.contains("touchlink")) {
				return;
			}

			try {
				triggerUEL(opts.player, opts.playerDataStore.userEventListeners, "adClick");
			} catch (userEventListenersAdClickException) {
				Log("Error")("TOnlineMediplayer", "VASTParser", "UserEventListenersAdClickException:", userEventListenersAdClickException);
			}

			ClickTrackings.forEach(function (ct) {
				Log()("TOnlineMediplayer", "VASTParser", "ClickTracking", ct);
				TrackingRequest(ct);
			});
			window.open(GetNodeValue(_ClickThrough));
			};

			clickJackingOverlayEl.addEventListener("click", ClickThroughCallbackFunc);
		}

		linearAd = GetLinearAd(linearNode);
		
		Log()("TOnlineMediplayer", "VASTParser", "Possible media files:", linearAd.GetMediaFiles());
		});

		if (linearAd) {
			console.log("Player:");
			console.log(opts.player);
			console.log(opts.playerDataStore);
			
		AttachUserEventsToPlayer(opts.player, opts.playerDataStore);
		trackingEvents.forEach(function (te) {
			AttachTrackingEventsToPlayer(te, opts.player, opts.playerDataStore);
		});
		triggerUEL(opts.player, opts.playerDataStore.userEventListeners, "adLoaded");
		var videoEl = opts.player.GetVideoEl();
		var origVideoSrc = opts.player.GetOriginalVideoSource();
		var mediaFile = linearAd.GetMediaFileClosestTo("height", opts.player.GetHeight()); // VPAID

		if (mediaFile.type === "application/javascript") {
			Log()("TOnlineMediplayer", "VASTParser", "Linear Node:", linearNode);
			VPAIDUtils.LoadAdUnit(mediaFile.src, linearNode, opts.player, opts.playerDataStore, {
			clickTrackings: ClickTrackings
			}); // fire impression tracking pixels

			collectedItems.impressions.forEach(function (imp) {
			Log()("TOnlineMediplayer", "VASTParser", "Impression fired", imp);
			TrackingRequest(imp);
			});
			Log()("TOnlineMediplayer", "VASTParser", "Collected Items:", collectedItems);
			return;
		} else {
			videoEl.src = mediaFile.src;
		}

		opts.player.ShowAdIsPlaying("preroll");
		var touchDeviceClickTarget = CreateEl("div");

		if (IsTouchDevice()) {
			touchDeviceClickTarget = CreateEl("div", [["data-clicktarget", "touchlink"], ["class", "touchlink-container"]]).append(CreateEl("span", [["class", "touchlink"]]).html("Weitere Informationen"));
		}

		clickJackingOverlayEl.appendChild(touchDeviceClickTarget);

		var _intermediateOnEndedCb = function _intermediateOnEndedCb() {
			videoEl.removeEventListener("ended", _intermediateOnEndedCb);
			videoEl.pause();
			opts.player.HideAdIsPlaying("preroll");
			videoEl.src = origVideoSrc.src;
			videoEl.type = origVideoSrc.type;
			clickJackingOverlayEl.removeEventListener("click", ClickThroughCallbackFunc);
			touchDeviceClickTarget.parentNode.removeChild(touchDeviceClickTarget);
			publicMethods.Reset(); // foobar

			videoEl.play();
		};

		videoEl.addEventListener("ended", _intermediateOnEndedCb); // fire impression tracking pixels

		collectedItems.impressions.forEach(function (imp) {
			Log()("TOnlineMediplayer", "VASTParser", "Impression fired", imp);
			TrackingRequest(imp);
		});
		Log()("TOnlineMediplayer", "VASTParser", "Collected Items:", collectedItems);
		opts.onParsingDoneCallback();
		}

		return;
	}

	var vastTagUri = wrapper.querySelector("VASTAdTagURI");

	if (vastTagUri) {
		publicMethods.Read(vastTagUri.textContent);
	}
	};

	var handleAjaxRequestErrors = function handleAjaxRequestErrors(err) {
	opts.player.HideAdIsPlaying();
	Log("error")("TOnlineMediplayer", "VASTParser", "err", err.status); // can be e.g. 404

	var errorCode;

	switch (err.status) {
		case 0:
		case 4:
		publicMethods.Reset();
		errorCode = 301; // Cache Error Events for HOMAD

		opts.playerDataStore.adErrorsCache.push([null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
		}]);
		opts.playerDataStore.userEventListeners.adError.forEach(function (cb) {
			cb(null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode],
			rawErrorObject: err
			});
		});
		collectedItems.errors.forEach(function (errUrl) {
			ErrorTrackingRequest(errUrl, 301);
		});
		Log("error")("TOnlineMediplayer", "VASTParser", "VAST-Error", VASTErrorCodes[errorCode], err);
		break;

		default:
		publicMethods.Reset();
		Log("error")("TOnlineMediplayer", "VASTParser", "VAST-Error", VASTErrorCodes[900], err);
		break;
	}
	};

	publicMethods.Read = function (url) {
	var errorCode;
	__dataStore.maxRedirects--;
	
	console.log(__dataStore.maxRedirects--);

	if (__dataStore.maxRedirects === -1) {
		publicMethods.Reset();
		errorCode = 302;
		collectedItems.errors.forEach(function (errUrl) {
		ErrorTrackingRequest(errUrl, errorCode);
		}); // trigger user event listeners

		if (opts.playerDataStore.userEventListeners.adError.length) {
		opts.playerDataStore.userEventListeners.adError.forEach(function (cb) {
			cb(null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
			});
		});

		if (opts.player.IsPlaying() === false) {
			opts.player.Play();
		}
		} else {
		opts.player.Play();
		}

		Log("error")("TOnlineMediplayer", "VASTParser", "VAST-Error", VASTErrorCodes[errorCode]);
		return;
	}

	url = ParserUtils.ReplaceMacrosIn.VASTURL(url);

	var onVideoErrorCallback = function onVideoErrorCallback() {
		publicMethods.Reset();
		opts.videoEl.removeEventListener("error", onVideoErrorCallback);
		errorCode = 200; // Cache Error Events for HOMAD

		opts.playerDataStore.adErrorsCache.push([null, opts.player, "adError", opts.playerDataStore, {
		vastErrorCode: errorCode,
		vastErrorMessage: VASTErrorCodes[errorCode]
		}]); // trigger user event listeners

		if (opts.playerDataStore.userEventListeners.adError.length) {
		opts.player.Play();
		opts.playerDataStore.userEventListeners.adError.forEach(function (cb) {
			cb(null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
			});
		});
		} else {
		opts.player.Play();
		}

		Log("error")("TOnlineMediplayer", "VASTParser", "VAST-Error", VASTErrorCodes[errorCode]);
	};

	opts.videoEl.addEventListener("error", onVideoErrorCallback);
	new AjaxRequest(url, function (err, res) {
		if (err) {
		handleAjaxRequestErrors(err);
		opts.onParsingDoneCallback();
		return;
		}

		new publicMethods.Parse(res.responseXML, url);
	}, {
		requestContentType: "document" // withCredentials: true

	});
	};

	console.log(publicMethods);

	return publicMethods;
}

var StringPad = function StringPad(str) {
	str = str.toString();

	var Start = function Start(maxLength, fillString) {
	if (str.length >= maxLength) return str;
	fillString = fillString.toString();
	var i = maxLength - 1;

	while (i--) {
		str = fillString + str;
	}

	return str;
	};

	var End = function End(maxLength, fillString) {
	if (str.length >= maxLength) return str;
	fillString = fillString.toString();
	var i = maxLength - 1;

	while (i--) {
		str = str + fillString;
	}

	return str;
	};

	return {
	Start: Start,
	End: End
	};
};

var copyToClipboard = function copyToClipboard(string) {
	var shadow = document.createElement("input");
	shadow.type = "text";
	shadow.style.height = "1px";
	shadow.style.width = "1px";
	shadow.style.top = "-2px";
	shadow.style.left = "-2px";
	shadow.style.border = "0 none";
	shadow.value = string;
	document.body.appendChild(shadow);
	shadow.select();
	document.execCommand("copy");
	document.body.removeChild(shadow);
};

var DebugInfos = function DebugInfos(opts) {
	opts = opts || {};

	var GetDebugInfoAsJSONString = function GetDebugInfoAsJSONString() {
	var key, key2;
	var playerAttributes = [];
	var playerEl = opts.player.GetEl();
	opts.player.GetEl().attributes.forEach;

	for (var i = 0; i < playerEl.attributes.length; i++) {
		playerAttributes.push({
		name: playerEl.attributes[i].nodeName,
		value: playerEl.attributes[i].nodeValue
		});
	}

	var debugInfo = {
		playerAttributes: playerAttributes,
		jQueryVersion: window.jQuery ? window.jQuery.fn.jquery : "not available",
		referrer: document.referrer,
		location: window.location,
		localStorage: window.localStorage ? "yes" : "no",
		cookies: navigator.cookieEnabled ? "yes" : "no",
		screen: {},
		navigator: {}
	};

	for (key in window.navigator) {
		if (key === "connection") {
		debugInfo.navigator[key] = {}; // eslint-disable-next-line

		for (key2 in window.navigator[key]) {
			debugInfo.navigator[key][key2] = window.navigator[key][key2];
		}
		} else {
		debugInfo.navigator[key] = window.navigator[key];
		}
	}

	for (key in window.screen) {
		if (key === "orientation") {
		debugInfo.screen[key] = {}; // eslint-disable-next-line

		for (key2 in window.screen[key]) {
			debugInfo.screen[key][key2] = window.screen[key][key2];
		}
		} else {
		debugInfo.screen[key] = window.screen[key];
		}
	}

	return JSON.stringify(debugInfo);
	};

	this.CopyToClipboard = function () {
	copyToClipboard(GetDebugInfoAsJSONString());
	};

	return this;
};

var optionsHTML = "<ul>\n\t<li>\n\t\t<button class=\"main-item debuginfo\" title=\"\">\n\t\t\t<span class=\"title\">Debuginfos kopieren</span>\n\t\t\t<span class=\"spacer\"></span>\n\t\t\t<span class=\"value\"></span>\n\t\t</button>\n\t</li>\n\t<li>\n\t\t<button class=\"main-item speed\" title=\"\">\n\t\t\t<span class=\"prev-arrow hidden\"></span>\n\t\t\t<span class=\"title\">Speed</span>\n\t\t\t<span class=\"spacer\"></span>\n\t\t\t<span class=\"value\">1x</span>\n\t\t</button>\n\t\t<ul class=\"sub-menu options-speed-selectable-items hidden\">\n\t\t\t<li>\n\t\t\t\t<button data-value=\"0.5\" class=\"sub-item\">\n\t\t\t\t\t<span class=\"spacer\"></span>\n\t\t\t\t\t<span class=\"value\">0.5x</span>\n\t\t\t\t</button>\n\t\t\t</li>\n\t\t\t<li>\n\t\t\t\t<button data-value=\"1\" class=\"sub-item selected\">\n\t\t\t\t\t<span class=\"spacer\"></span>\n\t\t\t\t\t<span class=\"value\">1x</span>\n\t\t\t\t</button>\n\t\t\t</li>\n\t\t\t<li>\n\t\t\t\t<button data-value=\"1.5\" class=\"sub-item\">\n\t\t\t\t\t<span class=\"spacer\"></span>\n\t\t\t\t\t<span class=\"value\">1.5x</span>\n\t\t\t\t</button>\n\t\t\t</li>\n\t\t\t<li>\n\t\t\t\t<button data-value=\"2\" class=\"sub-item\">\n\t\t\t\t\t<span class=\"spacer\"></span>\n\t\t\t\t\t<span class=\"value\">2x</span>\n\t\t\t\t</button>\n\t\t\t</li>\n\t\t</ul>\n\t</li>\n\t<li>\n\t\t<button class=\"main-item quality\">\n\t\t\t<span class=\"prev-arrow hidden\"></span>\n\t\t\t<span class=\"title\">Quality</span>\n\t\t\t<span class=\"spacer\"></span>\n\t\t\t<span class=\"value\">240p</span>\n\t\t</button>\n\t\t<ul class=\"sub-menu options-quality-selectable-items hidden\"></ul>\n\t</li>\n</ul>\n";

var UIOptionsBox = function UIOptionsBox(opts) {
	var _this = this;

	var self = this;

	var getData = function getData(el, k) {
	return el.getAttribute("data-" + k);
	};

	var player = opts.player;
	var box = CreateEl("div", [["class", "ui-options-box hidden"]]);
	var DebugInfo = new DebugInfos({
	player: opts.player
	});

	var _Align = function _Align() {
	var bottomBarHeight = player.GetControlsEl().offsetHeight;
	var maxHeight = player.GetHeight() - bottomBarHeight;
	box.style.bottom = bottomBarHeight + "px";
	box.style.maxHeight = maxHeight + "px";
	};

	box.innerHTML = optionsHTML;

	var toggleQuality = function toggleQuality() {
	if (player.IsPlayingAd()) return;

	var _self = this;

	var qualityList = box.querySelector(".options-quality-selectable-items");

	var onClickHandler = function onClickHandler() {
		var currTime = player.GetCurrentTimeFull();
		qualityList.querySelectorAll("button.sub-item").forEach(function (itemButton) {
		itemButton.classList.remove("selected");
		});
		this.classList.add("selected");
		var newSource = player.GetOriginalVideoSources()[getData(this, "idx")];
		var currentSource = player.GetOriginalVideoSource();

		if (newSource.src !== currentSource.src) {
		var videoEl = player.GetVideoEl();
		videoEl.classList.add("hidden");

		var playingCallbackFunc = function playingCallbackFunc() {
			videoEl.removeEventListener("playing", playingCallbackFunc);
			videoEl.classList.remove("hidden");
		};

		videoEl.addEventListener("playing", playingCallbackFunc);
		player.SetOriginalVideoSource(newSource);
		} // If not in admode, swap now.


		if (!player.IsPlayingAd()) {
		var continuePlaying = !player.IsPaused();
		player.Pause();
		player.SetVideoSource({
			src: newSource.src,
			type: newSource.type
		});

		var temp1cb = function temp1cb() {
			player.GetVideoEl().removeEventListener("loadeddata", temp1cb);
			player.GetVideoEl().currentTime = currTime;

			if (continuePlaying) {
			player.Play();
			}
		};

		if (currTime) {
			player.GetVideoEl().addEventListener("loadeddata", temp1cb);
			player.GetVideoEl().load();
		}
		} // set overview value


		_self.querySelector(".main-item .value").innerHTML = this.querySelector(".value").innerHTML;
		self.Hide();
	};

	qualityList.querySelectorAll(".sub-item").forEach(function (subItem) {
		subItem.onclick = onClickHandler;
	});
	this.parentNode.parentNode.querySelectorAll(".main-item").forEach(function (mainItem) {
		mainItem.classList.toggle("hidden");
	});

	_self.classList.toggle("hidden");

	_self.querySelector(".prev-arrow").classList.toggle("hidden");

	_self.querySelector(".value").classList.toggle("hidden");

	qualityList.classList.toggle("hidden");

	_Align();
	};

	var togglePlaybackSpeed = function togglePlaybackSpeed() {
	if (player.IsPlayingAd()) return;

	var _self = this;

	var speedList = box.querySelector(".options-speed-selectable-items");

	var onClickHandler = function onClickHandler() {
		speedList.querySelectorAll("button.sub-item").forEach(function (itemButton) {
		itemButton.classList.remove("selected");
		});
		this.classList.add("selected");
		player.SetDefaultPlaybackRate(getData(this, "value")); // set overview value

		_self.querySelector(".main-item .value").innerHTML = this.querySelector(".value").innerHTML;
		self.Hide();
	};

	speedList.querySelectorAll(".sub-item").forEach(function (subItem) {
		subItem.onclick = onClickHandler;
	});
	this.parentNode.parentNode.querySelectorAll(".main-item").forEach(function (mainItem) {
		mainItem.classList.toggle("hidden");
	});

	_self.classList.toggle("hidden");

	_self.querySelector(".prev-arrow").classList.toggle("hidden");

	_self.querySelector(".value").classList.toggle("hidden");

	speedList.classList.toggle("hidden");

	_Align();
	};

	var debugMainPoint = box.querySelector(".main-item.debuginfo");
	debugMainPoint.addEventListener("click", function () {
	_this.Hide();

	DebugInfo.CopyToClipboard();
	player.ShowMessage("Debuginfos wurden in die Zwischenablage kopiert", null, {
		timeout: 2000
	});
	});
	var speedMainPoint = box.querySelector(".main-item.speed");
	speedMainPoint.addEventListener("click", togglePlaybackSpeed);
	var qualityMainPoint = box.querySelector(".main-item.quality");
	qualityMainPoint.addEventListener("click", toggleQuality); // Fill videoSources options

	(function () {
	var videoSources = player.GetVideoEl().querySelectorAll("source");
	var qualityList = box.querySelector(".options-quality-selectable-items");
	videoSources.forEach(function (vs, idx) {
		var clsName = "sub-item";

		if (idx === 0) {
		clsName += " selected";
		box.querySelector(".main-item.quality .value").innerHTML = getData(vs, "label");
		}

		var _source = CreateEl("li", null, CreateEl("button", [["class", clsName], ["data-idx", idx], ["data-quality", getData(vs, "quality")]], [CreateEl("span", [["class", "title"]]), CreateEl("span", [["class", "spacer"]]), CreateEl("span", [["class", "value"]], getData(vs, "label"))]));

		if (idx === 0) {
		_source.classList.add("selected");
		}

		qualityList.appendChild(_source);
	});
	})();

	player.GetControlsEl().querySelector("button.settings").appendChild(box);

	this.ShowHomeMenu = function () {
	box.querySelectorAll(".main-item").forEach(function (mainItem) {
		mainItem.classList.remove("hidden");
		var prevArrow = mainItem.querySelector(".prev-arrow");
		if (prevArrow) prevArrow.classList.add("hidden");
		var val = mainItem.querySelector(".value");
		if (val) val.classList.remove("hidden");
	});
	box.querySelectorAll(".sub-menu").forEach(function (subMenu) {
		subMenu.classList.add("hidden");
	});
	};

	this.Hide = function () {
	box.classList.add("hidden");
	this.ShowHomeMenu();
	};

	this.Show = function () {
	box.classList.remove("hidden");

	_Align();
	};

	this.Toggle = function () {
	box.classList.toggle("hidden");

	_Align();
	};

	return this;
};

var AddHelperFuncsToEl$1 = function AddHelperFuncsToEl(el) {
	el.append = function (_contents) {
	if (_contents.length) {
		_contents.forEach(function (contentEl) {
		el.appendChild(contentEl);
		});
	} else {
		el.appendChild(_contents);
	}

	return el;
	};

	el.on = function (t, cb, p) {
	p = p || false;
	el.addEventListener(t, cb, p);
	return el;
	};

	el.off = function (t, cb, p) {
	el.removeEventListener(t, cb, p);
	return el;
	};
};

function SVGHelper(type, opts) {
	opts = opts || {};
	opts.svgAttributes = opts.svgAttributes || [];
	opts.svgAttributes.push(["role", "presentation"]);
	opts.svgAttributes.push(["focusable", "false"]);
	var namespace = "http://www.w3.org/2000/svg";
	var iconPrefix = "gmp";
	var iconPath = "#" + iconPrefix;
	var icon = document.createElementNS(namespace, "svg");
	opts.svgAttributes.forEach(function (attr) {
	icon.setAttribute(attr[0], attr[1]);
	});
	var use = document.createElementNS(namespace, "use");
	var path = iconPath + "-" + type; // Set `href` attributes
	// https://github.com/sampotts/plyr/issues/460
	// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:href

	if ("href" in use) {
	use.setAttributeNS("http://www.w3.org/1999/xlink", "href", path);
	}

	if (opts.useAttributes && opts.useAttributes.length) {
	opts.useAttributes.forEach(function (attr) {
		use.setAttribute(attr[0], attr[1]);
	});
	} // Always set the older attribute even though it's "deprecated" (it'll be around for ages)


	use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", path); // Add <use> to <svg>

	icon.appendChild(use);
	return icon;
}

function SyntheticEvent(eventName) {
	var event;

	if (typeof Event === "function") {
	event = new Event(eventName);
	} else {
	event = document.createEvent("Event");
	event.initEvent(eventName, true, true);
	}

	return event;
}

var TOnlineVideoplayer = function TOnlineVideoplayer(domNode) {
	var _this = this;

	if (domNode.getAttribute("data-tonline-mediaplayer-initialized") !== null) {
	Log("error")("Player already initialized", domNode);
	return false;
	}

	domNode.setAttribute("data-tonline-mediaplayer-initialized", "");
	domNode.classList.add("tonline-mediaplayer");

	var __self = this;

	var __dataStore = {
	el: domNode,
	videoEl: domNode.querySelector("video"),
	containerEl: domNode.querySelector(".containment"),
	optionBoxes: {},
	isFirstStart: true,
	contentVideoStarted: false,
	contentVideoEnded: false,
	contentVideoFirstQuartile: false,
	contentVideoMidpoint: false,
	contentVideoThirdQuartile: false,
	defaultPlaybackRate: 1,
	defaultPlaybackRateForAds: 1,
	playerControlsDisabled: false,
	adErrorsCache: [],
	userEventListeners: {
		play: [],
		pause: [],
		seekStart: [],
		seeking: [],
		seekEnd: [],
		ended: [],
		mute: [],
		unmute: [],
		volumechange: [],
		firstStart: [],
		replay: [],
		enterFullscreen: [],
		exitFullscreen: [],
		firstQuartile: [],
		midpoint: [],
		thirdQuartile: [],
		videoError: [],
		videoSourceError: [],
		adLoaded: [],
		adCall: [],
		adClick: [],
		adPause: [],
		adResume: [],
		adError: [],
		adStart: [],
		adFirstQuartile: [],
		adMidpoint: [],
		adThirdQuartile: [],
		adComplete: [],
		playerLoaded: [],
		contentVideoStart: [],
		contentVideoPause: [],
		contentVideoResume: [],
		contentVideoEnded: []
	},
	language: "en",
	translations: {},
	plugins: [],
	originalVideoSource: null,
	originalVideoSources: [],
	isPlayingAd: false,
	dragging: "",
	vastPrerollTag: domNode.getAttribute("data-vast-preroll-adtag")
	};

	var TriggerUEL = function TriggerUEL(name, evt, player, dataStore, additionalInfo) {
	var uels = dataStore.userEventListeners;
	if (typeof uels[name] === "undefined") return;
	uels[name].forEach(function (cb) {
		cb(evt, player, name, additionalInfo);
	});
	};

	this.GetAdErrorsCache = function () {
	return __dataStore.adErrorsCache;
	};

	this.ClearAdErrorsCache = function () {
	__dataStore.adErrorsCache = [];
	return __self;
	};

	this.GetPosterImage = function () {
	return __dataStore.el.querySelector(".posterimage img").src;
	};

	this.SetPosterImage = function (url) {
	__dataStore.el.querySelector(".posterimage img").src = url;
	return _this;
	};

	this.GetDuration = function () {
	return Math.floor(__dataStore.videoEl.duration);
	};

	this.GetDurationFull = function () {
	return __dataStore.videoEl.duration;
	};

	this.GetVolume = function () {
	return __dataStore.videoEl.volume;
	};

	this.SetVolume = function (vol) {
	__dataStore.videoEl.volume = vol;
	return this;
	};

	this.IsAdsEnabled = function () {
	if (__self.GetVASTPrerollTag()) {
		return true;
	} else {
		return false;
	}
	};

	this.IsAdsDisabled = function () {
	return !__self.IsAdsEnabled();
	};

	this.GetBuffered = function () {
	var buffered = __self.GetVideoEl().buffered;

	var i = buffered.length;
	var result = [];

	while (i--) {
		result.push({
		start: buffered.start(i),
		end: buffered.end(i)
		});
	}

	return result;
	};

	this.GetContainerEl = function () {
	return __dataStore.containerEl;
	};

	this.SetVASTPrerollTag = function (prt) {
	__dataStore.vastPrerollTag = prt;
	return this;
	};

	this.GetVASTPrerollTag = function () {
	return __dataStore.vastPrerollTag;
	};

	this.IsInLandscapeMode = function () {
	return window.innerWidth > window.innerHeight;
	};

	this.IsInPortraitMode = function () {
	return !__self.IsInLandscapeMode();
	};

	this.ConvertSecondsIntoPlayerDisplayFormat = function (s) {
	s = parseInt(s, 10);
	var minutes = Math.floor(s / 60);
	var seconds = s % 60;
	var paddedSeconds = StringPad(minutes).Start(2, 0);
	var paddedMinutes = StringPad(seconds).Start(2, 0);
	return paddedSeconds + ":" + paddedMinutes;
	};

	this.GetViewportDimensions = function () {
	return {
		width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	};
	};

	this.EnablePlugin = function (name, opts) {
	var plugin = window.TOnlineMediaplayerFramework.GetPlugin(name);

	if (!plugin) {
		return false;
	}

	return plugin(this, opts);
	};

	this.GetLanguage = function () {
	return __dataStore.language;
	};

	this.SetLanguage = function (l) {
	__dataStore.language = l;
	return this;
	};

	this.SetTranslation = function (k, v, language) {
	__dataStore.translations[language] = __dataStore.translations[language] || {};
	var translations = __dataStore.translations[language];
	translations[k] = v;
	return this;
	};

	this.GetTranslation = function (k) {
	var translations = __dataStore.translations;
	var lang = __dataStore.language;

	if (translations[lang] && translations[lang][k]) {
		return translations[lang][k];
	} else {
		return k;
	}
	};

	__dataStore.videoEl.querySelectorAll("source").forEach(function (vs, i) {
	var clone = vs.cloneNode(true);

	if (i === 0) {
		__dataStore.originalVideoSource = clone;
	}

	__dataStore.originalVideoSources.push(clone);
	});

	this.GetOriginalVideoSource = function () {
	return __dataStore.originalVideoSource;
	};

	this.SetOriginalVideoSource = function (source) {
	if (!source) {
		return this;
	}

	__dataStore.originalVideoSource = source;
	return this;
	};

	this.GetOriginalVideoSources = function () {
	return __dataStore.originalVideoSources;
	};

	this.SetOriginalVideoSources = function (sources) {
	if (!sources) {
		return this;
	}

	__dataStore.originalVideoSources = sources;
	return this;
	};

	this.GetVideoSource = function () {
	var videoEl = __dataStore.videoEl;
	var origSource = this.GetOriginalVideoSource();
	var src = videoEl.src && videoEl.src.length ? videoEl.src : origSource.src;
	var type = videoEl.type ? videoEl.type : origSource.type;
	return {
		src: src,
		type: type
	};
	};

	this.SetVideoSource = function (source) {
	__dataStore.videoEl.src = source.src;
	__dataStore.videoEl.type = source.type;
	return this;
	};

	this.GetCurrentTime = function () {
	return Math.floor(__dataStore.videoEl.currentTime);
	};

	this.GetCurrentTimeFull = function () {
	return __dataStore.videoEl.currentTime;
	};

	this.SetCurrentTime = function (t) {
	__dataStore.videoEl.currentTime = t;
	return this;
	};

	this.IsFirstStart = function () {
	return __dataStore.isFirstStart;
	};

	this.On = function (names, cb) {
	var _this2 = this;

	var ns;

	if (_typeof(names) === "object" && names.length) {
		ns = names;
	} else {
		ns = names.split(",");
	}

	ns.forEach(function (name) {
		name = name.trim();

		if (typeof __dataStore.userEventListeners[name] === "undefined") {
		Log("error")("TOnlineMediplayer", "Adding Event-Listener not allowed", name);
		return _this2;
		}

		if (typeof cb === "function") {
		__dataStore.userEventListeners[name].push(cb);
		} else if (_typeof(cb) === "object" && cb.length) {
		cb.forEach(function (func) {
			__dataStore.userEventListeners[name].push(func);
		});
		} else {
		Log("error")("TOnlineMediaplayer", "On() - argument neither func nor array", cb);
		}
	});
	return this;
	};

	this.Off = function (names, cb) {
	var _this3 = this;

	var ns;

	if (_typeof(names) === "object" && names.length) {
		ns = names;
	} else {
		ns = names.split(",");
	}

	ns.forEach(function (name) {
		name = name.trim();

		if (typeof __dataStore.userEventListeners[name] === "undefined") {
		Log("error")("TOnlineMediaplayer", "Removing Event-Listener not allowed", name);
		return _this3;
		}

		var rmFunc = function rmFunc(func) {
		var i = __dataStore.userEventListeners[name].length;
		var fn = null; // remove while iterating

		while (i--) {
			fn = __dataStore.userEventListeners[name][i];

			if (fn === func) {
			__dataStore.userEventListeners[name].splice(i, 1);

			break;
			}
		}
		};

		if (typeof cb === "function") {
		rmFunc(cb);
		} else if (_typeof(cb) === "object" && cb.length) {
		cb.forEach(function (func) {
			rmFunc(func);
		});
		} else {
		Log("error")("TOnlineMediaplayer", "On() - argument neither func nor array", cb);
		}
	});
	return this;
	};

	this.GetEventListenersByName = function (name) {
	return __dataStore.userEventListeners[name];
	};

	this.GetAllEventListeners = function () {
	return __dataStore.userEventListeners;
	};

	this.IsPlayingAd = function () {
	return __dataStore.isPlayingAd;
	};

	this.IsInFullScreenMode = function () {
	if (document.fullscreenElement && document.fullscreenElement.classList.contains("tonline-mediaplayer") || document.msFullscreenElement && document.msFullscreenElement.classList.contains("tonline-mediaplayer") || document.webkitFullscreenElement && document.webkitFullscreenElement.classList.contains("tonline-mediaplayer")) {
		return true;
	} else {
		return false;
	}
	};

	var RequestFullScreenMode = function RequestFullScreenMode(nodeEl) {
	nodeEl = nodeEl || __dataStore.el;
	var retval = true;

	if (nodeEl.requestFullscreen) {
		nodeEl.requestFullscreen();
	} else if (nodeEl.webkitRequestFullscreen) {
		nodeEl.webkitRequestFullscreen();
	} else if (nodeEl.mozRequestFullScreen) {
		nodeEl.mozRequestFullScreen();
	} else if (nodeEl.msRequestFullscreen) {
		nodeEl.msRequestFullscreen();
	} else if (__self.GetVideoEl().webkitEnterFullscreen) {
		document.fullscreenElement = __self.GetEl();

		__self.GetVideoEl().webkitEnterFullscreen();
	} else {
		retval = false;
	}

	if (retval) {
		TriggerUEL("enterFullscreen", SyntheticEvent("tonline-videoplayer-enterFullscreen"), __self, __dataStore);
	}

	return retval;
	};

	this.ExitFullScreen = function () {
	var retval = true;

	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else if (__self.GetVideoEl().webkitExitFullscreen) {
		__self.GetVideoEl().webkitExitFullscreen();
	} else {
		retval = false;
	}

	return retval;
	};

	this.ToggleFullscreen = function () {
	if (_this.IsInFullScreenMode()) {
		__self.ShowControlBarButton("fullscreen");

		__self.HideControlBarButton("exit-fullscreen");

		__self.ExitFullScreen();
	} else {
		if (RequestFullScreenMode() === true) {
		Log()("TOnlineMediaplayer", "Fullscreen mode activated.");

		__self.ShowControlBarButton("exit-fullscreen");

		__self.HideControlBarButton("fullscreen");

		__self.ShowBottomControls();
		}
	}
	};

	this.GetEl = function () {
	return __dataStore.el;
	};

	this.GetVideoEl = function () {
	return __dataStore.videoEl;
	};

	this.GetControlsEl = function () {
	return __dataStore.el.querySelector(".controls");
	};

	this.IsMuted = function () {
	return __dataStore.videoEl.muted;
	};

	this.IsPaused = function () {
	return __dataStore.videoEl.paused;
	};

	this.ShowBottomControls = function () {
	this.GetControlsEl().classList.remove("minified");
	return this;
	};

	var settingsTimeout = null;

	this.HideBottomControls = function (force) {
	var _this4 = this;

	if (this.IsPaused() && !force) return;
	this.GetControlsEl().classList.add("minified");
	clearTimeout(settingsTimeout);
	settingsTimeout = setTimeout(function () {
		if (_this4.IsBottomControlsMinified()) {
		__dataStore.optionBoxes.settings.Hide();
		}
	}, 200);
	return this;
	};

	this.IsBottomControlsMinified = function () {
	return __self.GetControlsEl().classList.contains("minified");
	};

	this.ToggleBottomControls = function () {
	if (this.IsBottomControlsMinified()) {
		__self.ShowBottomControls();
	} else {
		__self.HideBottomControls();
	}
	};

	this.GetPosterImageContainerEl = function () {
	return __dataStore.el.querySelector(".posterimage");
	};

	this.ShowPosterImage = function () {
	this.GetPosterImageContainerEl().classList.remove("hidden");
	};

	this.HidePosterImage = function () {
	this.GetPosterImageContainerEl().classList.add("hidden");
	};

	this.GetWidth = function () {
	return __dataStore.el.offsetWidth;
	};

	this.GetHeight = function () {
	return __dataStore.el.offsetHeight;
	};

	var SetupVastParser = function SetupVastParser(opts, cb) {
	opts = opts || {};
	cb = cb || Noop;
	if (!opts.vastAdTag) return cb("No vastAdTag present");

	if (__self.IsPaused && __dataStore.vastHasBeenParsed) {
		_Play();

		return;
	} else {
		_this.HideControlBarButton("pause");

		_this.ShowControlBarButton("play");

		__self.Pause();
	}

	__dataStore.vastParser = new VASTParser({
		player: __self,
		videoEl: __self.GetVideoEl(),
		playerDataStore: __dataStore,
		timeout: 2000,
		maxRedirects: parseInt(__self.GetData("vast-max-redirects", 10), 10)
	});
	TriggerUEL("adCall", null, __self, __dataStore);

	__dataStore.vastParser.SetOnParsingDoneCallback(cb);
	
	console.log("testtttt");
	console.log(!__dataStore.vastHasBeenParsed);

	if (!__dataStore.vastHasBeenParsed) {
		__self.ShowLoadingSpinner(); // If the pre-roll-adtag ist set to string "false"
		// we will exit early and trigger a vast timeout 301 error
		// this is somehow hacky, but we need this as a workaround when
		// ublock origin is active and the adframework could not be loaded.


		if (opts.vastAdTag === "false") {
		var errorCode = 301; // Cache Error Events for HOMAD

		__dataStore.adErrorsCache.push([null, opts.player, "adError", opts.playerDataStore, {
			vastErrorCode: errorCode,
			vastErrorMessage: VASTErrorCodes[errorCode]
		}]); // trigger user event listeners


		if (__dataStore.userEventListeners.adError.length) {
			__dataStore.userEventListeners.adError.forEach(function (cb) {
			cb(null, __self, "adError", __dataStore, {
				vastErrorCode: errorCode,
				vastErrorMessage: VASTErrorCodes[errorCode]
			});
			});
		}

		__dataStore.vastHasBeenParsed = true;
		Log("error")("TOnlineMediplayer", "VAST-Error", errorCode, VASTErrorCodes[errorCode]);
		cb();
		return;
		} else {
		__dataStore.vastParser.Read(opts.vastAdTag);

		__dataStore.vastHasBeenParsed = true;
		}
	}
	};

	this.SetDefaultPlaybackRate = function (pbr) {
	if (this.IsPlayingAd()) {
		Log("error")("TOnlineMediaplayer", "SetDefaultPlaybackRate:", "Ad is still playing");
		return;
	}

	pbr = pbr || __dataStore.defaultPlaybackRate;
	__dataStore.defaultPlaybackRate = pbr;
	Log()("TOnlineMediaplayer", "SetDefaultPlaybackRate:", "is now ", __dataStore.defaultPlaybackRate);
	this.GetVideoEl().playbackRate = pbr;
	this.GetVideoEl().defaultPlaybackRate = pbr;
	return this;
	};

	this.SetDefaultPlaybackRateForAds = function () {
	this.GetVideoEl().playbackRate = __dataStore.defaultPlaybackRateForAds;
	this.GetVideoEl().defaultPlaybackRate = __dataStore.defaultPlaybackRateForAds;
	return this;
	};

	var _Play = function _Play() {
	var videoEl = _this.GetVideoEl();

	if (videoEl.paused) {
		var _promise = videoEl.play();

		if (_promise !== undefined) {
		_promise.then(function () {// nothing to do
		})["catch"](function (ex) {
			Log()("TOnlineMediaplayer", "Play exception", ex);
		});
		}
	} else {
		videoEl.pause();
	}
	};

	this.HideBigPlayButton = function () {
	var bpi = __self.GetClickjackingOverlayEl().querySelector(".big-play-icon-container");

	if (bpi) {
		bpi.classList.add("hidden");
		bpi.classList.remove("visible");
	}
	};

	this.ShowBigPlayButton = function () {
	if (__dataStore.dragging === "timeline") return;

	var bpi = __self.GetClickjackingOverlayEl().querySelector(".big-play-icon-container");

	if (bpi) {
		bpi.classList.remove("hidden");
		setTimeout(function () {
		bpi.classList.add("visible");
		}, 100);
	}
	};

	this.Play = function () {
	// this is a duplicate of the onplay video event
	// where it is also set to be hidden, but
	// there might a slight delay,
	// because of the ads and it feels like cheap UX to have both
	// buttons visible for even a short time.
	// so we have this as a work around,
	// but leave it also in the onplay event,
	// so all other plugins that rely on the ui to change based on video states
	// keep working properly
	__self.HideControlBarButton("replay");

	__self.HideBigPlayButton(); // Destroy big play button


	if (__self.IsPaused() === true) {
		var videoEl = __self.GetVideoEl();

		var tag = __self.GetVASTPrerollTag();

		var _cb = function _cb() {
		__self.HideLoadingSpinner();

		__dataStore.playerControlsDisabled = false;

		var HidePosterImageWhenPlaybackStarted = function HidePosterImageWhenPlaybackStarted() {
			__self.HidePosterImage();

			videoEl.removeEventListener("playing", HidePosterImageWhenPlaybackStarted);
		};

		videoEl.addEventListener("playing", HidePosterImageWhenPlaybackStarted);

		_Play();
		};

		if (tag !== null && __dataStore.vastHasBeenParsed !== true) {
		__self.ShowLoadingSpinner();

		SetupVastParser({
			vastAdTag: tag
		}, _cb);
		} else {
		_cb();
		}
	} else {
		__dataStore.playerControlsDisabled = false;

		__self.Pause();
	}
	};

	this.Replay = function () {
	__dataStore.vastHasBeenParsed = false;
	__dataStore.contentVideoStarted = false;
	__dataStore.contentVideoFirstQuartile = false;
	__dataStore.contentVideoMidpoint = false;
	__dataStore.contentVideoThirdQuartile = false;
	__dataStore.adErrorsCache = [];
	TriggerUEL("replay", SyntheticEvent("tonline-videoplayer-replay"), __self, __dataStore);

	__self.Stop();

	__self.SetCurrentTime(0);

	__self.Play();
	};

	this.IsPlaying = function () {
	return !this.IsPaused();
	};

	this.AdIsPlaying = function () {
	return this.GetEl().classList.contains("playing-ad");
	};

	this.IsAdType = function (type) {
	return this.IsPlayingAd() && this.GetEl().classList.contains("ad-" + type);
	};

	this.GetTimeContainerEl = function () {
	return __self.GetContainerEl().querySelector(".time-container");
	};

	this.GetAdsRemainingTimeContainerEl = function () {
	return __self.GetEl().querySelector(".ads-remaining-time-container");
	};

	this.ShowAdIsPlaying = function (type) {
	this.SetDefaultPlaybackRateForAds();
	__dataStore.isPlayingAd = true;
	this.GetEl().classList.add("playing-ad");
	this.GetAdsRemainingTimeContainerEl().classList.remove("hidden");
	if (type) this.GetEl().classList.add("ad-" + type);
	return this;
	};

	this.HideAdIsPlaying = function (type) {
	this.GetEl().classList.remove("playing-ad");
	if (type) this.GetEl().classList.remove("ad-" + type);
	__dataStore.isPlayingAd = false;
	this.GetAdsRemainingTimeContainerEl().classList.add("hidden");
	this.SetDefaultPlaybackRate();
	return this;
	};

	this.ToggleAdIsPlaying = function () {
	if (this.IsPlayingAd()) {
		this.HideAdIsPlaying();
	} else {
		this.ShowAdIsPlaying();
	}

	return this;
	};

	this.IsPlayingAd = this.AdIsPlaying;

	this.CleanClickjackingOverlay = function () {
	var el = this.GetClickjackingOverlayEl();
	var elClone = el.cloneNode();
	el.parentNode.replaceChild(elClone, el);
	};

	this.GetLoadingSpinner = function () {
	return this.GetContainerEl().querySelector(".loading-spinner");
	};

	this.PictureInPictureAllowed = function () {
	return this.GetEl().getAttribute("data-pip-allowed") === null ? false : true;
	};

	this.IsInPictureInPictureMode = function () {
	return document.pictureInPictureElement !== null;
	};

	this.TogglePictureInPictureMode = function () {
	if (document.pictureInPictureElement === null) {
		this.GetVideoEl().requestPictureInPicture()["catch"](function (ex) {
		Log("error")("TOnlineMediaplayer", "Picture in picture exception", ex);
		});
	} else {
		document.exitPictureInPicture();
	}

	return this;
	};

	this.EnterPictureInPictureMode = function () {
	this.GetVideoEl().requestPictureInPicture()["catch"](function (ex) {
		Log("error")("TOnlineMediaplayer", "Picture in picture exception", ex);
	});
	return this;
	};

	this.ExitPictureInPictureMode = function () {
	if (typeof document.exitPictureInPicture === "function") {
		document.exitPictureInPicture();
	}

	return this;
	};

	this.ShowLoadingSpinner = function () {
	__dataStore.playerControlsDisabled = true;
	this.GetLoadingSpinner().classList.remove("hidden");
	};

	this.HideLoadingSpinner = function () {
	__dataStore.playerControlsDisabled = false;
	this.GetLoadingSpinner().classList.add("hidden");
	};

	this.GetClickjackingOverlayEl = function () {
	return this.GetContainerEl().querySelector(".clickjaqueline");
	};

	this.GetSelectedVideoSource = function () {
	return __self.GetVideoEl().querySelector("source");
	};

	this.HasDataAttribute = function (k) {
	return this.GetEl().hasAttribute("data-" + k);
	};

	this.GetData = function (k, defaultValue) {
	defaultValue = defaultValue || null;
	return this.GetEl().getAttribute("data-" + k) || defaultValue;
	};

	this.IsHoverPreviewEnabled = function () {
	var d = __self.GetData("hover-preview-enabled");

	return d !== null;
	};

	this.GetControlsEl = function () {
	return this.GetContainerEl().querySelector(".controls");
	};

	this.GetControlBar = function () {
	return this.GetContainerEl().querySelector(".controls .control-bar");
	};

	this.GetControlBarButton = function (clsName) {
	return this.GetControlBar().querySelector("button." + clsName);
	};

	this.HideControlBarButton = function (clsName) {
	this.GetControlBar().querySelector("button." + clsName).classList.add("hidden");
	};

	this.ShowControlBarButton = function (clsName) {
	this.GetControlBar().querySelector("button." + clsName).classList.remove("hidden");
	};

	this.ToggleControlBarButton = function (clsName) {
	this.GetControlBar().querySelector("button." + clsName).classList.toggle("hidden");
	};

	var _Pause = function _Pause() {
	var videoEl = __self.GetVideoEl();

	if (!videoEl.paused) {
		videoEl.pause();
	}
	};

	this.Pause = function () {
	if (__dataStore.playerControlsDisabled === false) {
		__self.ShowBigPlayButton();
	}

	_Pause();
	};

	var _Stop = function _Stop() {
	var videoEl = __self.GetVideoEl();

	if (!videoEl.paused) {
		videoEl.pause();
	}

	videoEl.currentTime = 0;
	};

	this.Stop = function () {
	_Stop();
	};

	this.GeoBlockKillswitch = function () {
	__dataStore.el.innerHTML = "<img src='https://www.t-online.de/tv/player/tonline-mediaplayer/geoblock-error.png' style='max-width:100%' />";
	};

	this.SetSelectedMediaSource = function (mediaSource) {
	__dataStore.selectedMediaSource = mediaSource;
	__self.GetVideoEl().src = mediaSource.src;
	__self.GetVideoEl().type = mediaSource.type;
	return __self;
	};

	this.GetSelectedMediaSource = function () {
	return __dataStore.selectedMediaSource || {
		src: __self.GetVideoEl().querySelector("source").src,
		type: __self.GetVideoEl().querySelector("source").type
	};
	};

	this.AddMediaSource = function (mediaSourceConfig) {
	mediaSourceConfig = mediaSourceConfig || {};
	var ms = document.createElement("source");
	ms.src = mediaSourceConfig.src || "";
	ms.type = mediaSourceConfig.type || "";
	ms.setAttribute("data-quality", mediaSourceConfig.dataQuality || "");
	ms.setAttribute("data-label", mediaSourceConfig.dataLabel || "");
	this.GetVideoEl().appendChild(ms);
	};

	this.ToggleCaptions = function () {
	var video = this.GetVideoEl();
	var isCaptionsOnButtonHidden = this.GetControlBar().querySelector("button.captions-on").classList.contains("hidden");
	var i = 0;

	for (i = 0; i < video.textTracks.length; i++) {
		if (i === 0) {
		if (isCaptionsOnButtonHidden) {
			video.textTracks[i].mode = "showing";
		} else {
			video.textTracks[i].mode = "hidden";
		}
		} else {
		video.textTracks[i].mode = "hidden";
		}
	}

	this.GetControlBar().querySelector("button.captions-off").classList.toggle("hidden");
	this.GetControlBar().querySelector("button.captions-on").classList.toggle("hidden");
	};

	this.RemoveMediaSourceByURL = function (mediaSourceURL) {
	var retval = false;
	this.GetEl().querySelectorAll("video source").forEach(function (mediaSource) {
		if (mediaSource.src === mediaSourceURL) {
		mediaSource.parentNode.removeChild(mediaSource);
		retval = true;
		}
	});
	return retval;
	};

	this.Finish = function () {
	var _this5 = this;

	var player = __dataStore.containerEl;
	AddHelperFuncsToEl$1(player);
	player.addEventListener("mouseover", function (evt) {
		// fixes weird mouseover triggered on touch devices
		if (IsTouchDevice()) return;
		var overtarget = evt.target;

		switch (overtarget.getAttribute("data-clicktarget")) {
		case "big-play-icon":
		case "clickjaqueline":
			_this5.ShowBottomControls();

			break;
		}
	});
	player.addEventListener("mouseout", function (evt) {
		// fixes weird mouseout triggered on touch devices
		if (IsTouchDevice()) return;
		var overtarget = evt.target;

		switch (overtarget.getAttribute("data-clicktarget")) {
		case "big-play-icon":
		case "clickjaqueline":
			_this5.HideBottomControls();

			break;
		}
	});
	player.addEventListener("click", function (evt) {
		evt.preventDefault();
		if (__dataStore.playerControlsDisabled === true) {
		return;
		}

		var target = evt.target;
		var clicktarget = evt.target;

		switch (clicktarget.getAttribute("data-clicktarget")) {
		case "clickjaqueline":
			console.log("click jaqueline");
			if (_this5.IsFirstStart() === true) {
			_this5.Play();
			} else {
			if (IsTouchDevice()) {
				_this5.ToggleBottomControls();
			} else {
				if (_this5.IsPlaying()) {
				_this5.Pause();
				} else {
				_this5.Play();
				}
			}
			}

			break;

		case "touchlink":
			// For the ads
		
			_this5.ToggleBottomControls();

			break;

		case "video":
		case "posterimage":
		case "controls-play":
		case "big-play-icon":
			// Work-around for iOS to mark the video with a user-interaction
			// so we can trigger a play in the next tick(s)
			if (__dataStore.videoEl.paused && __dataStore.videoEl.currentTime === 0) {
			var _promise = __dataStore.videoEl.play();

			if (_promise !== undefined) {
				_promise.then(function () {
				__dataStore.videoEl.pause();

				__self.Play();
				})["catch"](function (playPromiseEx) {
				Log("error")("TOnlineMediaplayer", "Handled Play Promise exception", playPromiseEx);
				});
			} else {
				__self.Pause();

				__self.Play();
			}
			} else {
			__self.Play();
			}

			break;

		case "controls-pause":
			__self.Pause();

			break;

		case "controls-replay":
			__self.Replay();

			break;

		case "controls-fullscreen":
		case "controls-exit-fullscreen":
			__self.ToggleFullscreen();

			break;

		case "controls-captions-on":
		case "controls-captions-off":
			__self.ToggleCaptions();

			break;

		case "controls-pip":
			__self.TogglePictureInPictureMode();

			break;

		case "controls-settings":
			if (__self.IsPlayingAd()) {
			__self.HideOptionsBox("settings");

			return;
			}

			while (target.nodeName !== "BUTTON") {
			target = target.parentNode;
			}

			target.classList.toggle("active");

			__self.ToggleOptionsBox("settings");

			break;
		}
	});
	player.setAttribute("data-clicktarget", "video");
	var messageBarEl = CreateEl("div", [["class", "message-bar hidden"]]);
	var posterimage = CreateEl("div", [["class", "posterimage"], ["data-clicktarget", "posterimage"]], CreateEl("img", [["src", __dataStore.videoEl.getAttribute("poster")]])); // remove posterimage from video element

	__dataStore.videoEl.removeAttribute("poster");

	var controlsEl = CreateEl("div", [["class", "controls minified"], // iOS Safari z-index visibility bug
	["style", "transform: translate3d(0,0,1px);-webkit-transform: translate3d(0,0,1px);"]]).on("mouseover", function () {
		__self.ShowBottomControls();
	}).on("mouseout", function () {
		__self.HideBottomControls();
	});
	var loadingSpinner = CreateEl("div", [["class", "loading-spinner hidden"]]).append(CreateEl("div", [["class", "animation"]]));
	var clickjaqueline = CreateEl("div", [["class", "clickjaqueline"], ["data-clicktarget", "clickjaqueline"]]); // container for showing the remaining time in a ad-context

	var adsRemainingTimeContainer = CreateEl("div", [["class", "ads-remaining-time-container stroke black"]]); // container for showing the actual track position via numbers

	var timeContainer = CreateEl("div", [["class", "time-container hidden"]]);
	player.appendChild(loadingSpinner);
	player.appendChild(clickjaqueline);
	player.appendChild(posterimage);
	var durationEl = CreateEl("div", [["class", "duration"]]);
	var durationProgressEl = CreateEl("div", [["data-min", "0"], ["data-max", "100"], ["data-step", "0.01"], ["class", "progress"], ["data-value", "0"]]);
	var durationProgressScrubberEl = CreateEl("div", [["class", "scrubber"]]); // preview thumbnails on movemove and touchmove

	if (__self.IsHoverPreviewEnabled()) {
		var hoverPreviewVideoSrc = __self.GetData("hover-preview-enabled", __self.GetSelectedVideoSource().src);

		var hoverPreviewVideoEl = CreateEl("video", [["preload", "true"], ["class", "hover-preview hidden"], ["muted", "true"], ["src", hoverPreviewVideoSrc]]);

		__self.GetContainerEl().insertBefore(hoverPreviewVideoEl, __self.GetVideoEl());

		var _SetPreviewVideoTime = function _SetPreviewVideoTime(x) {
		var vd = __self.GetVideoEl().duration;

		var elWidth = durationEl.offsetWidth;
		var val = 100 / elWidth * x;
		var time = vd / 100 * val;
		hoverPreviewVideoEl.currentTime = time;
		};

		durationEl.on("mousemove,tapmove", function (evt) {
		// if is playing ad
		if (__self.IsFirstStart()) return;
		if (__self.IsPlayingAd()) return;
		if (!__self.GetVideoEl().duration) return;
		if (evt.target.classList.contains("scrubber")) return;
		var caluclatedMaxRight = videoEl.offsetWidth - hoverPreviewVideoEl.offsetWidth;
		var caluclatedLeft = evt.offsetX - hoverPreviewVideoEl.offsetWidth / 2;
		if (caluclatedLeft < 0) caluclatedLeft = 0;
		if (caluclatedLeft > caluclatedMaxRight) caluclatedLeft = caluclatedMaxRight;
		hoverPreviewVideoEl.style.left = caluclatedLeft + "px";

		_SetPreviewVideoTime(evt.offsetX);
		}).on("mouseover,mouseout,tapstart,tapend", function (evt) {
		if (__self.IsFirstStart()) return;
		if (!__self.GetVideoEl().duration) return;
		if (__self.IsPlayingAd()) return;
		var t = evt.type;

		switch (t) {
			case "mouseover":
			case "tapstart":
			hoverPreviewVideoEl.classList.remove("hidden");
			setTimeout(function () {
				hoverPreviewVideoEl.classList.add("fade-in");
			}, 100);
			break;

			case "mouseout":
			case "tapend":
			hoverPreviewVideoEl.classList.remove("fade-in");
			hoverPreviewVideoEl.classList.add("hidden");
			break;
		}
		});
	}

	durationEl.appendChild(durationProgressEl);
	durationEl.appendChild(durationProgressScrubberEl);
	controlsEl.appendChild(adsRemainingTimeContainer);
	controlsEl.appendChild(durationEl);

	var videoEl = __self.GetVideoEl();

	document.addEventListener("fullscreenchange", function () {
		if (document.fullscreenElement === null) {
		__self.ShowControlBarButton("fullscreen");

		__self.HideControlBarButton("exit-fullscreen");

		TriggerUEL("exitFullscreen", SyntheticEvent("tonline-videoplayer-exitFullscreen"), __self, __dataStore);
		}
	}); // iOS Workarounds

	__self.GetVideoEl().addEventListener("webkitendfullscreen", function () {
		document.fullscreenElement = null;

		__self.ShowControlBarButton("fullscreen");

		__self.HideControlBarButton("exit-fullscreen");

		TriggerUEL("exitFullscreen", SyntheticEvent("tonline-videoplayer-exitFullscreen"), __self, __dataStore);
	});

	document.addEventListener("webkitfullscreenchange", function () {
		if (navigator.userAgent.indexOf("iPad")) {
		if (!document.webkitFullscreenElement) {
			document.fullscreenElement = null;

			__self.ShowControlBarButton("fullscreen");

			__self.HideControlBarButton("exit-fullscreen");

			TriggerUEL("exitFullscreen", SyntheticEvent("tonline-videoplayer-exitFullscreen"), __self, __dataStore);
		}
		}
	}); // IE11 workaround

	document.addEventListener("MSFullscreenChange", function () {
		if (document.fullscreenElement === null) {
		__self.ShowControlBarButton("fullscreen");

		__self.HideControlBarButton("exit-fullscreen");

		TriggerUEL("exitFullscreen", SyntheticEvent("tonline-videoplayer-exitFullscreen"), __self, __dataStore);
		}
	});
	videoEl.addEventListener("seeking", function (evt) {
		TriggerUEL("seeking", evt, __self, __dataStore);
	});
	videoEl.addEventListener("waiting", function (evt) {
		TriggerUEL("waiting", evt, __self, __dataStore);

		__self.ShowLoadingSpinner();
	});
	videoEl.addEventListener("canplay", function () {
		__self.HideLoadingSpinner();
	});
	videoEl.addEventListener("playing", function () {
		__self.HideLoadingSpinner();
	});
	var adSecondsRemainingTranslation = this.GetTranslation("AD: {{seconds}} seconds remaining");
	videoEl.addEventListener("loadedmetadata", function () {
		timeContainer.classList.remove("hidden");
		timeContainer.innerHTML = "00:00 / " + __self.ConvertSecondsIntoPlayerDisplayFormat(this.duration);
	}); // load metadata, so time can be displayed

	videoEl.load();
	videoEl.addEventListener("timeupdate", function (evt) {
		var ct = this.currentTime;
		if (!ct) return;
		var vd = this.duration;
		if (!vd) return;
		var vt = ct;
		var perc = vt / vd * 100;
		var fl = parseFloat(perc).toFixed(2); // update remaining time of ad

		if (__self.IsPlayingAd()) {
		var remainingSeconds = parseInt(vd - ct, 10);
		adsRemainingTimeContainer.innerHTML = adSecondsRemainingTranslation.replace("{{seconds}}", remainingSeconds);
		} // update time container


		timeContainer.innerHTML = __self.ConvertSecondsIntoPlayerDisplayFormat(ct) + " / " + __self.ConvertSecondsIntoPlayerDisplayFormat(vd);
		durationProgressEl.setAttribute("data-value", fl);

		if (__dataStore.dragging === "") {
		durationProgressScrubberEl.style.left = fl + "%";
		durationProgressEl.style.width = fl + "%";
		}

		if (__self.IsPlayingAd()) return;

		if (__dataStore.contentVideoStarted === false && ct >= 1) {
		__dataStore.contentVideoStarted = true;
		TriggerUEL("contentVideoStart", evt, __self, __dataStore);
		return;
		}

		if (__dataStore.contentVideoFirstQuartile === false && ct >= vd / 4) {
		__dataStore.contentVideoFirstQuartile = true;
		TriggerUEL("firstQuartile", evt, __self, __dataStore);
		return;
		}

		if (__dataStore.contentVideoMidpoint === false && ct >= vd / 2) {
		__dataStore.contentVideoMidpoint = true;
		TriggerUEL("midpoint", evt, __self, __dataStore);
		return;
		}

		if (__dataStore.contentVideoThirdQuartile === false && ct >= vd / 4 * 3) {
		__dataStore.contentVideoThirdQuartile = true;
		TriggerUEL("thirdQuartile", evt, __self, __dataStore);
		return;
		}
	});
	var controlBar = CreateEl("div", [["class", "control-bar"]]);
	var controlBarLeftButtonsEl = CreateEl("div", [["class", "control-bar-left-buttons"]]);
	var controlBarLeftTimeEl = CreateEl("div", [["class", "control-bar-left-time"]]);
	var controlBarRightEl = CreateEl("div", [["class", "control-bar-right-buttons"]]);
	var controlsPlayEl = CreateEl("button", [["title", this.GetTranslation("Play")], ["class", "play"], ["data-clicktarget", "controls-play"]]);
	controlsPlayEl.appendChild(SVGHelper("play", {
		svgAttributes: [["data-clicktarget", "controls-play"]],
		useAttributes: [["data-clicktarget", "controls-play"]]
	}));
	controlBarLeftButtonsEl.appendChild(controlsPlayEl);
	var controlsPauseEl = CreateEl("button", [["title", this.GetTranslation("Pause")], ["class", "pause hidden"], ["data-clicktarget", "controls-pause"]]).append(SVGHelper("pause", {
		svgAttributes: [["data-clicktarget", "controls-pause"]],
		useAttributes: [["data-clicktarget", "controls-pause"]]
	}));
	controlBarLeftButtonsEl.appendChild(controlsPauseEl);
	var controlsReplayEl = CreateEl("button", [["title", this.GetTranslation("Replay")], ["class", "replay hidden"], ["data-clicktarget", "controls-replay"]]).append(SVGHelper("restart", {
		svgAttributes: [["data-clicktarget", "controls-replay"]],
		useAttributes: [["data-clicktarget", "controls-replay"]]
	}));
	controlBarLeftButtonsEl.appendChild(controlsReplayEl);
	controlBarLeftButtonsEl.append(CreateEl("button", [["title", this.GetTranslation("Mute")], ["class", "mute hidden"], ["data-clicktarget", "controls-mute"]]).append(SVGHelper("volume", {
		svgAttributes: [["data-clicktarget", "controls-mute"]],
		useAttributes: [["data-clicktarget", "controls-mute"]]
	})).on("click", function () {
		_this5.GetVideoEl().muted = true;
	}));
	controlBarLeftButtonsEl.append(CreateEl("button", [["title", this.GetTranslation("Unmute")], ["class", "unmute hidden"], ["data-clicktarget", "controls-unmute"]]).append(SVGHelper("muted", {
		svgAttributes: [["data-clicktarget", "controls-unmute"]],
		useAttributes: [["data-clicktarget", "controls-unmute"]]
	})).on("click", function () {
		_this5.GetVideoEl().muted = false;
	}));
	this.GetVideoEl().addEventListener("volumechange", function (evt) {
		TriggerUEL("volumechange", evt, __self, __dataStore);
		var v = evt.target;
		var muted = v.muted;
		var vol = v.volume;

		if (vol === 0 || muted) {
		controlBar.querySelector("button.mute").classList.add("hidden");
		controlBar.querySelector("button.unmute").classList.remove("hidden");
		} else {
		controlBar.querySelector("button.mute").classList.remove("hidden");
		controlBar.querySelector("button.unmute").classList.add("hidden");
		}
	});

	if (this.IsMuted() === true) {
		controlBarLeftButtonsEl.querySelector("button.unmute").classList.remove("hidden");
	} else {
		controlBarLeftButtonsEl.querySelector("button.mute").classList.remove("hidden");
	}

	var volumeContainerEl = CreateEl("div", [["class", "volume-container"]]);
	var volumeSliderContainerEl = CreateEl("div", [["class", "volume"], ["data-step", "1"], ["data-min", "0"], ["data-max", "100"], ["data-value", "100"], ["data-clicktarget", "controls-volume-slider"]]).on("click", function (evt) {
		var elWidth = this.offsetWidth;
		var val = 100 / elWidth * evt.offsetX;
		this.setAttribute("data-value", val);
		this.children[0].style.width = val + "%";
		__self.GetVideoEl().volume = val * 0.01;
	});
	var volumeSliderEl = CreateEl("div", [["class", "slider"]]);
	var volumeScrubberEl = CreateEl("div", [["class", "scrubber"]]);
	volumeSliderContainerEl.append(volumeSliderEl);
	volumeSliderContainerEl.append(volumeScrubberEl);
	volumeContainerEl.append(volumeSliderContainerEl);
	controlBarLeftButtonsEl.append(volumeContainerEl);
	controlBarLeftTimeEl.appendChild(timeContainer);
	controlBarRightEl.append(CreateEl("button", [["title", this.GetTranslation("Captions on")], ["class", "captions-on hidden"], ["data-clicktarget", "controls-captions-on"]]).append(SVGHelper("captions-on", {
		svgAttributes: [["data-clicktarget", "controls-captions-on"]],
		useAttributes: [["data-clicktarget", "controls-captions-on"]]
	})));
	controlBarRightEl.append(CreateEl("button", [["title", this.GetTranslation("Captions off")], ["class", "captions-off hidden"], ["data-clicktarget", "controls-captions-off"]]).append(SVGHelper("captions-on", {
		svgAttributes: [["data-clicktarget", "controls-captions-off"]],
		useAttributes: [["data-clicktarget", "controls-captions-off"]]
	})));
	controlBarRightEl.append(CreateEl("button", [["title", this.GetTranslation("Settings")], ["class", "settings"], ["data-clicktarget", "controls-settings"]]).append(SVGHelper("settings", {
		svgAttributes: [["data-clicktarget", "controls-settings"]],
		useAttributes: [["data-clicktarget", "controls-settings"]]
	})));

	if (this.PictureInPictureAllowed()) {
		controlBarRightEl.append(CreateEl("button", [["title", this.GetTranslation("Picture in Picture")], ["class", "pip hidden"], ["data-clicktarget", "controls-pip"]]).append(SVGHelper("pip", {
		svgAttributes: [["data-clicktarget", "controls-pip"]],
		useAttributes: [["data-clicktarget", "controls-pip"]]
		})));

		if (typeof this.GetVideoEl().requestPictureInPicture === "function") {
		controlBarRightEl.querySelector("button.pip").classList.remove("hidden");
		}
	}

	if (__self.GetData("fullscreen-disabled") === null) {
		controlBarRightEl.append(CreateEl("button", [["title", this.GetTranslation("Enter Fullscreen")], ["class", "fullscreen"], ["data-clicktarget", "controls-fullscreen"]]).append(SVGHelper("enter-fullscreen", {
		svgAttributes: [["data-clicktarget", "controls-fullscreen"]],
		useAttributes: [["data-clicktarget", "controls-fullscreen"]]
		})));
		controlBarRightEl.append(CreateEl("button", [["title", this.GetTranslation("Exit Fullscreen")], ["class", "exit-fullscreen hidden"], ["data-clicktarget", "controls-exit-fullscreen"]]).append(SVGHelper("exit-fullscreen", {
		svgAttributes: [["data-clicktarget", "controls-exit-fullscreen"]],
		useAttributes: [["data-clicktarget", "controls-exit-fullscreen"]]
		})));
	}

	controlBar.append([controlBarLeftButtonsEl, controlBarLeftTimeEl, controlBarRightEl]);
	controlsEl.appendChild(controlBar);
	player.appendChild(controlsEl);
	player.appendChild(messageBarEl);

	this.ShowMessage = function (msg, title, opts) {
		opts = opts || {};
		opts.type = opts.type || "info";
		messageBarEl.classList.remove("hidden");
		messageBarEl.innerHTML = msg;
		if (opts.type === "critical") controlsEl.classList.add("hidden");

		if (opts.timeout) {
		setTimeout(function () {
			_this5.HideMessage();
		}, opts.timeout);
		}

		return _this5;
	};

	this.HideMessage = function () {
		messageBarEl.classList.add("hidden");
		return _this5;
	}; // setting up options box


	__dataStore.optionBoxes.settings = new UIOptionsBox({
		player: __self
	});

	this.ShowOptionsBox = function (name) {
		__dataStore.optionBoxes[name].Show();

		return _this5;
	};

	this.HideOptionsBox = function (name) {
		__dataStore.optionBoxes[name].Hide();

		return _this5;
	};

	this.ToggleOptionsBox = function (name) {
		__dataStore.optionBoxes[name].Toggle();

		return _this5;
	};

	var backupVideoSource = __self.GetSelectedMediaSource();

	var canPlayType = videoEl.canPlayType;
	videoEl.querySelectorAll("source").forEach(function (videoSource) {
		if (canPlayType) {
		if (!videoEl.canPlayType(videoSource.type)) {
			Log("error")("TOnlineMediaplayer", "Can't play video source", videoSource);

			__self.ShowMessage(__self.GetTranslation("Can't play video file-type. Unsupported media file."), null, {
			type: "critical"
			});
		}
		}

		videoSource.addEventListener("error", function (evt) {
		Log("error")("TOnlineMediaplayer", "VideoSource error", evt); // Add internal error handling

		__dataStore.userEventListeners.videoSourceError.forEach(function (cb) {
			cb(evt, __self, "videoSourceError");
		});
		});
	}); // video events
	// onerror / onaderror

	videoEl.addEventListener("error", function (evt) {
		Log("error")("TOnlineMediaplayer", "VideoEl error code", videoEl.error.code, "VideoEl error message", videoEl.error.message);

		if (__self.IsPlayingAd()) {
		__self.HideAdIsPlaying();

		__self.SetSelectedMediaSource(backupVideoSource);

		__dataStore.userEventListeners.adError.forEach(function (cb) {
			cb(evt, __self, "adError", __dataStore, {
			vastErrorCode: -1,
			vastErrorMessage: ""
			});
		});
		} else {
		// @TODO
		// Add internal error handling
		__dataStore.userEventListeners.videoError.forEach(function (cb) {
			cb(evt, __self, "error");
		});
		}
	}); // onended

	__self.GetVideoEl().addEventListener("ended", function (evt) {
		__self.GetVideoEl().pause();

		__dataStore.userEventListeners.ended.forEach(function (cb) {
		cb(evt, __self, "ended");
		});

		if (__dataStore.contentVideoStarted === true && __dataStore.contentVideoEnded === false) {
		__dataStore.userEventListeners.contentVideoEnded.forEach(function (cb) {
			cb(evt, __self, "contentVideoEnded");
		});

		__dataStore.contentVideoEnded = true;
		}

		if (__self.IsPlayingAd()) return;

		__self.HideControlBarButton("play");

		__self.HideControlBarButton("pause");

		__self.ShowControlBarButton("replay");

		__self.ShowPosterImage();

		__self.ShowBottomControls();
	}); // onmute


	__self.GetVideoEl().addEventListener("mute", function (evt) {
		__dataStore.userEventListeners.mute.forEach(function (cb) {
		cb(evt, __self, "mute");
		});
	}); // onpause


	videoEl.addEventListener("pause", function (evt) {
		// safe-guard, otherwise it would also trigger on switching sources and what not
		if (videoEl.currentTime > 0) {
		__dataStore.userEventListeners.pause.forEach(function (cb) {
			cb(evt, __self, "pause");
		});

		if (__self.IsPlayingAd() === false) {
			__dataStore.userEventListeners.contentVideoPause.forEach(function (cb) {
			cb(evt, __self, "contentVideoPause");
			});
		}
		}

		if (videoEl.currentTime !== videoEl.duration) {
		__self.ShowControlBarButton("play");

		__self.HideControlBarButton("pause");
		}
	}); // onplay

	__self.GetVideoEl().addEventListener("play", function (evt) {
		__dataStore.userEventListeners.play.forEach(function (cb) {
		cb(evt, __self, "play");
		});
		
		console.log("Test Play");
		console.log(__dataStore.userEventListeners.play);

		if (__self.IsFirstStart() === true) {
		__dataStore.userEventListeners.firstStart.forEach(function (cb) {
			cb(evt, __self, "firstStart");
		});
		}

		if (__self.IsPlayingAd() === false && __self.GetCurrentTime() > 0) {
		__dataStore.userEventListeners.contentVideoResume.forEach(function (cb) {
			cb(evt, __self, "contentVideoResume");
		});
		}

		__dataStore.isFirstStart = false;

		__self.HideBigPlayButton();

		__self.HideControlBarButton("play");

		__self.HideControlBarButton("replay");

		__self.ShowControlBarButton("pause");
	});

	var CalulateDurationPercentageBasedOnXCoords = function CalulateDurationPercentageBasedOnXCoords(x) {
		var percentage = 100 / durationEl.offsetWidth * x;
		return percentage;
	};

	var UpdateTimelineWhileDragging = function UpdateTimelineWhileDragging(evt) {
		var pageX = evt.pageX;

		if (pageX === undefined) {
		if (evt.touches && evt.touches.length) {
			pageX = evt.touches[0].clientX;
		} else {
			pageX = false;
		}
		}

		if (pageX === false) return;
		var durationContainerBoundingClientRect = durationEl.getBoundingClientRect();
		var durationContainerOffsetX = durationContainerBoundingClientRect.x || durationContainerBoundingClientRect.left;
		var x = pageX - durationContainerOffsetX;
		if (x < 0) x = 0;
		if (x > durationContainerBoundingClientRect.width) x = durationContainerBoundingClientRect.width;
		var percentageX = CalulateDurationPercentageBasedOnXCoords(x);
		durationProgressScrubberEl.style.left = percentageX + "%";
		durationProgressEl.style.width = percentageX + "%";
		var ve = __dataStore.videoEl;
		var vd = ve.duration;
		var percentageTime = vd / 100 * percentageX;
		durationProgressEl.setAttribute("data-value", percentageTime);
		__dataStore.videoEl.currentTime = percentageTime;
	};

	var UpdateVolumeSliderWhileDragging = function UpdateVolumeSliderWhileDragging(evt) {
		var pageX = evt.pageX;

		if (pageX === undefined) {
		if (evt.touches && evt.touches.length) {
			pageX = evt.touches[0].clientX;
		} else {
			pageX = false;
		}
		}

		if (pageX === false) return;
		var volumeContainerBoundingClientRect = volumeSliderEl.parentNode.getBoundingClientRect();
		var volumeContainerOffsetX = volumeContainerBoundingClientRect.x || volumeContainerBoundingClientRect.left;
		var x = pageX - volumeContainerOffsetX; // safe-guard for out of bound values

		if (x < 0) x = 0;
		if (x > volumeContainerBoundingClientRect.width) x = volumeContainerBoundingClientRect.width;
		var sliderParent = volumeSliderEl.parentNode;

		if (x > sliderParent.offsetWidth) {
		volumeSliderEl.style.width = "100%";
		volumeScrubberEl.style.left = "100%";
		return;
		}

		var volumeContainer = volumeSliderEl.parentNode;
		var volumeContainerWidth = volumeContainer.offsetWidth;
		var pct = 100 / volumeContainerWidth * x;
		volumeSliderEl.style.width = x + "px";
		volumeScrubberEl.style.left = x + "px";

		__self.SetVolume(pct / 100);
	};

	var DragStart = function DragStart(evt) {
		switch (evt.target) {
		case durationEl:
		case durationProgressEl:
		case durationProgressScrubberEl:
			if (__self.IsPlayingAd()) return;

			__self.Pause();

			__self.HideBigPlayButton();

			__dataStore.dragging = "timeline";
			TriggerUEL("seekStart", evt, __self, __dataStore);
			break;

		case volumeSliderEl:
		case volumeContainerEl:
		case volumeSliderContainerEl:
		case volumeScrubberEl:
			// volumeScrubberEl.classList.add("hidden");
			__dataStore.dragging = "volume";
			break;
		}
	};

	var DragEnd = function DragEnd(evt) {
		if (__dataStore.dragging === "timeline") {
		__dataStore.dragging = "";
		UpdateTimelineWhileDragging(evt);
		durationProgressScrubberEl.classList.remove("hidden");

		__self.Play();

		TriggerUEL("seekEnd", evt, __self, __dataStore);
		}

		if (__dataStore.dragging === "volume") {
		__dataStore.dragging = "";
		UpdateVolumeSliderWhileDragging(evt);
		}
	};

	var Drag = function Drag(evt) {
		if (__dataStore.dragging === "timeline") {
		UpdateTimelineWhileDragging(evt);
		}

		if (__dataStore.dragging === "volume") {
		UpdateVolumeSliderWhileDragging(evt);
		}
	};

	document.body.addEventListener("touchstart", DragStart, {
		passive: true
	});
	document.body.addEventListener("touchend", DragEnd, {
		passive: true
	});
	document.body.addEventListener("touchmove", Drag, {
		passive: true
	});
	document.body.addEventListener("mousedown", DragStart, {
		passive: true
	});
	document.body.addEventListener("mouseup", DragEnd, {
		passive: true
	});
	document.body.addEventListener("mousemove", Drag, {
		passive: true
	});

	if (videoEl.textTracks && videoEl.textTracks.length) {
		for (var i = 0; i < videoEl.textTracks.length; i++) {
		videoEl.textTracks[i].mode = "hidden";
		}

		this.GetControlBarButton("captions-off").classList.remove("hidden");
	}

	var bigPlayIconContainer = CreateEl("div", [["class", "big-play-icon-container hidden"], ["data-clicktarget", "big-play-icon"]]).append(CreateEl("div", [["class", "big-play-icon-cell"], ["data-clicktarget", "big-play-icon"]]).append(CreateEl("div", [["class", "big-play-icon"], ["data-clicktarget", "big-play-icon"]]))); // On visiblity change aka Tab leave, pause the player

	var _HandleVisibilityChange = function _HandleVisibilityChange() {
		if (document.hidden) {
		if (__self.IsPlaying()) {
			__dataStore.wasPlayingTabLeave = true;

			__self.Pause();
		}
		} else {
		if (__dataStore.wasPlayingTabLeave === true) {
			__dataStore.wasPlayingTabLeave = false;

			__self.Play();
		}
		}
	};

	__self.EnablePauseOnDocumentHidden = function () {
		document.addEventListener("visibilitychange", _HandleVisibilityChange, false);
	};

	if (__self.HasDataAttribute("disable-pause-on-document-hidden") === false) {
		__self.EnablePauseOnDocumentHidden();
	}

	__self.DisablePauseOnDocumentHidden = function () {
		document.removeEventListener("visibilitychange", _HandleVisibilityChange, false);
	}; // Make play icon double the size, if the player is wider than or equal to 600px


	var _OnWindowResize = function _OnWindowResize() {
		var bigPlayIcon = bigPlayIconContainer.querySelector(".big-play-icon");

		if (__self.GetWidth() >= 700) {
		bigPlayIcon.classList.add("x128");
		bigPlayIcon.classList.remove("x96");
		} else if (__self.GetWidth() >= 500) {
		bigPlayIcon.classList.add("x96");
		bigPlayIcon.classList.remove("x128");
		} else {
		bigPlayIcon.classList.remove("x96");
		bigPlayIcon.classList.remove("x128");
		}
	};

	_OnWindowResize();

	window.addEventListener("resize", _OnWindowResize);

	__self.GetClickjackingOverlayEl().append(bigPlayIconContainer); // Verbose logging of the VAST Preroll-Tag


	if (this.GetVASTPrerollTag() === null) {
		Log("warn")("TOnlineMediaplayer", "AdSettings", "Deactivated");
	} else {
		Log()("TOnlineMediaplayer", "AdSettings", "AdTag is", this.GetVASTPrerollTag());
	}

	__self.ShowBigPlayButton(); // THIS IS THE END-GAME!


	delete this.Finish;
	TriggerUEL("playerLoaded", null, __self, __dataStore); // GeoBlocking

	if (this.GetData("geoblock")) {
		if (!window.TOnlineMediaplayerFramework.GeoLocation) {
		new AjaxRequest("https://geolocation.stroeerdp.de/iplocation/?accesstoken=2d22516cf9152c9ad17492a5ae88102c", function (err, res) {
			if (err) {
			__self.GeoBlockKillswitch();

			return;
			}

			var j = JSON.parse(res.responseText);

			if (j && j.countryshort) {
			window.TOnlineMediaplayerFramework.GeoLocation = j.countryshort;
			}

			if (window.TOnlineMediaplayerFramework.GeoLocation !== "DE") {
			__self.GeoBlockKillswitch();

			return;
			}
		}, {
			responseType: "text"
		});
		} else {
		if (window.TOnlineMediaplayerFramework.GeoLocation !== "DE") {
			__self.GeoBlockKillswitch();

			return;
		}
		}
	}

	return __self;
	};

	return this;
};

function SpriteLoader(url, id, useCache) {
	useCache = useCache || false;
	if (!url || !id) return;
	var prefix = "cache";
	var isCached = false;
	var cached = null;

	var exists = function exists() {
	return document.getElementById(id) !== null;
	};

	var update = function update(container, data) {
	// eslint-disable-next-line no-param-reassign
	container.innerHTML = data; // Check again incase of race condition

	if (exists()) {
		return;
	} // Inject the SVG to the body


	document.body.insertAdjacentElement("afterbegin", container);
	}; // Only load once if ID set


	if (!exists()) {
	// Create container
	var container = document.createElement("div");
	container.setAttribute("hidden", "");
	container.setAttribute("id", id); // Check in cache

	if (useCache) {
		cached = window.localStorage.getItem("".concat(prefix, "-").concat(id));
	}

	isCached = cached !== null;

	if (isCached) {
		var data = JSON.parse(cached);
		update(container, data.content);
	} // Get the sprite


	AjaxRequest(url, function (err, res) {
		if (err) {
		return;
		}

		var result = res.responseText;

		if (useCache) {
		window.localStorage.setItem("".concat(prefix, "-").concat(id), JSON.stringify({
			content: result
		}));
		}

		update(container, result);
	});
	}
}

var JavascriptLoader = function JavascriptLoader(url, cb) {
	cb = cb || Noop;
	var s = document.createElement("script");
	s.src = url;

	s.onerror = function () {
	cb("Error loading script", this);
	};

	s.onload = function () {
	cb(false, this);
	};

	document.body.appendChild(s);
};

var CSSLoader = function CSSLoader(url, cb) {
	cb = cb || Noop;
	var css = document.createElement("link");
	css.rel = "stylesheet";
	css.type = "text/css";
	css.href = url;

	css.onerror = function () {
	cb("Error loading css", this);
	};

	css.onload = function () {
	cb(false, this);
	};

	document.body.appendChild(css);
};

var TOnlineMediaplayerFramework = function TOnlineMediaplayerFramework() {
	var _isInDebugMode = localStorage.getItem("TOnlineMediaplayerFrameworkDebug") !== null;

	var _videoplayers = [];
	var __dataStore = {
	plugins: {}
	};
	var pub = {};

	pub.IsInDebugMode = function () {
	return _isInDebugMode;
	};

	pub.CreateEl = CreateEl;
	pub.Log = Log;
	pub.Noop = Noop;

	pub.New = function (domNode) {
	var p = new TOnlineVideoplayer(domNode);

	if (p) {
		_videoplayers.push(p);
	}

	return p;
	};

	pub.LoadCSS = function (url, cb) {
	cb = cb || Noop;
	new CSSLoader(url, function (err) {
		if (err) {
		cb(err);
		Log("error")(err);
		return pub;
		}

		cb(false);
	});
	return pub;
	};

	pub.LoadPlugin = function (url, cb) {
	cb = cb || Noop;
	new JavascriptLoader(url, function (err) {
		if (err) {
		cb(err);
		Log("error")(err);
		return pub;
		}

		cb(false);
	});
	return pub;
	};

	pub.RegisterPlugin = function (name, cb) {
	if (typeof __dataStore.plugins[name] !== "undefined") {
		Log("error")("Plugin ", name, "already registered.");
		return this;
	}

	__dataStore.plugins[name] = cb;
	return pub;
	};

	pub.GetAllPlugins = function () {
	return __dataStore.plugins;
	};

	pub.GetPlugin = function (name) {
	return __dataStore.plugins[name];
	};

	pub.IsTouchDevice = function () {
	return IsTouchDevice();
	};

	pub.GetAllPlayers = function () {
	return _videoplayers;
	};

	pub.GetPlayerByIndex = function (idx) {
	return _videoplayers[idx];
	};

	pub.EnableDebugMode = function () {
	window.localStorage.setItem("TOnlineMediaplayerFrameworkDebug", 1);
	};

	pub.DisableDebugMode = function () {
	window.localStorage.removeItem("TOnlineMediaplayerFrameworkDebug");
	};

	pub.Init = function (opts) {
	opts = opts || {};
	opts.iconSpriteURL = opts.iconSpriteURL || "https://www.t-online.de/tv/playerdev/tonline-mediaplayer/player-icons.svg";
	SpriteLoader(opts.iconSpriteURL, "gmp-svg-icons", true); // Init players that have the tonline-mediaplayer classname autoMAGICALLY!

	var i = 0;
	var players = document.querySelectorAll(".tonline-mediaplayer");
	var len = players.length;

	var gd = function gd(el, k) {
		return el.getAttribute(k);
	};

	for (; i < len; i++) {
		var player = players[i];

		if (gd(player, "data-tonline-mediaplayer-initialized") !== null || gd(player, "data-programmatic") !== null) {
		continue;
		}

		pub.New(player).Finish();
	}
	};

	return pub;
};

(function () {
	var tonlineFrameworkName = "TOnlineMediaplayerFramework";
	window[tonlineFrameworkName] = new TOnlineMediaplayerFramework();
})();

})));
