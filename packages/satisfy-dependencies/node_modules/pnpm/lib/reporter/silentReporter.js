"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (streamParser) => {
    streamParser.on('data', (obj) => {
        if (obj.level !== 'error')
            return;
        console.log(obj['err'] && obj['err'].message || obj['message']);
        if (obj['err'] && obj['err'] && obj['err'].stack) {
            console.log(`\n${obj['err'].stack}`);
        }
    });
};
//# sourceMappingURL=silentReporter.js.map