import replaceURLMacro from "./lib/utils/replaceURLMacro";
import XMLRequest from "./lib/XMLRequest";
import Log from "./lib/Log";
import Noop from    "./lib/Noop";
import getNodeValue from "./lib/VAST/getNodeValue";
import getTrackingEvents from "./lib/VAST/getTrackingEvents";
import AttachTrackingEventsToPlayer from "./lib/VAST/TrackingEvents/AttachTrackingEventsToPlayer";
import AttachUserEventsToPlayer from "./lib/VAST/TrackingEvents/AttachUserEventsToPlayer";


function VASTParser(opts) {
    opts = opts || {};
    const playerMethod = opts.playerMethod;
    const playerDataStore = opts.playerDataStore;
    //const origVideoSrc = opts.playerMethod.getOriginalVideoSource();
    const __dataStore = opts;
    __dataStore.maxRedirect = 10;

    const method = {};

    let trackingEvents = [];
    let ClickTrackings = [];
    let mediaFiles = [];
    let collectedItems = {errors: [],impressions: [],creatives: []};

    method.Reset = function(){
        trackingEvents = [];
        ClickTrackings = [];
        mediaFiles = [];
        collectedItems = {
            errors: [],
            impressions: [],
            creatives: []
        };
    }

    const getLinearAd = linearNode => {
        if (!linearNode) return null;
        const GetMediaFiles = () => {
            const mediaFilesNodes = linearNode.querySelectorAll(
                "MediaFiles MediaFile"
            );
            if (!mediaFilesNodes) return mediaFiles;
            mediaFilesNodes.forEach(mediaFileNode => {
                mediaFiles.push({
                    src: mediaFileNode.textContent || mediaFileNode.src || "",
                    delivery: mediaFileNode.getAttribute("delivery") || null,
                    type: mediaFileNode.getAttribute("type") || null,
                    width: mediaFileNode.getAttribute("width") || null,
                    bitrate: mediaFileNode.getAttribute("bitrate") || null,
                    height: mediaFileNode.getAttribute("height") || null
                });
            });
            return mediaFiles;
        };

        const GetMediaFileClosestTo = (k, value) => {
            Log()("Mirez-Player", "VASTParser", "Get closest media file based on " + k + ":", value);
            let mediaFile = null;

            // try to guess the best fit
            let i = 0;
            const len = mediaFiles.length;
            const possibleValues = [];
            let mf;

            // gather all available heights
            for (i = 0; i < len; i++) {
                mf = mediaFiles[i];
                if (mf.type.indexOf("mp4") !== -1) {
                    possibleValues.push(parseInt(mf[k], 10));
                }
            }

            let closestValue = null;

            closestValue = ClosestInArray(possibleValues, value);

            mediaFiles.forEach(mf => {
                // VPAID, exit early
                if (mf.type === "application/javascript") {
                    mediaFile = mf;
                    return false;
                }
                if (mf.type.indexOf("mp4") !== -1) {
                    if (parseInt(mf[k], 10) === closestValue) {
                        mediaFile = mf;
                        return false;
                    }
                }
            });
            Log()("Mirez-Player","VASTParser","Selected media file:", mediaFile);
            return mediaFile;
        };

        return {
            GetMediaFiles: GetMediaFiles,
            GetMediaFileClosestTo: GetMediaFileClosestTo
        };
    };

    function ClosestInArray(array, num) {
        var i = 0;
        var minDiff = 1000;
        var ans;
        for (i in array) {
            var m = Math.abs(num - array[i]);
            if (m < minDiff) {
                minDiff = m;
                ans = array[i];
            }
        }
        return ans;
    }

    method.Parse = function(xml, url){
        let errorCode;

        const xmlDoc = xml.documentElement;
        const wrapper = xmlDoc.querySelector("Wrapper");
        let adVerifications = xmlDoc.querySelectorAll("AdVerifications Verification");
        const errorPixels = xmlDoc.querySelectorAll("Error");
        const impression = xmlDoc.querySelectorAll("Impression");
        const impressions = xmlDoc.querySelectorAll("Impressions");
        const _ClickTrackings = xmlDoc.querySelectorAll("ClickTracking");
        const trackingEventsNodes = xmlDoc.querySelectorAll("TrackingEvents Tracking");

        if(xml !== null){
            let i = __dataStore.maxRedirect--;
            Log()("Mirez-Player", "VASTParser", i + " VAST URL: ", url);
            Log()("Mirez-Player", "VASTParser", "VAST Document:", xml.cloneNode(true));
        }else{
            method.Reset();
            errorCode = 301;
        }

        if(!xmlDoc){
            errorCode = 303;
        }

        // Push Error
        if(errorPixels && errorPixels.length){
            errorPixels.forEach(errorPixel =>{
                collectedItems.errors.push(errorPixel.textContent);
            });
            Log()("Mirez-Player", "VASTParser", "Error Pixel: ", collectedItems.errors);
        }

        // Push Impression
        if (impression && impression.length || impressions && impressions.length) {
            impression.forEach(function(imp) {
                if (imp.textContent && imp.textContent.length) {
                    collectedItems.impressions.push(imp.textContent);
                }
            });
            Log()("Mirez-Player", "VASTParser","Impression Pixel: ", collectedItems.impressions);
        }

        // Push Click Tacking
        if (_ClickTrackings) {
            _ClickTrackings.forEach(_ClickTracking => {
                ClickTrackings.push(getNodeValue(_ClickTracking));
            });
            Log()("Mirez-Player", "VASTParser", "Click Tracking: ", ClickTrackings);
        }
        //Push Tracking Event
        trackingEvents.push(getTrackingEvents(trackingEventsNodes));
        Log()("Mirez-Player", "VASTParser", " Tracking Events: ", trackingEvents);

        // Ad Verification
        if(adVerifications.length > 0){}

        // InLine
        if(!wrapper){
            Log()("Mirez-Player", "VASTParser", " Finish: ", "Wrapper End");
            const creatives = xmlDoc.querySelectorAll("Creatives Creative");
            if(creatives.length === 0){
                errorCode = 303;
                method.Reset();
                return;
            }

            let linearAd = null;
            let linearNode = null;

            //#######################################################################
            creatives.forEach(creative =>{
                if(!creative.querySelector("Linear")) return;
                linearNode = creative.querySelector("Linear");
                const _ClickThrough = linearNode.querySelector("ClickThrough");
                if(_ClickThrough){

                };

                linearAd = getLinearAd(linearNode);
                Log()("Mirez-Player", "VASTParser", "Possible media files:", linearAd.GetMediaFiles());
            });

            if(linearAd){
                AttachUserEventsToPlayer(playerMethod, playerDataStore);

                trackingEvents.forEach(te =>{
                    AttachTrackingEventsToPlayer(te, playerMethod, playerDataStore);
                });

                //triggerUEL();

                const videoEl = opts.playerMethod.getVideoEl();
                const mediaFile = linearAd.GetMediaFileClosestTo("height", opts.playerMethod.getHeight());
                // VPAID
                if (mediaFile.type === "application/javascript") {
                    Log()("Mirez-Player", "VASTParser", "Linear Node:", linearNode);
                    return;
                } else {
                    videoEl.src = mediaFile.src;
                    opts.playerMethod.hideLoader();
                }
                opts.playerMethod.showAdIsPlaying("preroll");

            }

            return;
        }

        //#############################################################################

        let vastTagUri = wrapper.querySelector("VASTAdTagURI").textContent;
        if(vastTagUri){
            method.Read(vastTagUri);
        }
    };

    method.Read = function(url) {
        var url = replaceURLMacro(url);
        new XMLRequest(
            url,
            function(err, res) {
                if (err) {
                    //handleAjaxRequestErrors(err);
                    //opts.onParsingDoneCallback();
                    return;
                }
                new method.Parse(res.responseXML, url);
            },
            {
                requestContentType: "document"
                // withCredentials: true
            }
        );
    };

    return method;
}

export default VASTParser;