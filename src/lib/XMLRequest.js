import LogInspector from "./LogInspector";

function StringUtils(str) {
    str = new String(str);
    function startsWith(needle) {
        return str.indexOf(needle) === 0;
    }
    return {
        startsWith: startsWith
    };
}

function XMLRequest(url, cb, opts) {
    url = url || false;
    cb = cb || false;
    opts = opts || {};
    opts.followRedirects =
        typeof opts.followRedirects === undefined ? true : opts.followRedirects;
    if (url === false) return;
    const req = new XMLHttpRequest();
    req.withCredentials = opts.withCredentials || false;
    req.requestContentType = opts.requestContentType || null;

    function onReadyStateChangeCallback() {
        if (req.readyState !== 4) return;
        const strUtils = StringUtils(req.status);
        if (strUtils.startsWith(30)) {
            return new XMLRequest(url, cb, opts);
        }
        if (req.status !== 200) return cb(req, {});
        cb(false, req);
    }

    function run() {
        if (req) {
            req.open("GET", url, true);
            req.timeout = 2000;
            req.ontimeout = function(e){
                console.log("timeout");
                LogInspector("Timeout of VAST URI: ", url);
            }
            req.responseType = opts.responseType || "";
            if (cb) {
                req.onerror = function(e) {
                    LogInspector("VAST URI is incorrect: " + url);
                    cb(e, {});
                };
                req.onreadystatechange = onReadyStateChangeCallback;
            }
            req.send();
        }
    }
    run();
}

export default XMLRequest;