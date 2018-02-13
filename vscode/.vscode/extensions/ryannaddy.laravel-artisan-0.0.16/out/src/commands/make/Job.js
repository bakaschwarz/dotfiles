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
class MakeJob extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            let jobName = yield this.getInput('Job Name');
            if (jobName.length == 0) {
                this.showError('A job name is required');
                return;
            }
            let sync = yield this.getYesNo('Should I make this job synchronous?');
            let comand = `php "${this.artisan}" make:job ${jobName} ${sync ? '--sync' : ''}`;
            Output_1.default.command(comand);
            cp.exec(comand, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not create the job', err);
                }
                else {
                    yield this.openFile('/app/Jobs/' + jobName + '.php');
                }
            }));
        });
    }
}
exports.default = MakeJob;
//# sourceMappingURL=Job.js.map