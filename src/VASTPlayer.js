import VASTParserHandle from "./VASTParserHandle";
import Log from "./lib/Log";
import isMobile from "./lib/isMobile";

const VASTPlayer = function(domNode) {
Log()("Mirez-Player", "VASTPlayer", "DOMNode", domNode);
const __self = this;
const __dataStore = {
el: domNode,
videoEl: domNode.querySelector("video"),
contentEl: domNode.querySelector(".mirez-content"),
loader: domNode.querySelector(".mirez-loader"),
landingPageArea: domNode.querySelector(".landing-page-area"),
playIcon: domNode.querySelector(".play-icon-area"),
soundIcon:  domNode.querySelector(".mirez-sound-area"),
soundAnimIcon: domNode.querySelectorAll(".line"),
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
};

// Getter
this.getEl = () => __dataStore.el;
this.getPreRollTag = () => __dataStore.prerollTag;
this.getVideoEl = () => __dataStore.videoEl;
this.getLoader = () => __dataStore.loader;
this.getLandingPageArea = () => __dataStore.landingPageArea;
this.getPlayIcon = () => __dataStore.playIcon;
this.getSoundIcon = () => __dataStore.soundIcon;
this.getSoundAnimIcon = () => __dataStore.soundAnimIcon;
this.getVPaidArea = () => __dataStore.vpaidArea;
this.getHeight = () => __dataStore.el.offsetHeight;
this.getWidth = () => __dataStore.el.offsetWidth;
this.getCurrentTime = () => Math.floor(__dataStore.videoEl.currentTime);

// Setter
this.setVastIsParsed = () => __dataStore.vastIsParsed = true;
this.setDefaultPlaybackRateForAds = () =>{
this.getVideoEl().playbackRate = __dataStore.defaultPlaybackRateForAds;
this.getVideoEl().defaultPlaybackRate = __dataStore.defaultPlaybackRateForAds;
return this;
};
this.setAnimSoundOn = () => {
this.getSoundAnimIcon()[0].classList.remove("none");
this.getSoundAnimIcon()[1].classList.remove("none");
this.getSoundAnimIcon()[2].classList.remove("none");
};
this.setAnimSoundOff = () => {
this.getSoundAnimIcon()[0].classList.add("none");
this.getSoundAnimIcon()[1].classList.add("none");
this.getSoundAnimIcon()[2].classList.add("none");
};
this.setSoundOn = () =>  __dataStore.videoEl.muted = true;
this.setSoundOff = () => __dataStore.videoEl.muted = false;
this.setPause = () => __dataStore.videoEl.pause();

// Is
this.isPaused = () => __dataStore.videoEl.paused;
this.isPlayingAd = () => __dataStore.isPlayingAd;
this.isFirstStart = () => __dataStore.isFirstStart;

// hide || show
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
this.showAdIsPlaying = (type) =>{
this.setDefaultPlaybackRateForAds();
__dataStore.isPlayingAd = true;
this.getEl().classList.add("playing-ad");
//this.getAdsRemainingTimeContainerEl().classList.remove("hidden");
if(type) this.getEl().classList.add("ad-" + type);
};
this.hideSoundIcon = () => {
this.getSoundIcon().classList.remove("show");
this.getSoundIcon().classList.add("hide");
};
this.showSoundIcon = () => {
this.getSoundIcon().classList.remove("hide");
this.getSoundIcon().classList.add("show");
};
this.hideLandingPageArea = () =>{
this.getLandingPageArea().classList.remove("show");
this.getLandingPageArea().classList.add("hide");
};
this.showLandingPageArea = () =>{
this.getLandingPageArea().classList.remove("hide");
this.getLandingPageArea().classList.add("show");
isMobile() ? this.getLandingPageArea().classList.add("mobile") : this.getLandingPageArea().classList.add("desktop");
};
this.showVPAIDArea = () =>{
this.getVPaidArea().classList.remove("hide");
this.getVPaidArea().classList.add("show");
};

// addEventListener
__self.getVideoEl().addEventListener("play", evt =>{
__dataStore.userEventListeners.play.forEach(cb =>{
    cb(evt, __self, "play");
});

if (__self.isFirstStart() === true) {
    __dataStore.userEventListeners.firstStart.forEach(cb => {
        cb(evt, __self, "firstStart");
    });
}
if(__self.isPlayingAd() !== false && __self.getCurrentTime() > 0){
    __dataStore.userEventListeners.contentVideoResume.forEach(cb =>{
        cb(evt, __self, "contentVideoResume");
    });
}

__dataStore.isFirstStart = false;
});


this.addEvent = function(){
const player = __dataStore.videoEl;
const playerContent = __dataStore.contentEl;
playerContent.addEventListener("click", evt =>{
    evt.preventDefault();
    const clicktarget = evt.target;
    switch (clicktarget.getAttribute("data-clicktarget")) {
        case "click-play":
            this.hidePlayIcon();
            this.showLandingPageArea();
            this.showSoundIcon();
            player.play();
            break;
        case "click-landing-page":
            this.showPlayIcon();
            this.hideLandingPageArea();
            this.hideSoundIcon();
            player.pause();
            break;
        case "click-sound":
            if(player.muted === true){
                this.setSoundOff();
                this.setAnimSoundOff()
            }else{
                this.setSoundOn();
                this.setAnimSoundOn();
            }
            break;
        default:
            break;
    }
});

player.addEventListener("ended", _evt =>{
    this.hideSoundIcon();
});

player.addEventListener("mouseover", evt =>{
    //console.log("mouseover");
});

player.addEventListener("mouseout", evt => {
    //console.log("mouseout");
});
};

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

//init
__self.parsingVastTag();
__self.addEvent();
};

export default VASTPlayer;