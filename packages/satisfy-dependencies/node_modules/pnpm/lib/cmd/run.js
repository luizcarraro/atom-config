"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runScript_1 = require("../runScript");
function default_1(input, opts) {
    return runScript_1.sync('npm', ['run'].concat(input), {
        cwd: process.cwd(),
        stdio: 'inherit',
        userAgent: undefined,
    });
}
exports.default = default_1;
//# sourceMappingURL=run.js.map