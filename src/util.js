function deleteProperties(obj, props) {
    for (const prop of props)
        delete obj[prop];
}

module.exports = {
    deleteProperties
};