const Videoplayer = function(domNode) {
    console.log(domNode);
    const __self = this;
    const __dataStore = {
        el: domNode,
        isPlayingAd: false,
        vastPrerollTag: domNode.getAttribute("data-vast-preroll-adtag")
    };

    console.log(__dataStore.vastPrerollTag);
}

export default Videoplayer;