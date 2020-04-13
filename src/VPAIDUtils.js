import Log from "./lib/Log";
import Noop from "./lib/Noop";
import VASTErrorCodes from "./VASTErrorCodes";
import TrackingRequest from "./lib/TrackingRequest";

let VPAIDCreative = null;

function GetIframeDocument(ifr) {
    const ifrDoc = ifr.contentWindow && ifr.contentWindow.document;
    if (!ifrDoc) return false;
    return ifrDoc;
}

const CheckVPAIDInterface = function(VPAIDCreative) {
    if (
        VPAIDCreative.handshakeVersion &&
        typeof VPAIDCreative.handshakeVersion === "function" &&
        VPAIDCreative.initAd &&
        typeof VPAIDCreative.initAd === "function" &&
        VPAIDCreative.startAd &&
        typeof VPAIDCreative.startAd === "function" &&
        VPAIDCreative.stopAd &&
        typeof VPAIDCreative.stopAd === "function" &&
        VPAIDCreative.skipAd &&
        typeof VPAIDCreative.skipAd === "function" &&
        VPAIDCreative.resizeAd &&
        typeof VPAIDCreative.resizeAd === "function" &&
        VPAIDCreative.pauseAd &&
        typeof VPAIDCreative.pauseAd === "function" &&
        VPAIDCreative.resumeAd &&
        typeof VPAIDCreative.resumeAd === "function" &&
        VPAIDCreative.expandAd &&
        typeof VPAIDCreative.expandAd === "function" &&
        VPAIDCreative.collapseAd &&
        typeof VPAIDCreative.collapseAd === "function" &&
        VPAIDCreative.subscribe &&
        typeof VPAIDCreative.subscribe === "function" &&
        VPAIDCreative.unsubscribe &&
        typeof VPAIDCreative.unsubscribe === "function"
    ) {
        return true;
    }
    return false;
};

const checkIfrLoaded = function(cw, cb) {
    const c = cw.__LOADED;
    cb = cb || Noop;
    if (c && c === true) {
        const fn = cw.getVPAIDAd;
        if (fn && typeof fn === "function") {
            VPAIDCreative = fn();
            if (CheckVPAIDInterface(VPAIDCreative)) {
                cb(false, VPAIDCreative);
            } else {
                cb("No valid VPAID", {});
            }
        } else {
            Log("error")(
                "Mirez-Player",
                "VPAIDUtils",
                "iframe has been fully loaded, but getVPAIDAd is not a fn, but this:",
                fn
            );
        }
    } else {
        setTimeout(() => {
            checkIfrLoaded(cw, cb);
        }, 200);
    }
};

