import Videoplayer from "./Videoplayer";

const PlayerFramework = function() {
    console.log("PlayerFramework");

    console.log("test");

    //new Object
    const pub = {};

    pub.Init = function () {
        console.log("Init");
        const player = document.querySelectorAll(".mirez-player");

        const createPlayer = new Videoplayer(player);

        return createPlayer;
    }

    return pub;
}

export default PlayerFramework;