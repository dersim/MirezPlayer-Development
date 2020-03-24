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

        console.log("Test");
        console.log(errorPixels); // Push Error

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
            linearNode = creative.querySelector("Linear");

            var _ClickThrough = linearNode.querySelector("ClickThrough");
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
        var url = replaceURLMacro(url);
        new XMLRequest(url, function (err, res) {
          if (err) {
            //handleAjaxRequestErrors(err);
            //opts.onParsingDoneCallback();
            return;
          }

          new method.Parse(res.responseXML, url);
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

    var VASTPlayer = function VASTPlayer(domNode) {
      var _this = this;

      Log()("Mirez-Player", "VASTPlayer", "DOMNode", domNode);

      var __self = this;

      var __dataStore = {
        el: domNode,
        videoEl: domNode.querySelector("video"),
        contentEl: domNode.querySelector(".mirez-conent"),
        loader: domNode.querySelector(".mirez-loader"),
        clickArea: domNode.querySelector(".play-icon-area"),
        playIcon: domNode.querySelector(".play-icon-area"),
        soundIcon: domNode.querySelector(".mirez-sound-area"),
        soundAnimIcon: domNode.querySelectorAll(".mirez-sound-icon"),
        vastIsParsed: false,
        isFirstStart: true,
        isPlayingAd: false,
        defaultPlaybackRateForAds: 1,
        userEventListeners: {
          adStart: [],
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

      this.getPlayIcon = function () {
        return __dataStore.playIcon;
      };

      this.getClickArea = function () {
        return __dataStore.playIcon;
      };

      this.getSoundIcon = function () {
        return __dataStore.soundIcon;
      };

      this.getSoundAnimIcon = function () {
        return __dataStore.soundAnimIcon;
      };

      this.getHeight = function () {
        return __dataStore.el.offsetHeight;
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

      this.setAnimSound = function () {
        _this.getSoundAnimIcon()[0].classList.remove("none");

        _this.getSoundAnimIcon()[1].classList.remove("none");

        _this.getSoundAnimIcon()[2].classList.remove("none");
      };

      this.setAnimSoundNone = function () {
        _this.getSoundAnimIcon()[0].classList.add("none");

        _this.getSoundAnimIcon()[1].classList.add("none");

        _this.getSoundAnimIcon()[2].classList.add("none");
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
          var target = evt.target;
          var clicktarget = evt.target;

          switch (clicktarget.getAttribute("data-clicktarget")) {
            case "click-area":
              break;

            case "play-icon-cell":
              _this2.hidePlayIcon();

              player.play();
              break;

            case "play-icon":
              _this2.hidePlayIcon();

              _this2.showSoundIcon();

              player.play();
              break;

            case "click-sound":
              if (player.muted === true) {
                player.muted = false;

                _this2.setAnimSoundNone();
              } else {
                player.muted = true;

                _this2.setAnimSound();
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

      pub.Test = function () {
        console.log("tesasdt");
      };

      return pub;
    };

    (function () {
      var playerFramework = "mirezplayer";
      window[playerFramework] = new PlayerFramework();
    })();

})));
