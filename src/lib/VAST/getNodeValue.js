const getNodeValue = function (node) {
    return node.nodeValue || node.textContent;
};

export default getNodeValue;