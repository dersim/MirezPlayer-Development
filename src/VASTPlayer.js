import VASTParserHandle from "./VASTParserHandle";
import Log from "./lib/Log";

const VASTPlayer = function(domNode) {
    Log()("Mirez-Player", "VASTPlayer", "DOMNode", domNode);
    const __self = this;
    const __dataStore = {
        el: domNode,
        loader: domNode.querySelector(".mirez-loader"),
        videoEl: domNode.querySelector("video"),
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
    };

    // Getter
    this.getEl = () => __dataStore.el;
    this.getPreRollTag = () => __dataStore.prerollTag;
    this.getVideoEl = () => __dataStore.videoEl;
    this.getLoader = () => __dataStore.loader;
    this.getHeight = () => __dataStore.el.offsetHeight;
    this.getCurrentTime = () => Math.floor(__dataStore.videoEl.currentTime);

    // Setter
    this.setVastIsParsed = () => __dataStore.vastIsParsed = true;
    this.setDefaultPlaybackRateForAds = () =>{
        this.getVideoEl().playbackRate = __dataStore.defaultPlaybackRateForAds;
        this.getVideoEl().defaultPlaybackRate = __dataStore.defaultPlaybackRateForAds;
        return this;
    };

    // Is
    this.isPaused = () => __dataStore.videoEl.paused;
    this.isPlayingAd = () => __dataStore.isPlayingAd;
    this.isFirstStart = () => __dataStore.isFirstStart;

    // addEventListener
    __self.getVideoEl().addEventListener("play", event =>{
       __dataStore.userEventListeners.play.forEach(cb =>{
          cb(event, __self, "play");
       });

        if (__self.isFirstStart() === true) {
            __dataStore.userEventListeners.firstStart.forEach(cb => {
                cb(event, __self, "firstStart");
            });
            console.log("FirstStart");
        }
       if(__self.isPlayingAd() !== false && __self.getCurrentTime() > 0){
           __dataStore.userEventListeners.contentVideoResume.forEach(cb =>{
              cb(event, __self, "contentVideoResume");
           });
           console.log("contentVideoResume");
       }

       __dataStore.isFirstStart = false;
    });

    // hide || show
    this.hideLoader = () => {
        this.getLoader().classList.remove("show");
        this.getLoader().classList.add("hide");
    };
    this.showLoader = () => {
        this.getLoader().classList.remove("hide");
        this.getLoader().classList.add("show");
    };
    this.showAdIsPlaying = (type) =>{
        this.setDefaultPlaybackRateForAds();
        __dataStore.isPlayingAd = true;
        this.getEl().classList.add("playing-ad");
        //this.getAdsRemainingTimeContainerEl().classList.remove("hidden");
        if(type) this.getEl().classList.add("ad-" + type);
    }

    // Start Parsing VAST Tag
    this.parsingVastTag = function () {
        __self.showLoader();
        if(__self.isPaused() === true){
            //const videoEl = __self.getVideoEl();
            if(__dataStore.vastIsParsed === false){
                //parsingVastTag({vastTag: tag});
                VASTParserHandle({
                    playerMethod: __self,
                    playerDataStore: __dataStore
                    });
            }
        }
    };

   __self.parsingVastTag();
}

export default VASTPlayer;