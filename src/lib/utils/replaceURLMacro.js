const replaceURLMacro = function (url) {
    if (url.indexOf("[TIMESTAMP]") !== -1) {
        const unix_timestamp = Date.now();
        url = url.replace("[TIMESTAMP]", unix_timestamp);
    }
    if (url.indexOf("%%CACHEBUSTER%%") !== -1) {
        const unix_timestamp = Date.now();
        url = url.replace("%%CACHEBUSTER%%", unix_timestamp);
    }
    if (url.indexOf("[CACHEBUSTER]") !== -1){
        const unix_timestamp = Date.now();
        url = url.replace("[CACHEBUSTER]", unix_timestamp);
    }
    return url;
}
export default replaceURLMacro;