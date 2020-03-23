import VASTPlayer from "./VASTPlayer";

const PlayerFramework = function() {

    //new Object
    const pub = {};

    pub.enableDebugMode = () => window.localStorage.setItem("MirezPlayerDebug", 1);
    pub.disableDebugMode = ()=> window.localStorage.removeItem("MirezPlayerDebug");
    pub.initVASTPlayer = function(){
        const domNode = document.querySelector(".mirez-player");
        const r = new VASTPlayer(domNode);
        return r;
    }


    pub.Init = function () {
        pub.initVASTPlayer();
    }

    pub.Test = function () {
        console.log("tesasdt");
    }

    return pub;
}

export default PlayerFramework;