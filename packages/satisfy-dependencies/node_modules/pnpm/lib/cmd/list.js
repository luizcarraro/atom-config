"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const pnpm_list_1 = require("pnpm-list");
const LAYOUT_VERSION = '1';
function default_1(args, opts, command) {
    return __awaiter(this, void 0, void 0, function* () {
        let prefix;
        if (opts.global) {
            prefix = path.join(opts.prefix, LAYOUT_VERSION);
            if (opts.independentLeaves) {
                prefix += '_independent_leaves';
            }
        }
        else {
            prefix = opts.prefix;
        }
        opts.long = opts.long || command === 'll' || command === 'la';
        const output = args.length
            ? yield pnpm_list_1.forPackages(args, prefix, opts)
            : yield pnpm_list_1.default(prefix, opts);
        console.log(output);
    });
}
exports.default = default_1;
//# sourceMappingURL=list.js.map