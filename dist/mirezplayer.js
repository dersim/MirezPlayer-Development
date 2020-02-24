(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const PlayerFramework$1 = function () {
      console.log("PlayerFramework"); //new Object

      const pub = {};

      pub.Init = function () {
        console.log("Init");
        const player = document.querySelectorAll(".mirez-player");
        const createPlayer = new PlayerFramework(player);
        return createPlayer;
      };

      return pub;
    };

    (() => {
      const playerFramework = "mirezplayer";
      window[playerFramework] = new PlayerFramework$1();
    })();

})));
