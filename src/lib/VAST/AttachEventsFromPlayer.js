import TrackingRequest from "../TrackingRequest";
import Log from "../Log";
import LogInspector from "../LogInspector";


function OnStartEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

function OnPauseEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

function OnResumeEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

function OnCompleteEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

function OnFirstQuartileEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

function OnThirdQuartileEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

function OnMidpointEvent(event) {
    Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
    LogInspector(event.name + ": ", event.url);
    TrackingRequest(event.url);
}

const AttachEventsFromPlayer = function(events, playerMethod) {
    const player = playerMethod.getVideoEl();
    const _timeupdateEvents = [];
    const _cleanup = [];
    // for each tracking event
    events.forEach(function (event) {
        // create a intermediate functions, so we can remove the event listeners right after firing it.
        const _OnStartEvent = function() {
            player.removeEventListener("play", _OnStartEvent);
            OnStartEvent(event);
        };
        const _OnPauseEvent = function() {
            if (player.currentTime >= player.duration || player.currentTime <= 0)
                return;
            OnPauseEvent(event);
        };
        const _OnResumeEvent = function() {
            if (player.currentTime <= 0.5) return;
            OnResumeEvent(event);
        };
        const _OnCompleteEvent = function() {
            OnCompleteEvent(event);
        };
        const _OnFirstQuartileEvent = function() {
            OnFirstQuartileEvent(event);
        };
        const _OnMidpointEvent = function() {
            OnMidpointEvent(event);
        };
        const _OnThirdQuartileEvent = function() {
            OnThirdQuartileEvent(event);
        };
        switch (event.name) {
            case "start":
                player.addEventListener("play", _OnStartEvent);
                break;
            case"pause":
                _cleanup.push({
                    event: "pause",
                    func: _OnPauseEvent
                });
                player.addEventListener("pause", _OnPauseEvent);
                break;
            case "resume":
                _cleanup.push({
                    event: "play",
                    func: _OnResumeEvent
                });
                player.addEventListener("play", _OnResumeEvent);
                break;
            case "mute":
                player.addEventListener("volumechange", function() {
                    if(player.muted === false) {
                        Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
                        LogInspector(event.name + ": ", event.url);
                        TrackingRequest(event.url);
                    }
                });
                break;
            case "unmute":
                player.addEventListener("volumechange", function() {
                    if(player.muted === true){
                        Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
                        LogInspector(event.name + ": ", event.url);
                        TrackingRequest(event.url);
                    }
                });
                break;
            case "complete":
                _cleanup.push({
                    event: "ended",
                    func: _OnCompleteEvent
                });
                player.addEventListener("ended", _OnCompleteEvent);
                break;
            case "midpoint":
                _timeupdateEvents.push({
                    callback: _OnMidpointEvent,
                    time: function() {
                        return player.duration / 2;
                    }
                });
                break;
            case "firstQuartile":
                _timeupdateEvents.push({
                    callback: _OnFirstQuartileEvent,
                    time: function() {
                        return player.duration / 4;
                    }
                });
                break;
            case "thirdQuartile":
                _timeupdateEvents.push({
                    callback: _OnThirdQuartileEvent,
                    time: function() {
                        return (player.duration / 4) * 3;
                    }
                });
                break;
            case "progress":
                // the offset is based on a percentage value
                // so we need to calculate the value now
                if (event.offset.indexOf("%") !== -1) {
                    _timeupdateEvents.push({
                        callback: function() {
                            Log()("Mirez-Player", "VASTParser", "Event", event.name, event.url);
                            LogInspector(event.name + ": ", event.url);
                            TrackingRequest(event.url);
                        },
                        time: function() {
                            return (player.duration / 100) * parseInt(event.offset, 10);
                        }
                    });
                }
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
                if (player.currentTime >= tue.time()) {
                    tue.callback();
                    _timeupdateEvents.splice(i, 1);
                }
            }
        }
    };

    player.addEventListener("timeupdate", _timeupdateEventsTicker);

    const _allClean = () => {
        player.removeEventListener("timeupdate", _timeupdateEventsTicker);
        _cleanup.forEach(clean => {
            player.removeEventListener(clean.event, clean.func);
        });
        player.removeEventListener("ended", _allClean);
    };

    player.addEventListener("ended", _allClean);
};

export default AttachEventsFromPlayer;