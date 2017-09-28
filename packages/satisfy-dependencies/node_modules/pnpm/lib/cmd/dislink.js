"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supi_1 = require("supi");
function default_1(input, opts) {
    if (!input || !input.length) {
        return supi_1.unlink(opts);
    }
    return supi_1.unlinkPkgs(input, opts);
}
exports.default = default_1;
//# sourceMappingURL=dislink.js.map