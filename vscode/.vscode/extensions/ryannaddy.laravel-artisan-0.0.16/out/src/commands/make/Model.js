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
class MakeModel extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the name of the controller to create
            let modelName = yield this.getInput('Model Name');
            if (modelName.length == 0) {
                this.showError('A model name is required');
                return;
            }
            let isController = false;
            let isMigration = false;
            let isResource = false;
            // Determine if this is a resource controller or not
            isMigration = yield this.getYesNo('Should I create a migration for the model?');
            // Should a controller be generated?
            isController = yield this.getYesNo('Should I create a controller for the model?');
            // Ask if the controller is a resource if the previous answer was 'yes'
            if (isController) {
                // Determine if this is a resource controller or not
                isResource = yield this.getYesNo('Should I create the controller as a resource?');
            }
            let command = `php "${this.artisan}" make:model ${modelName} ${isMigration ? '-m' : ''} ${isController ? '-c' : ''} ${isResource ? '-r' : ''}`;
            Output_1.default.command(command);
            // Generate the model
            cp.exec(command, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not create the model', err);
                }
                else {
                    yield this.openFile('/app/' + modelName + '.php');
                    if (isController) {
                        yield this.openFile('/app/Http/Controllers/' + modelName + 'Controller.php');
                    }
                }
            }));
        });
    }
}
exports.default = MakeModel;
//# sourceMappingURL=Model.js.map