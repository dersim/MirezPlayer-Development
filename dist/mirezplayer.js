(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const replaceURLMacro = function (url) {
      if (url.indexOf("[TIMESTAMP]") !== -1) {
        const unix_timestamp = Date.now();
        url = url.replace("[TIMESTAMP]", unix_timestamp);
      }

      if (url.indexOf("%%CACHEBUSTER%%") !== -1) {
        const unix_timestamp = Date.now();
        url = url.replace("%%CACHEBUSTER%%", unix_timestamp);
      }

      if (url.indexOf("[CACHEBUSTER]") !== -1) {
        const unix_timestamp = Date.now();
        url = url.replace("[CACHEBUSTER]", unix_timestamp);
      }

      return url;
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

    function XMLRequest(url, cb, opts) {
      url = url || false;
      cb = cb || false;
      opts = opts || {};
      opts.followRedirects = typeof opts.followRedirects === undefined ? true : opts.followRedirects;
      if (url === false) return;
      const req = new XMLHttpRequest();
      req.withCredentials = opts.withCredentials || false;
      req.requestContentType = opts.requestContentType || null;

      function onReadyStateChangeCallback() {
        if (req.readyState !== 4) return;
        const strUtils = StringUtils(req.status);

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

    const Noop = function () {};

    const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    const Log = function (t) {
      if (localStorage.getItem("MirezPlayerDebug") === null) return Noop;
      t = t || "info";
      const colors = {
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
      let c;

      if (t in colors === false) {
        if (typeof t === "object") {
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

    const getNodeValue = function (node) {
      return node.nodeValue || node.textContent;
    };

    const getTrackingEvents = function (trackingEventsNodes) {
      const events = [];
      let eventName;
      let tmpEvent;
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

    const TrackingRequest = function (url, cb, opts) {
      url = url || false;

      cb = cb || function () {};

      opts = opts || {};
      opts.parent = opts.parent || document.body;
      if (url === false) return;
      const img = document.createElement("img");
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

    const AttachTrackingEventsToPlayer = function (events, player) {
      const videoEl = player.getVideoEl();
      const _timeupdateEvents = [];
      const _cleanup = []; // for each tracking event

      events.forEach(function (event) {
        // create a intermediate functions, so we can remove the event listeners right after firing it.
        const _OnStartEvent = function () {
          videoEl.removeEventListener("play", _OnStartEvent);
          OnStartEvent(event);
        };

        switch (event.name) {
          case "start":
            videoEl.addEventListener("play", _OnStartEvent);
            break;
        }
      });

      const _timeupdateEventsTicker = function () {
        if (_timeupdateEvents.length > 0) {
          let tue = null;
          let i = _timeupdateEvents.length;

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

        _cleanup.forEach( function (clean){
          videoEl.removeEventListener(clean.event, clean.func);
        });

        videoEl.removeEventListener("ended", _allClean);
      };

      videoEl.addEventListener("ended", _allClean);
    };

    const triggerUEL = function (player, uel, n, evt) {
      evt = evt || null;

      if (uel[n] && uel[n].length) {
        uel[n].forEach(function(cb){
          cb(evt, player, n);
        });
      }
    };

    const AttachUserEventsToPlayer = function (player, playerDataStore) {
      const events = [{
        name: "start"
      }];
      const videoEl = player.getVideoEl();
      const uel = playerDataStore.userEventListeners;

      events.forEach(function(event){
        const _OnStartEvent = function () {
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
      const playerMethod = opts.playerMethod;
      const playerDataStore = opts.playerDataStore; //const origVideoSrc = opts.playerMethod.getOriginalVideoSource();

      const __dataStore = opts;
      __dataStore.maxRedirect = 10;
      const method = {};
      let trackingEvents = [];
      let ClickTrackings = [];
      let mediaFiles = [];
      let collectedItems = {
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

      const getLinearAd = linearNode => {
        if (!linearNode) return null;

        const GetMediaFiles = () => {
          const mediaFilesNodes = linearNode.querySelectorAll("MediaFiles MediaFile");
          if (!mediaFilesNodes) return mediaFiles;
          mediaFilesNodes.forEach(mediaFileNode => {
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

        const GetMediaFileClosestTo = (k, value) => {
          Log()("Mirez-Player", "VASTParser", "Get closest media file based on " + k + ":", value);
          let mediaFile = null; // try to guess the best fit

          let i = 0;
          const len = mediaFiles.length;
          const possibleValues = [];
          let mf; // gather all available heights

          for (i = 0; i < len; i++) {
            mf = mediaFiles[i];

            if (mf.type.indexOf("mp4") !== -1) {
              possibleValues.push(parseInt(mf[k], 10));
            }
          }

          let closestValue = null;
          closestValue = ClosestInArray(possibleValues, value);
          mediaFiles.forEach(mf => {
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
        const xmlDoc = xml.documentElement;
        const wrapper = xmlDoc.querySelector("Wrapper");
        let adVerifications = xmlDoc.querySelectorAll("AdVerifications Verification");
        const errorPixels = xmlDoc.querySelectorAll("Error");
        const impression = xmlDoc.querySelectorAll("Impression");
        const impressions = xmlDoc.querySelectorAll("Impressions");

        const _ClickTrackings = xmlDoc.querySelectorAll("ClickTracking");

        const trackingEventsNodes = xmlDoc.querySelectorAll("TrackingEvents Tracking");

        if (xml !== null) {
          let i = __dataStore.maxRedirect--;
          Log()("Mirez-Player", "VASTParser", i + " VAST URL: ", url);
          Log()("Mirez-Player", "VASTParser", "VAST Document:", xml.cloneNode(true));
        } else {
          method.Reset();
        }


        if (errorPixels && errorPixels.length) {
          errorPixels.forEach(errorPixel => {
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
          _ClickTrackings.forEach(_ClickTracking => {
            ClickTrackings.push(getNodeValue(_ClickTracking));
          });

          Log()("Mirez-Player", "VASTParser", "Click Tracking: ", ClickTrackings);
        } //Push Tracking Event


        trackingEvents.push(getTrackingEvents(trackingEventsNodes));
        Log()("Mirez-Player", "VASTParser", " Tracking Events: ", trackingEvents); // Ad Verification

        if (adVerifications.length > 0) ; // InLine


        if (!wrapper) {
          Log()("Mirez-Player", "VASTParser", " Finish: ", "Wrapper End");
          const creatives = xmlDoc.querySelectorAll("Creatives Creative");

          if (creatives.length === 0) {
            method.Reset();
            return;
          }

          let linearAd = null;
          let linearNode = null; //#######################################################################

          creatives.forEach(creative => {
            if (!creative.querySelector("Linear")) return;
            linearNode = creative.querySelector("Linear");

            const _ClickThrough = linearNode.querySelector("ClickThrough");
            linearAd = getLinearAd(linearNode);
            Log()("Mirez-Player", "VASTParser", "Possible media files:", linearAd.GetMediaFiles());
          });

          if (linearAd) {
            AttachUserEventsToPlayer(playerMethod, playerDataStore);
            trackingEvents.forEach(te => {
              AttachTrackingEventsToPlayer(te, playerMethod);
            }); //triggerUEL();

            const videoEl = opts.playerMethod.getVideoEl();
            const mediaFile = linearAd.GetMediaFileClosestTo("height", opts.playerMethod.getHeight()); // VPAID

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


        let vastTagUri = wrapper.querySelector("VASTAdTagURI").textContent;

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

    const VASTParserHandle = function (opts) {
      opts = opts || {};
      if (!opts.playerMethod.getPreRollTag()) return console.log("VAST Tag is not present");
      opts.vastParser = new VASTParser({
        playerMethod: opts.playerMethod,
        playerDataStore: opts.playerDataStore
      });
      opts.vastParser.Read(opts.playerMethod.getPreRollTag());
    };

    const VASTPlayer = function (domNode) {
      Log()("Mirez-Player", "VASTPlayer", "DOMNode", domNode);

      const __self = this;

      const __dataStore = {
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

      this.getEl = () => __dataStore.el;

      this.getPreRollTag = () => __dataStore.prerollTag;

      this.getVideoEl = () => __dataStore.videoEl;

      this.getLoader = () => __dataStore.loader;

      this.getPlayIcon = () => __dataStore.playIcon;

      this.getClickArea = () => __dataStore.playIcon;

      this.getSoundIcon = () => __dataStore.soundIcon;

      this.getSoundAnimIcon = () => __dataStore.soundAnimIcon;

      this.getHeight = () => __dataStore.el.offsetHeight;

      this.getCurrentTime = () => Math.floor(__dataStore.videoEl.currentTime); // Setter


      this.setVastIsParsed = () => __dataStore.vastIsParsed = true;

      this.setDefaultPlaybackRateForAds = () => {
        this.getVideoEl().playbackRate = __dataStore.defaultPlaybackRateForAds;
        this.getVideoEl().defaultPlaybackRate = __dataStore.defaultPlaybackRateForAds;
        return this;
      };

      this.setAnimSound = () => {
        this.getSoundAnimIcon()[0].classList.remove("none");
        this.getSoundAnimIcon()[1].classList.remove("none");
        this.getSoundAnimIcon()[2].classList.remove("none");
      };

      this.setAnimSoundNone = () => {
        this.getSoundAnimIcon()[0].classList.add("none");
        this.getSoundAnimIcon()[1].classList.add("none");
        this.getSoundAnimIcon()[2].classList.add("none");
      }; // Is


      this.isPaused = () => __dataStore.videoEl.paused;

      this.isPlayingAd = () => __dataStore.isPlayingAd;

      this.isFirstStart = () => __dataStore.isFirstStart; // hide || show


      this.hideLoader = () => {
        this.getLoader().classList.remove("show");
        this.getLoader().classList.add("hide");
      };

      this.showLoader = () => {
        this.getLoader().classList.remove("hide");
        this.getLoader().classList.add("show");
      };

      this.hidePlayIcon = () => {
        this.getPlayIcon().classList.remove("show");
        this.getPlayIcon().classList.add("hide");
      };

      this.showPlayIcon = () => {
        this.getPlayIcon().classList.remove("hide");
        this.getPlayIcon().classList.add("show");
      };

      this.showAdIsPlaying = type => {
        this.setDefaultPlaybackRateForAds();
        __dataStore.isPlayingAd = true;
        this.getEl().classList.add("playing-ad"); //this.getAdsRemainingTimeContainerEl().classList.remove("hidden");

        if (type) this.getEl().classList.add("ad-" + type);
      };

      this.hideSoundIcon = () => {
        this.getSoundIcon().classList.remove("show");
        this.getSoundIcon().classList.add("hide");
      };

      this.showSoundIcon = () => {
        this.getSoundIcon().classList.remove("hide");
        this.getSoundIcon().classList.add("show");
      }; // addEventListener


      __self.getVideoEl().addEventListener("play", evt => {
        __dataStore.userEventListeners.play.forEach(cb => {
          cb(evt, __self, "play");
        });

        if (__self.isFirstStart() === true) {
          __dataStore.userEventListeners.firstStart.forEach(cb => {
            cb(evt, __self, "firstStart");
          });

          console.log("FirstStart");
        }

        if (__self.isPlayingAd() !== false && __self.getCurrentTime() > 0) {
          __dataStore.userEventListeners.contentVideoResume.forEach(cb => {
            cb(evt, __self, "contentVideoResume");
          });

          console.log("contentVideoResume");
        }

        __dataStore.isFirstStart = false;
      });

      this.addEvent = function () {
        const player = __dataStore.videoEl;
        const playerContent = __dataStore.contentEl;
        playerContent.addEventListener("click", evt => {
          evt.preventDefault();
          let target = evt.target;
          const clicktarget = evt.target;

          switch (clicktarget.getAttribute("data-clicktarget")) {
            case "click-area":
              break;

            case "play-icon-cell":
              this.hidePlayIcon();
              player.play();
              break;

            case "play-icon":
              this.hidePlayIcon();
              this.showSoundIcon();
              player.play();
              break;

            case "click-sound":
              if (player.muted === true) {
                player.muted = false;
                this.setAnimSoundNone();
              } else {
                player.muted = true;
                this.setAnimSound();
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

    const PlayerFramework = function () {
      //new Object
      const pub = {};

      pub.enableDebugMode = () => window.localStorage.setItem("MirezPlayerDebug", 1);

      pub.disableDebugMode = () => window.localStorage.removeItem("MirezPlayerDebug");

      pub.initVASTPlayer = function () {
        const domNode = document.querySelector(".mirez-player");
        const r = new VASTPlayer(domNode);
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

    (() => {
      const playerFramework = "mirezplayer";
      window[playerFramework] = new PlayerFramework();
    })();

})));
