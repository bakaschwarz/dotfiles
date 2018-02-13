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
class MakeFactory extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the name of the controller to create
            let name = yield this.getInput('Factory Name');
            if (name.length == 0) {
                this.showError('A factory name is required');
                return;
            }
            // Determine if this is a resource controller or not
            let hasModel = yield this.getYesNo('Is there a model related to this factory?');
            let modelName = '';
            if (hasModel) {
                modelName = yield this.getInput('Does the model have a name? Leave blank to use (Model::class)');
            }
            let command = `php "${this.artisan}" make:factory ${name} ${hasModel ? `--model${modelName.length > 0 ? `=${modelName}` : ''}` : ''}`;
            Output_1.default.command(command);
            // Generate the factory
            cp.exec(command, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not create the factory', err);
                }
                else {
                    yield this.openFile('/database/factories/' + name + '.php');
                }
            }));
        });
    }
}
exports.default = MakeFactory;
//# sourceMappingURL=Factory.js.map