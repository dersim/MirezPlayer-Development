import Noop from "./Noop";
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

const Log = function(t) {
    if (localStorage.getItem("MirezPlayerDebug") === null) return Noop;
    t = t || "info";
    const colors = {
        info: {
            bg: "#19cf85",
            fg: "#272b30"
        },
        warn: {
            bg: "#ffd866",
            fg: "#272b30"
        },
        debug: {
            bg: "#3c92d1",
            fg: "#272b30"
        },
        error: {
            bg: "#ff6188",
            fg: "#272b30"
        }
    };
    let c;
    if (t in colors === false) {
        if (typeof t === "object") {
            c = {
                fg: t.fg || "#777",
                bg: t.bg || "transparent"
            };
        } else {
            c = colors.info;
        }
    } else {
        c = colors[t];
    }
    return (desc, ...logs) => {
        if (isIE11) {
            window.console.log(desc, ...logs);
        } else {
            window.console.log(
                "%c" + desc,
                "color:" + c.fg + ";background:" + c.bg + ";",
                ...logs
            );
        }
    };
};

export default Log;