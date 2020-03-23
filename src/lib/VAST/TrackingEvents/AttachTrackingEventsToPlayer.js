import TrackingRequest from "./TrackingRequest";
import Log from "../../Log";

function OnStartEvent(event) {
    Log()("TOnlineMediplayer", "VASTParser", "Event", event.name, event.url);
    TrackingRequest(event.url);
}

const AttachTrackingEventsToPlayer = function(events, player) {
    const videoEl = player.getVideoEl();
    const _timeupdateEvents = [];
    const _cleanup = [];
    // for each tracking event
    events.forEach(function (event) {
        // create a intermediate functions, so we can remove the event listeners right after firing it.
        const _OnStartEvent = function() {
            videoEl.removeEventListener("play", _OnStartEvent);
            OnStartEvent(event);
        };

        switch (event.name) {
            case "start":
                videoEl.addEventListener("play", _OnStartEvent);
                break;
            default:
                break;
        }
    });

    const _timeupdateEventsTicker = function() {
        if (_timeupdateEvents.length > 0) {
            let tue = null;
            let i = _timeupdateEvents.length;
            while (i--) {
                tue = _timeupdateEvents[i];
                if (videoEl.currentTime >= tue.time()) {
                    tue.callback();
                    _timeupdateEvents.splice(i, 1);
                }
            }
        }
    };

    videoEl.addEventListener("timeupdate", _timeupdateEventsTicker);

    const _allClean = () => {
        videoEl.removeEventListener("timeupdate", _timeupdateEventsTicker);
        _cleanup.forEach(clean => {
            videoEl.removeEventListener(clean.event, clean.func);
        });
        videoEl.removeEventListener("ended", _allClean);
    };

    videoEl.addEventListener("ended", _allClean);
};

export default AttachTrackingEventsToPlayer;