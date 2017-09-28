"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadJsonFile = require("load-json-file");
const path = require("path");
exports.default = loadJsonFile.sync(path.resolve(__dirname, '../package.json'));
//# sourceMappingURL=pnpmPkgJson.js.map