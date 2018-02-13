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
class ClearCompiled extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            let command = `php "${this.artisan}" list --format=json`;
            Output_1.default.command(command);
            // Generate the controller
            cp.exec(command, (err, stdout) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    Output_1.default.error(stdout);
                    this.showError('Could not get the list', err);
                }
                else {
                    let list = JSON.parse(stdout);
                    let headers = [];
                    let rows = [];
                    headers.push('Name', 'Description', 'Arguments', 'Options');
                    let i = 0;
                    list.commands.forEach(command => {
                        let row = rows[i] = [];
                        row.push(command.name);
                        row.push(command.description);
                        if (command.definition.arguments.name) {
                            let name = command.definition.arguments.name;
                            row.push(name.name + (name.is_required ? '' : ' (Optional) ') + ' &ndash; ' + name.description);
                        }
                        else {
                            row.push('');
                        }
                        let opts = [];
                        for (let i in command.definition.options) {
                            if (['help', 'quiet', 'version', 'ansi', 'no-ansi', 'no-interaction', 'env', 'verbose'].indexOf(i) > -1) {
                                continue;
                            }
                            let option = i;
                            let name = command.definition.options[i].name;
                            let descr = command.definition.options[i].description;
                            opts.push(name + ' &ndash; ' + descr);
                        }
                        row.push(opts.join('<br>'));
                        i++;
                    });
                    this.openVirtualHtmlFile('artisan-list', 'Artisan Commands', headers, rows);
                }
            }));
        });
    }
}
exports.default = ClearCompiled;
//# sourceMappingURL=List.js.map