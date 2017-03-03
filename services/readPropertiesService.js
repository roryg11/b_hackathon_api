module.exports = function() {
    var argv = require('minimist')(process.argv.slice(2)), //argv is an object that contains all the params passed in
        properties = require('properties-parser'), readProperties;

    if(argv.r) {
        //Read Properties is all the properties from the .properties file passed into the -r argument
        readProperties = properties.read(argv.r);
    }

    return readProperties;
};