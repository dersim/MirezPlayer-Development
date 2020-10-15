import Noop from "./Noop";
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

let zCount = 0;

const LogInspector = function(text, url) {
    if (sessionStorage.getItem("MirezPlayerInspector") === null) return Noop;
    text = text;
    url = url || "";

    let date = new Date();
    let time = addZero(date.getHours()) +":"+ addZero(date.getMinutes()) + ":" + addZero(date.getSeconds());
    let event = document.getElementsByClassName("tabcontent")[0].children[0].children[0];
    let li = document.createElement("li");
    if((zCount % 2) == 0) li.style.background = "#c1c1c1";
    let liText = document.createTextNode(time + " " + text + " " + url);

    li.appendChild(liText);
    event.appendChild(li);

    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    zCount++;
};

export default LogInspector;