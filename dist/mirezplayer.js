(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const PlayerFramework = function () {
      console.log("PlayerFramework");
    };

    const test = function () {
      console.log("test lib");
    };

    (() => {
      const playerFramework = "PlayerFramework";
      window[playerFramework] = new PlayerFramework();
      test();
    })();

})));
