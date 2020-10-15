import Noop from "./Noop";
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

const LogInspector = function(text, url) {
    if (sessionStorage.getItem("MirezPlayerInspector") === null) return Noop;
    text = text;
    url = url || "";

    let date = new Date();
    let time = date.getHours() +":"+ date.getMinutes() + ":" + addZero(date.getSeconds());
    let event = document.getElementsByClassName("tabcontent")[0].children[0].children[0];
    let li = document.createElement("li");
    let liText = document.createTextNode(time + " " + text + " " + url);

    li.appendChild(liText);
    event.appendChild(li);

    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

};

export default LogInspector;