const Videoplayer = function(domNode) {
    console.log(domNode);
    const __self = this;
    const __dataStore = {
        el: domNode,
        videoEl: domNode.querySelector("video"),
        isPlayingAd: false,
        vastPrerollTag: domNode.getAttribute("data-vast-preroll-adtag")
    };
}

export default PlayerFramework;