(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const Videoplayer = function (domNode) {
      console.log(domNode);

      const __dataStore = {
        el: domNode,
        isPlayingAd: false,
        vastPrerollTag: domNode.getAttribute("data-vast-preroll-adtag")
      };
      console.log(__dataStore.vastPrerollTag);
    };

    const PlayerFramework = function () {
      console.log("PlayerFramework"); // new array object

      const pub = {};

      pub.New = domNode => {
        const p = new Videoplayer(domNode);

        return p;
      };

      pub.Init = function () {
        console.log("Init");
        const player = document.querySelectorAll(".mirez-player");
        pub.New(player[0]);
      };

      return pub;
    };

    (() => {
      const playerFramework = "mirezplayer";
      window[playerFramework] = new PlayerFramework();
    })();

})));
