import getNodeValue from "./getNodeValue";

const getTrackingEvents = function (trackingEventsNodes) {
    const events = [];
    let eventName;
    let tmpEvent;
    if (trackingEventsNodes.length === 0) return events;
    trackingEventsNodes.forEach(eventNode => {
        eventName = eventNode.getAttribute("event");
        tmpEvent = {
            name: eventName,
            url: getNodeValue(eventNode)
        };
        if (eventName === "progress") {
            tmpEvent.offset = eventNode.getAttribute("offset");
        }
        events.push(tmpEvent);
    });
    return events;
};

export default getTrackingEvents;