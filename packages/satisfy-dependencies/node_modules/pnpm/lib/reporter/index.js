"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pnpm_default_reporter_1 = require("pnpm-default-reporter");
const silentReporter_1 = require("./silentReporter");
const pnpm_logger_1 = require("pnpm-logger");
exports.default = (reporterType) => {
    switch (reporterType) {
        case 'default':
            pnpm_default_reporter_1.default(pnpm_logger_1.streamParser);
            return;
        case 'ndjson':
            pnpm_logger_1.writeToConsole();
            return;
        case 'silent':
            silentReporter_1.default(pnpm_logger_1.streamParser);
            return;
    }
};
//# sourceMappingURL=index.js.map