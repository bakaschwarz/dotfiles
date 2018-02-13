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
class MakeController extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the name of the controller to create
            let ctrlName = yield this.getInput('Controller Name');
            if (ctrlName.length == 0) {
                this.showError('A controller name is required');
                return;
            }
            // Determine if this is a resource controller or not
            let isResource = yield this.getYesNo('Should I make this a resource controller?');
            let command = `php "${this.artisan}" make:controller ${ctrlName} ${isResource ? '--resource' : ''}`;
            Output_1.default.command(command);
            // Generate the controller
            cp.exec(command, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not create the controller', err);
                }
                else {
                    yield this.openFile('/app/Http/Controllers/' + ctrlName + '.php');
                }
            }));
        });
    }
}
exports.default = MakeController;
//# sourceMappingURL=Controller.js.map