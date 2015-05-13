var normalizedPath = require("path").join(__dirname, "models");

module.exports = require("fs").readdirSync(normalizedPath).map(function(file) {
  return require("./models/" + file);
});
