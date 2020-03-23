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

    return function (desc) {
        for (var _len = arguments.length, logs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            logs[_key - 1] = arguments[_key];
        }

        if (isIE11) {
            var _window$console;

            (_window$console = window.console).log.apply(_window$console, [desc].concat(logs));
        } else {
            var _window$console2;

            (_window$console2 = window.console).log.apply(_window$console2, ["%c" + desc, "color:" + c.fg + ";background:" + c.bg + ";"].concat(logs));
        }
    };
};

export default Log;