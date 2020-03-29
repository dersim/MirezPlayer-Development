const TrackingRequest = function(url, cb, opts) {
    url = url || false;
    cb = cb || function() {};
    opts = opts || {};
    opts.parent = opts.parent || document.body;
    if (url === false) return;
    const img = document.createElement("img");
    img.src = url;

    function cleanup() {
        img.parentNode.removeChild(img);
    }

    function onLoadCallback() {
        cb(false, img);
        cleanup();
    }

    function onErrorCallback() {
        cb("Error", img);
        cleanup();
    }

    function onAbortCallback() {
        cb("Abort", img);
        cleanup();
    }

    function run() {
        if (img) {
            if (cb) {
                img.onerror = onErrorCallback;
                img.onabort = onAbortCallback;
                img.onload = onLoadCallback;
            }
            opts.parent.appendChild(img);
        }
    }
    run();
};

export default TrackingRequest;