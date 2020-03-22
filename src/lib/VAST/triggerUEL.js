const triggerUEL = function(player, uel, n, evt){
    evt = evt || null;
    if (uel[n] && uel[n].length) {
        uel[n].forEach(cb => {
            cb(evt, player, n);
        });
    }
};

export default triggerUEL;