import PlayerFramework from "./PlayerFramework";

(() => {
    const playerFramework = "mirezplayer";
    window[playerFramework] = new PlayerFramework();
})();