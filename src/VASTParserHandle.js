import VASTParser from "./VASTParser";

const VASTParserHandle = function(opts) {
    opts = opts || {};

    if(!opts.playerMethod.getPreRollTag()) return console.log("VAST Tag is not present");

        opts.vastParser = new VASTParser({
            playerMethod : opts.playerMethod,
            playerDataStore: opts.playerDataStore
        });
        opts.vastParser.Read(opts.playerMethod.getPreRollTag());

}

export default VASTParserHandle;