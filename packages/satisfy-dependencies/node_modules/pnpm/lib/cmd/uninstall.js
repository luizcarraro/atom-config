"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supi_1 = require("supi");
const pnpm_logger_1 = require("pnpm-logger");
function uninstallCmd(input, opts, cmdName) {
    if (cmdName === 'unlink') {
        pnpm_logger_1.default.warn('This command will behave as `pnpm dislink` in the future');
    }
    return supi_1.uninstall(input, opts);
}
exports.default = uninstallCmd;
//# sourceMappingURL=uninstall.js.map