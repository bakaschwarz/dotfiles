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
class MakeMigration extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the name of the controller to create
            let migrationName = yield this.getInput('Migration Name');
            if (migrationName.length == 0) {
                this.showError('A migration name is required');
                return;
            }
            let createTable = false;
            let modifyTable = false;
            let tableName = '';
            // Determine if this is a resource controller or not
            createTable = yield this.getYesNo('Will this migration create a table?');
            if (!createTable) {
                modifyTable = yield this.getYesNo('Will this migration modify an existing table?');
            }
            if (createTable || modifyTable) {
                tableName = yield this.getInput('What is the name of the table?');
            }
            let command = `php "${this.artisan}" make:migration ${migrationName} ${createTable ? '--create=' + tableName : ''} ${modifyTable ? '--table=' + tableName : ''}`;
            Output_1.default.command(command);
            // Generate the controller
            cp.exec(command, (err, stdout, stderr) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not create the migration', err);
                }
                else {
                    let file = stdout.replace(/^.+:/ig, '').trim();
                    yield this.openFile('/database/migrations/' + file + '.php');
                }
            }));
        });
    }
}
exports.default = MakeMigration;
//# sourceMappingURL=Migration.js.map