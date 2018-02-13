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
const cp = require("child_process");
const Common_1 = require("../../Common");
class ConfigCacheClear extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            let command = `php "${this.artisan}" config:clear`;
            cp.exec(command, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return this.showError('The config cache could not be cleared', err);
                }
                else {
                    return this.showMessage('The config cache was cleared');
                }
            }));
        });
    }
}
exports.default = ConfigCacheClear;
//# sourceMappingURL=Clear.js.map