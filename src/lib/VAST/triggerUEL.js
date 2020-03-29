const triggerUEL = function(player, uel, n, evt){
    console.log("triggerUEL");
    console.log(player);
    console.log(uel);
    console.log(n);
    console.log(uel[n]);
    evt = evt || null;
    if (uel[n] && uel[n].length) {

        uel[n].forEach(cb => {
            cb(evt, player, n);
        });
    }
};

export default triggerUEL;