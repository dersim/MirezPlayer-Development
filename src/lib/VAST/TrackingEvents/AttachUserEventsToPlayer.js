import triggerUEL from "../triggerUEL";

const AttachUserEventsToPlayer = function (player, playerDataStore) {
    const events = [
        {
            name: "start"
        }
    ];
    const videoEl = player.getVideoEl();
    const uel = playerDataStore.userEventListeners;
    const _cleanup = [];
    // user events
    events.forEach(event => {
        const _OnStartEvent = function() {
            if (!player.isPlayingAd()) return;
            if (videoEl.currentTime > 1) return;
            triggerUEL(player, uel, "adStart");
        };
        switch (event.name) {
            case "start":
                _cleanup.push({
                    event: "play",
                    func: _OnStartEvent
                });
                videoEl.addEventListener("play", _OnStartEvent);
                break;
            default:
                break;
        }
    });
};

export default AttachUserEventsToPlayer;