const isTablet = function () {
    window.onload = userAgentDetect;
    function userAgentDetect() {
        if(window.navigator.userAgent.match(/Tablet/i)
            || window.navigator.userAgent.match(/iPad/i)
            || window.navigator.userAgent.match(/Nexus 7/i)
            || window.navigator.userAgent.match(/Nexus 10/i)
            || window.navigator.userAgent.match(/KFAPWI/i)) {
            document.body.className -= ' mobile';
            document.body.className += ' tablet';
            return true;
            //alert('True - Tablet - ' + navigator.userAgent);
        } else {
            return false;
            //alert('False - Tablet - ' + navigator.userAgent);
        }
    }
    return userAgentDetect();
}

export default isTablet;