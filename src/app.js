import PlayerFramework from "./PlayerFramework";
import test from "../lib/test";

(() => {
    const playerFramework = "PlayerFramework";
    window[playerFramework] = new PlayerFramework();
    test();
})();