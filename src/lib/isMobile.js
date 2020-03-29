import isTablet from "./isTablet";

const isMobile = function() {
    if(window.matchMedia("(pointer: coarse)").matches) {
        if (isTablet() !== true) {
            return true;
        } else {
            return false;
        }
    }
    return false;
};
export default isMobile;