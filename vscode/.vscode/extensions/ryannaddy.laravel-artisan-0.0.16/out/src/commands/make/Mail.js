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
const Output_1 = require("../../utils/Output");
class MakeMail extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            let mailName = yield this.getInput('Mail Name');
            if (mailName.length == 0) {
                this.showError('A mail name is required');
                return;
            }
            let command = `php "${this.artisan}" make:mail ${mailName}`;
            Output_1.default.command(command);
            cp.exec(command, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not create the mailler', err);
                }
                else {
                    yield this.openFile('/app/Mail/' + mailName + '.php');
                }
            }));
        });
    }
}
exports.default = MakeMail;
//# sourceMappingURL=Mail.js.map