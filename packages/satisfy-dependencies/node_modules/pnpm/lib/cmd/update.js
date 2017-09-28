"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supi_1 = require("supi");
function default_1(input, opts) {
    opts = Object.assign({ update: true }, opts);
    if (!input || !input.length) {
        return supi_1.install(opts);
    }
    return supi_1.installPkgs(input, opts);
}
exports.default = default_1;
//# sourceMappingURL=update.js.map