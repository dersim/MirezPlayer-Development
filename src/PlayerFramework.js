import Videoplayer from "./Videoplayer";

const PlayerFramework = function() {
    console.log("PlayerFramework");

    // new array object
    const _videoplayers = [];

    //new Object
    const pub = {};

    pub.New = domNode => {
        const p = new Videoplayer(domNode);
        if (p) {
            _videoplayers.push(p);
        }
        return p;
    };


    pub.Init = function () {
        console.log("Init");

        let i = 0;
        const player = document.querySelectorAll(".mirez-player");

        pub.New(player[0]);
    }

    return pub;
}

export default PlayerFramework;