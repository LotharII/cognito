const path = require("path");
module.exports = {
  verbose: true,
  rootDir: "./src",
  coverageDirectory: path.resolve(__dirname, "coverage", "javascript"),
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|scss|sass)$": "identity-obj-proxy"
  }
};