function CreateIframe(url, currentAd, player, playerDataStore, opts) {
    const ifr = document.createElement("iframe");
    ifr.href = "about:blank";
    ifr.setAttribute(
        "style",
        "height:1px;width:1px;border:0 none;position:absolute;top:-10px;left:-10px;"
    );
    ifr.id = "VPAIDAdLoaderFrame" + Date.now();
    const onIframeWriteCb = function() {
        const cw = ifr.contentWindow;
        checkIfrLoaded(cw, (VPAIDCreativeErr, VPAIDCreative) => {
            if (VPAIDCreativeErr) {
                Log("error")(
                    "MirezPlayer",
                    "VPAIDUtils",
                    VPAIDCreativeErr,
                    VPAIDCreative
                );
                return;
            }
            Log()("Mirez-Player", "VPAIDUtils", "VPAID is", VPAIDCreative);
            Log()("Mirez-Player", "VPAIDUtils", "VPAID currentAd", currentAd);

            //const origVideoSrc = player.GetOriginalVideoSource();

            //player.ShowAdIsPlaying("preroll");

            function _onfullscreenchange(evt) {
                Log()("Mirez-Player", "VPAIDUtils", "fullscreenchange", evt);
                VPAIDCreative.resizeAd(player.getWidth(), player.getHeight(), "normal");
            }

            function _onorientationchange(evt) {
                setTimeout(function() {
                    VPAIDCreative.resizeAd(
                        player.getWidth(),
                        player.getHeight(),
                        "normal"
                    );
                }, 500);
            }

            //player.GetEl().addEventListener("fullscreenchange", _onfullscreenchange);
            //window.addEventListener("orientationchange", _onorientationchange);

            /*
            function _cleanupListeners() {
                player
                    .GetEl()
                    .removeEventListener("fullscreenchange", _onfullscreenchange);
                window.removeEventListener("orientationchange", _onorientationchange);
            }
            */

            function onInit() {
                Log()("Mirez-Player", "VPAIDUtils", "VPAID onInit");
                //player.HideLoadingSpinner();
                //player.HidePosterImage();
                player.hideLoader();
                player.showVPAIDArea();
                player.showSoundIcon();
                player.setSoundOn();
                VPAIDCreative.startAd();
            }

            /*
            function ResumeOrigVideo() {
                _cleanupListeners();
                const videoEl = player.GetVideoEl();
                // it seems as if some vpaid spots restore the origVideoSrc by themselves
                if (videoEl.src !== origVideoSrc.src) {
                    videoEl.src = origVideoSrc.src;
                    player.Play();
                } else {
                    // some of them even fire the play event again?!
                    if (!player.IsPlaying()) {
                        player.Play();
                    }
                }
                player.HideAdIsPlaying("preroll");
                // Generate a clean clickJackingOverlayEl
                player.CleanClickjackingOverlay();
            }*/

            function onVideoComplete() {
                Log()("Mirez-Player", "VPAIDUtils", "VPAID onVideoComplete");
                //ResumeOrigVideo();
            }

            function onAdSkipped() {
                Log()("Mirez-Player", "VPAIDUtils", "VPAID Ad skipped");
                //ResumeOrigVideo();
            }

            function onAdStop() {
                Log()("Mirez-Player", "VPAIDUtils", "VPAID Ad stop");
                //ResumeOrigVideo();
            }

            function onAdError(e) {
                Log("error")("Mirez-Player", "VPAIDUtils", "VPAID onAdError:", e);
                const errorCode = 405;
                playerDataStore.userEventListeners.adError.forEach(cb => {
                    cb(errorCode, VASTErrorCodes[errorCode], e);
                });
                Log("error")(
                    "Mirez-Player",
                    "VPAIDUtils",
                    VASTErrorCodes[errorCode],
                    e
                );
                //@TODO
                // Track AdError and kill all other AdTracking-Events
                //ResumeOrigVideo();
            }

            VPAIDCreative.on = function(n, cb) {
                this.subscribe(cb, n);
            };

            VPAIDCreative.on("AdError", onAdError);
            VPAIDCreative.on("AdLoaded", onInit);
            VPAIDCreative.on("AdSkipped", onAdSkipped);
            VPAIDCreative.on("AdStopped", onAdStop);
            VPAIDCreative.on("AdVideoComplete", onVideoComplete);
            VPAIDCreative.on(
                "AdClickThru",
                (clickThruURL, _, clickThruPlayerHandles) => {
                    if (clickThruPlayerHandles) {
                        player.setPause();
                        window.open(clickThruURL);
                    }
                    opts.clickTrackings.forEach(trackingURL => {
                        Log()("Mirez-Player","VPAIDUtils","Event","ClickThru ClickTracking", trackingURL
                        );
                        TrackingRequest(trackingURL);
                    });
                }
            );

            let adParamsTxt = "";
            const adParamsNode = currentAd.querySelector("AdParameters");
            if (adParamsNode) {
                adParamsTxt = adParamsNode.textContent;
            }

            Log()("Mirez-Player", "VPAIDUtils", "VPAID adParams", adParamsTxt);

            VPAIDCreative.initAd(
                player.getWidth(),
                player.getHeight(),
                "normal",
                -1,
                { AdParameters: adParamsTxt },
                {
                    slot: player.getVPaidArea(),
                    videoSlot: player.getVideoEl(),
                    videoSlotCanAutoPlay: false
                }
            );
        });
    };
    document.body.appendChild(ifr);
    const ifrDoc = GetIframeDocument(ifr);
    ifrDoc.write(
        "<!DOCTYPE html+" +
        ">" +
        "<he" +
        "ad><ti" +
        "tle></ti" +
        "tle></he" +
        "ad><bo" +
        "dy><script src=\"" +
        url +
        "\"></scr" +
        "ipt>" +
        "<scr" +
        "ipt>__LOADED=true;" +
        "</scr" +
        "ipt></body></html>"
    );
    onIframeWriteCb();
}

function LoadAdUnit(url, currentAd, player, playerDataStore, opts) {
    Log("error")("Mirez-Player", "VPAIDUtils", "Loading VPAID URL:", url);
    CreateIframe(url, currentAd, player, playerDataStore, opts);
}

const VPAIDUtils = {
    LoadAdUnit
};

export default VPAIDUtils;