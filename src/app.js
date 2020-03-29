import "./lib/polyfills/foreach.polyfill"

import PlayerFramework from "./PlayerFramework";

(() => {
    const playerFramework = "mirezplayer";
    window[playerFramework] = new PlayerFramework();
})();