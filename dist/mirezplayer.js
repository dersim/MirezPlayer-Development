(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    // IE11 Polyfill .forEach
    if ("NodeList" in window && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;

        for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    var replaceURLMacro = function replaceURLMacro(url) {
      if (url.indexOf("[TIMESTAMP]") !== -1) {
        var unix_timestamp = Date.now();
        url = url.replace("[TIMESTAMP]", unix_timestamp);
      }

      if (url.indexOf("%%CACHEBUSTER%%") !== -1) {
        var _unix_timestamp = Date.now();

        url = url.replace("%%CACHEBUSTER%%", _unix_timestamp);
      }

      if (url.indexOf("[CACHEBUSTER]") !== -1) {
        var _unix_timestamp2 = Date.now();

        url = url.replace("[CACHEBUSTER]", _unix_timestamp2);
      }

      return url;
    };

    function _typeof(obj) {
      "@babel/helpers - typeof";

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

    function StringUtils(str) {
      str = new String(str);

      function startsWith(needle) {
        return str.indexOf(needle) === 0;
      }

      return {
        startsWith: startsWith
      };
    }

    function XMLRequest(url, cb, opts) {
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
          return new XMLRequest(url, cb, opts);
        }

        if (req.status !== 200) return cb(req, {});
        cb(false, req);
      }

      function run() {
        if (req) {
          req.open("GET", url, true);
          req.timeout = 2000;

          req.ontimeout = function (e) {
            console.log("timeout");
          };

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

    var Noop = function Noop() {};

    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    var Log = function Log(t) {
      if (localStorage.getItem("MirezPlayerDebug") === null) return Noop;
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

    var getNodeValue = function getNodeValue(node) {
      return node.nodeValue || node.textContent;
    };

    var getTrackingEvents = function getTrackingEvents(trackingEventsNodes) {
      var events = [];
      var eventName;
      var tmpEvent;
      if (trackingEventsNodes.length === 0) return events;
      trackingEventsNodes.forEach(function (eventNode) {
        eventName = eventNode.getAttribute("event");
        tmpEvent = {
          name: eventName,
          url: getNodeValue(eventNode)
        };

        if (eventName === "progress") {
          tmpEvent.offset = eventNode.getAttribute("offset");
        }

        events.push(tmpEvent);
      });
      return events;
    };

    var TrackingRequest = function TrackingRequest(url, cb, opts) {
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
    };

    function OnStartEvent(event) {
      Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
      TrackingRequest(event.url);
    }

    var AttachTrackingEventsToPlayer = function AttachTrackingEventsToPlayer(events, player) {
      var videoEl = player.getVideoEl();
      var _timeupdateEvents = [];
      var _cleanup = []; // for each tracking event

      events.forEach(function (event) {
        // create a intermediate functions, so we can remove the event listeners right after firing it.
        var _OnStartEvent = function _OnStartEvent() {
          videoEl.removeEventListener("play", _OnStartEvent);
          OnStartEvent(event);
        };

        switch (event.name) {
          case "start":
            videoEl.addEventListener("play", _OnStartEvent);
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
    };

    var triggerUEL = function triggerUEL(player, uel, n, evt) {
      console.log("triggerUEL");
      console.log(player);
      console.log(uel);
      console.log(n);
      console.log(uel[n]);
      evt = evt || null;

      if (uel[n] && uel[n].length) {
        uel[n].forEach(function (cb) {
          cb(evt, player, n);
        });
      }
    };

    var AttachUserEventsToPlayer = function AttachUserEventsToPlayer(player, playerDataStore) {
      var events = [{
        name: "start"
      }];
      var videoEl = player.getVideoEl();
      var uel = playerDataStore.userEventListeners;

      events.forEach(function (event) {
        var _OnStartEvent = function _OnStartEvent() {
          if (!player.isPlayingAd()) return;
          if (videoEl.currentTime > 1) return;
          triggerUEL(player, uel, "adStart");
        };

        switch (event.name) {
          case "start":

            videoEl.addEventListener("play", _OnStartEvent);
            break;
        }
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
          Log("error")("Mirez-Player", "VPAIDUtils", "iframe has been fully loaded, but getVPAIDAd is not a fn, but this:", fn);
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
            Log("error")("MirezPlayer", "VPAIDUtils", VPAIDCreativeErr, VPAIDCreative);
            return;
          }

          Log()("Mirez-Player", "VPAIDUtils", "VPAID is", VPAIDCreative);
          Log()("Mirez-Player", "VPAIDUtils", "VPAID currentAd", currentAd); //const origVideoSrc = player.GetOriginalVideoSource();
          //window.addEventListener("orientationchange", _onorientationchange);

          /*
          function _cleanupListeners() {
              player
                  .GetEl()
                  .removeEventListener("fullscreenchange", _onfullscreenchange);
              window.removeEventListener("orientationchange", _onorientationchange);
          }
          */


          function onInit() {
            Log()("Mirez-Player", "VPAIDUtils", "VPAID onInit"); //player.HideLoadingSpinner();
            //player.HidePosterImage();

            player.hideLoader();
            player.showVPAIDArea();
            player.showSoundIcon();
            player.setSoundOn();
            VPAIDCreative.startAd();
          }
          /*
          function ResumeOrigVideo() {
              _cleanupListeners();
              const videoEl = player.GetVideoEl();
              // it seems as if some vpaid spots restore the origVideoSrc by themselves
              if (videoEl.src !== origVideoSrc.src) {
                  videoEl.src = origVideoSrc.src;
                  player.Play();
              } else {
                  // some of them even fire the play event again?!
                  if (!player.IsPlaying()) {
                      player.Play();
                  }
              }
              player.HideAdIsPlaying("preroll");
              // Generate a clean clickJackingOverlayEl
              player.CleanClickjackingOverlay();
          }*/


          function onVideoComplete() {
            Log()("Mirez-Player", "VPAIDUtils", "VPAID onVideoComplete"); //ResumeOrigVideo();
          }

          function onAdSkipped() {
            Log()("Mirez-Player", "VPAIDUtils", "VPAID Ad skipped"); //ResumeOrigVideo();
          }

          function onAdStop() {
            Log()("Mirez-Player", "VPAIDUtils", "VPAID Ad stop"); //ResumeOrigVideo();
          }

          function onAdError(e) {
            Log("error")("Mirez-Player", "VPAIDUtils", "VPAID onAdError:", e);
            var errorCode = 405;
            playerDataStore.userEventListeners.adError.forEach(function (cb) {
              cb(errorCode, VASTErrorCodes[errorCode], e);
            });
            Log("error")("Mirez-Player", "VPAIDUtils", VASTErrorCodes[errorCode], e); //@TODO
            // Track AdError and kill all other AdTracking-Events
            //ResumeOrigVideo();
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
              player.setPause();
              window.open(clickThruURL);
            }

            opts.clickTrackings.forEach(function (trackingURL) {
              Log()("Mirez-Player", "VPAIDUtils", "Event", "ClickThru ClickTracking", trackingURL);
              TrackingRequest(trackingURL);
            });
          });
          var adParamsTxt = "";
          var adParamsNode = currentAd.querySelector("AdParameters");

          if (adParamsNode) {
            adParamsTxt = adParamsNode.textContent;
          }

          Log()("Mirez-Player", "VPAIDUtils", "VPAID adParams", adParamsTxt);
          VPAIDCreative.initAd(player.getWidth(), player.getHeight(), "normal", -1, {
            AdParameters: adParamsTxt
          }, {
            slot: player.getVPaidArea(),
            videoSlot: player.getVideoEl(),
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
      Log("error")("Mirez-Player", "VPAIDUtils", "Loading VPAID URL:", url);
      CreateIframe(url, currentAd, player, playerDataStore, opts);
    }

    var VPAIDUtils = {
      LoadAdUnit: LoadAdUnit
    };

    function VASTParser(opts) {
      opts = opts || {};
      var playerMethod = opts.playerMethod;
      var playerDataStore = opts.playerDataStore; //const origVideoSrc = opts.playerMethod.getOriginalVideoSource();

      var __dataStore = opts;
      __dataStore.maxRedirect = 10;
      var method = {};
      var trackingEvents = [];
      var ClickTrackings = [];
      var mediaFiles = [];
      var collectedItems = {
        errors: [],
        impressions: [],
        creatives: []
      };

      method.Reset = function () {
        trackingEvents = [];
        ClickTrackings = [];
        mediaFiles = [];
        collectedItems = {
          errors: [],
          impressions: [],
          creatives: []
        };
      };

      var getLinearAd = function getLinearAd(linearNode) {
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
          Log()("Mirez-Player", "VASTParser", "Get closest media file based on " + k + ":", value);
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
          Log()("Mirez-Player", "VASTParser", "Selected media file:", mediaFile);
          return mediaFile;
        };

        return {
          GetMediaFiles: GetMediaFiles,
          GetMediaFileClosestTo: GetMediaFileClosestTo
        };
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

      method.Parse = function (xml, url) {
        var xmlDoc = xml.documentElement;
        var wrapper = xmlDoc.querySelector("Wrapper");
        var errorPixels = xmlDoc.querySelectorAll("Error");
        var adVerifications = xmlDoc.querySelectorAll("AdVerifications Verification");
        var impression = xmlDoc.querySelectorAll("Impression");
        var impressions = xmlDoc.querySelectorAll("Impressions");

        var _ClickTrackings = xmlDoc.querySelectorAll("ClickTracking");

        var trackingEventsNodes = xmlDoc.querySelectorAll("TrackingEvents Tracking");

        if (xml !== null) {
          var i = __dataStore.maxRedirect--;
          Log()("Mirez-Player", "VASTParser", i + " VAST URL: ", url);
          Log()("Mirez-Player", "VASTParser", "VAST Document:", xml.cloneNode(true));
        } else {
          method.Reset();
        }


        if (errorPixels && errorPixels.length) {
          errorPixels.forEach(function (errorPixel) {
            collectedItems.errors.push(errorPixel.textContent);
          });
          Log()("Mirez-Player", "VASTParser", "Error Pixel: ", collectedItems.errors);
        } // Push Impression


        if (impression && impression.length || impressions && impressions.length) {
          impression.forEach(function (imp) {
            if (imp.textContent && imp.textContent.length) {
              collectedItems.impressions.push(imp.textContent);
            }
          });
          Log()("Mirez-Player", "VASTParser", "Impression Pixel: ", collectedItems.impressions);
        } // Push Click Tacking


        if (_ClickTrackings) {
          _ClickTrackings.forEach(function (_ClickTracking) {
            ClickTrackings.push(getNodeValue(_ClickTracking));
          });

          Log()("Mirez-Player", "VASTParser", "Click Tracking: ", ClickTrackings);
        } //Push Tracking Event


        trackingEvents.push(getTrackingEvents(trackingEventsNodes));
        Log()("Mirez-Player", "VASTParser", " Tracking Events: ", trackingEvents); // Ad Verification

        if (adVerifications.length > 0) ; // InLine


        if (!wrapper) {
          Log()("Mirez-Player", "VASTParser", " Finish: ", "Wrapper End");
          var creatives = xmlDoc.querySelectorAll("Creatives Creative");

          if (creatives.length === 0) {
            method.Reset();
            return;
          }

          var linearAd = null;
          var linearNode = null; //#######################################################################

          creatives.forEach(function (creative) {
            if (!creative.querySelector("Linear")) return;
            linearNode = creative.querySelector("Linear"); //AdClick

            var _ClickThrough = linearNode.querySelector("ClickThrough");

            if (_ClickThrough) {
              var clickLandingPageArea = opts.playerMethod.getLandingPageArea();
              var clickTroughFunc = Noop;

              clickTroughFunc = function clickTroughFunc() {
                try {
                  triggerUEL(playerMethod, playerDataStore.userEventListeners, "adClick");
                } catch (exception) {
                  Log("Error")("Mirez-Player", "VASTParser", "UserEventListenerException", exception);
                }

                ClickTrackings.forEach(function (ct) {
                  Log()("Mirez-Player", "VASTParser", "ClickTracking", ct);
                  TrackingRequest(ct);
                });
                Log()("Mirez-Player", "VASTParser", "ClickThrough", _ClickThrough);
                window.open(getNodeValue(_ClickThrough));
              };

              clickLandingPageArea.addEventListener("click", clickTroughFunc);
            }

            linearAd = getLinearAd(linearNode);
            Log()("Mirez-Player", "VASTParser", "Possible media files:", linearAd.GetMediaFiles());
          });

          if (linearAd) {
            AttachUserEventsToPlayer(playerMethod, playerDataStore);
            trackingEvents.forEach(function (te) {
              AttachTrackingEventsToPlayer(te, playerMethod);
            }); //triggerUEL();

            var videoEl = opts.playerMethod.getVideoEl();
            var mediaFile = linearAd.GetMediaFileClosestTo("height", opts.playerMethod.getHeight()); // VPAID

            if (mediaFile.type === "application/javascript") {
              Log()("Mirez-Player", "VASTParser", "Linear Node:", linearNode);
              VPAIDUtils.LoadAdUnit(mediaFile.src, linearNode, playerMethod, playerDataStore, {
                clickTrackings: ClickTrackings
              }); // fire impression tracking pixels

              collectedItems.impressions.forEach(function (imp) {
                Log()("Mirez-Player", "VASTParser", "Impression fired", imp);
                TrackingRequest(imp);
              });
              Log()("Mirez-Player", "VASTParser", "Collected Items:", collectedItems);
              return;
            } else {
              videoEl.src = mediaFile.src;
              opts.playerMethod.hideLoader();
              opts.playerMethod.showPlayIcon();
            }

            opts.playerMethod.showAdIsPlaying("preroll");
          }

          return;
        } //#############################################################################


        var vastTagUri = wrapper.querySelector("VASTAdTagURI").textContent;

        if (vastTagUri) {
          method.Read(vastTagUri);
        }
      };

      method.Read = function (url) {
        var URL = replaceURLMacro(url);
        new XMLRequest(URL, function (err, res) {
          if (err) {
            //handleAjaxRequestErrors(err);
            //opts.onParsingDoneCallback();
            return;
          }

          new method.Parse(res.responseXML, URL);
        }, {
          requestContentType: "document" // withCredentials: true

        });
      };

      return method;
    }

    var VASTParserHandle = function VASTParserHandle(opts) {
      opts = opts || {};
      if (!opts.playerMethod.getPreRollTag()) return console.log("VAST Tag is not present");
      opts.vastParser = new VASTParser({
        playerMethod: opts.playerMethod,
        playerDataStore: opts.playerDataStore
      });
      opts.vastParser.Read(opts.playerMethod.getPreRollTag());
    };

    var isTablet = function isTablet() {
      window.onload = userAgentDetect;

      function userAgentDetect() {
        if (window.navigator.userAgent.match(/Tablet/i) || window.navigator.userAgent.match(/iPad/i) || window.navigator.userAgent.match(/Nexus 7/i) || window.navigator.userAgent.match(/Nexus 10/i) || window.navigator.userAgent.match(/KFAPWI/i)) {
          document.body.className -= ' mobile';
          document.body.className += ' tablet';
          return true; //alert('True - Tablet - ' + navigator.userAgent);
        } else {
          return false; //alert('False - Tablet - ' + navigator.userAgent);
        }
      }

      return userAgentDetect();
    };

    var isMobile = function isMobile() {
      if (window.matchMedia("(pointer: coarse)").matches) {
        if (isTablet() !== true) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    };

    var VASTPlayer = function VASTPlayer(domNode) {
      var _this = this;

      Log()("Mirez-Player", "VASTPlayer", "DOMNode", domNode);

      var __self = this;

      var __dataStore = {
        el: domNode,
        videoEl: domNode.querySelector("video"),
        contentEl: domNode.querySelector(".mirez-content"),
        loader: domNode.querySelector(".mirez-loader"),
        landingPageArea: domNode.querySelector(".landing-page-area"),
        playIcon: domNode.querySelector(".play-icon-area"),
        soundIcon: domNode.querySelector(".mirez-sound-area"),
        soundAnimIcon: domNode.querySelectorAll(".mirez-sound-icon"),
        vpaidArea: domNode.querySelector(".vpaid-area"),
        vastIsParsed: false,
        isFirstStart: true,
        isPlayingAd: false,
        defaultPlaybackRateForAds: 1,
        userEventListeners: {
          adCall: [],
          adPause: [],
          adResume: [],
          adStart: [],
          adClick: [],
          adLoaded: [],
          adError: [],
          firstStart: [],
          play: [],
          pause: [],
          contentVideoResume: []
        },
        prerollTag: domNode.getAttribute("preroll-tag")
      }; // Getter

      this.getEl = function () {
        return __dataStore.el;
      };

      this.getPreRollTag = function () {
        return __dataStore.prerollTag;
      };

      this.getVideoEl = function () {
        return __dataStore.videoEl;
      };

      this.getLoader = function () {
        return __dataStore.loader;
      };

      this.getLandingPageArea = function () {
        return __dataStore.landingPageArea;
      };

      this.getPlayIcon = function () {
        return __dataStore.playIcon;
      };

      this.getSoundIcon = function () {
        return __dataStore.soundIcon;
      };

      this.getSoundAnimIcon = function () {
        return __dataStore.soundAnimIcon;
      };

      this.getVPaidArea = function () {
        return __dataStore.vpaidArea;
      };

      this.getHeight = function () {
        return __dataStore.el.offsetHeight;
      };

      this.getWidth = function () {
        return __dataStore.el.offsetWidth;
      };

      this.getCurrentTime = function () {
        return Math.floor(__dataStore.videoEl.currentTime);
      }; // Setter


      this.setVastIsParsed = function () {
        return __dataStore.vastIsParsed = true;
      };

      this.setDefaultPlaybackRateForAds = function () {
        _this.getVideoEl().playbackRate = __dataStore.defaultPlaybackRateForAds;
        _this.getVideoEl().defaultPlaybackRate = __dataStore.defaultPlaybackRateForAds;
        return _this;
      };

      this.setAnimSoundOn = function () {
        _this.getSoundAnimIcon()[0].classList.remove("none");

        _this.getSoundAnimIcon()[1].classList.remove("none");

        _this.getSoundAnimIcon()[2].classList.remove("none");
      };

      this.setAnimSoundOff = function () {
        _this.getSoundAnimIcon()[0].classList.add("none");

        _this.getSoundAnimIcon()[1].classList.add("none");

        _this.getSoundAnimIcon()[2].classList.add("none");
      };

      this.setSoundOn = function () {
        return __dataStore.videoEl.muted = true;
      };

      this.setSoundOff = function () {
        return __dataStore.videoEl.muted = false;
      };

      this.setPause = function () {
        return __dataStore.videoEl.pause();
      }; // Is


      this.isPaused = function () {
        return __dataStore.videoEl.paused;
      };

      this.isPlayingAd = function () {
        return __dataStore.isPlayingAd;
      };

      this.isFirstStart = function () {
        return __dataStore.isFirstStart;
      }; // hide || show


      this.hideLoader = function () {
        _this.getLoader().classList.remove("show");

        _this.getLoader().classList.add("hide");
      };

      this.showLoader = function () {
        _this.getLoader().classList.remove("hide");

        _this.getLoader().classList.add("show");
      };

      this.hidePlayIcon = function () {
        _this.getPlayIcon().classList.remove("show");

        _this.getPlayIcon().classList.add("hide");
      };

      this.showPlayIcon = function () {
        _this.getPlayIcon().classList.remove("hide");

        _this.getPlayIcon().classList.add("show");
      };

      this.showAdIsPlaying = function (type) {
        _this.setDefaultPlaybackRateForAds();

        __dataStore.isPlayingAd = true;

        _this.getEl().classList.add("playing-ad"); //this.getAdsRemainingTimeContainerEl().classList.remove("hidden");


        if (type) _this.getEl().classList.add("ad-" + type);
      };

      this.hideSoundIcon = function () {
        _this.getSoundIcon().classList.remove("show");

        _this.getSoundIcon().classList.add("hide");
      };

      this.showSoundIcon = function () {
        _this.getSoundIcon().classList.remove("hide");

        _this.getSoundIcon().classList.add("show");
      };

      this.hideLandingPageArea = function () {
        _this.getLandingPageArea().classList.remove("show");

        _this.getLandingPageArea().classList.add("hide");
      };

      this.showLandingPageArea = function () {
        _this.getLandingPageArea().classList.remove("hide");

        _this.getLandingPageArea().classList.add("show");

        isMobile() ? _this.getLandingPageArea().classList.add("mobile") : _this.getLandingPageArea().classList.add("desktop");
      };

      this.hideVPAIDArea = function () {
        _this.getVPaidArea().classList.remove("show");

        _this.getVPaidArea().classList.add("hide");
      };

      this.showVPAIDArea = function () {
        _this.getVPaidArea().classList.remove("hide");

        _this.getVPaidArea().classList.add("show");
      }; // addEventListener


      __self.getVideoEl().addEventListener("play", function (evt) {
        __dataStore.userEventListeners.play.forEach(function (cb) {
          cb(evt, __self, "play");
        });

        if (__self.isFirstStart() === true) {
          __dataStore.userEventListeners.firstStart.forEach(function (cb) {
            cb(evt, __self, "firstStart");
          });

          console.log("FirstStart");
        }

        if (__self.isPlayingAd() !== false && __self.getCurrentTime() > 0) {
          __dataStore.userEventListeners.contentVideoResume.forEach(function (cb) {
            cb(evt, __self, "contentVideoResume");
          });

          console.log("contentVideoResume");
        }

        __dataStore.isFirstStart = false;
      });

      this.addEvent = function () {
        var _this2 = this;

        var player = __dataStore.videoEl;
        var playerContent = __dataStore.contentEl;
        playerContent.addEventListener("click", function (evt) {
          evt.preventDefault();
          var clicktarget = evt.target;

          switch (clicktarget.getAttribute("data-clicktarget")) {
            case "click-play":
              _this2.hidePlayIcon();

              _this2.showLandingPageArea();

              _this2.showSoundIcon();

              player.play();
              break;

            case "click-landing-page":
              _this2.showPlayIcon();

              _this2.hideLandingPageArea();

              _this2.hideSoundIcon();

              player.pause();
              break;

            case "click-sound":
              if (player.muted === true) {
                player.muted = false;

                _this2.setAnimSoundOff();
              } else {
                player.muted = true;

                _this2.setAnimSoundOn();
              }

              break;
          }
        });
      }; // Start Parsing VAST Tag


      this.parsingVastTag = function () {
        __self.showLoader();

        if (__self.isPaused() === true) {
          //const videoEl = __self.getVideoEl();
          if (__dataStore.vastIsParsed === false) {
            //parsingVastTag({vastTag: tag});
            VASTParserHandle({
              playerMethod: __self,
              playerDataStore: __dataStore
            });
          }
        }
      }; //init


      __self.parsingVastTag();

      __self.addEvent();
    };

    var PlayerFramework = function PlayerFramework() {
      //new Object
      var pub = {};

      pub.enableDebugMode = function () {
        return window.localStorage.setItem("MirezPlayerDebug", 1);
      };

      pub.disableDebugMode = function () {
        return window.localStorage.removeItem("MirezPlayerDebug");
      };

      pub.initVASTPlayer = function () {
        var domNode = document.querySelector(".mirez-player");
        var r = new VASTPlayer(domNode);
        return r;
      };

      pub.Init = function () {
        pub.initVASTPlayer();
      };

      return pub;
    };

    (function () {
      var playerFramework = "mirezplayer";
      window[playerFramework] = new PlayerFramework();
    })();

})));
