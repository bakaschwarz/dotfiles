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
const vscode_1 = require("vscode");
const cp = require("child_process");
class Common {
    static get artisanRoot() {
        let config = vscode_1.workspace.getConfiguration("artisan");
        let location = config.get("location");
        if (location) {
            if (typeof location == 'string') {
                return location;
            }
            else if (typeof location == 'number') {
                return vscode_1.workspace.workspaceFolders[location].uri.fsPath;
            }
        }
        // If we have gotten this far then a location hasn't been specified
        // We then get the first workspace
        if (vscode_1.workspace.workspaceFolders) {
            return vscode_1.workspace.workspaceFolders[0].uri.fsPath;
        }
        // Last resort get the rootpath (this is technically deperecated)
        return vscode_1.workspace.rootPath;
    }
    static get artisan() {
        return this.artisanRoot + '/artisan';
    }
    static get tableStyle() {
        return `<style>
            body { padding: 0; margin: 0; }
            table { border-collapse: collapse; width: 100%; }
            table thead { font-size: 16px; text-align: left; }
            table tbody { font-size: 14px; }
            table td, table th { padding: 10px; }
            table tbody tr:nth-child(odd){
                background-color: rgba(0,0,0,0.25);
            }
            table td a { color: #4080d0; cursor: pointer; }
            .hidden { display: none; }
            .search { padding-top: 15px; padding-bottom: 15px; width: 95vw; margin: auto; }
            #filter { display: block; padding: 5px; width: 100%; }
        </style>`;
    }
    static openFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let doc = yield vscode_1.workspace.openTextDocument(this.artisanRoot + '/' + filename);
                vscode_1.window.showTextDocument(doc);
                this.refreshFilesExplorer();
            }
            catch (e) {
                console.log(e.getMessage);
            }
        });
    }
    static parseCliTable(cliTable) {
        let clirows = cliTable.split(/\r\n|\n/g);
        let headers = [];
        let rows = [];
        // Parse the cli table
        for (let i = 0, len = clirows.length; i < len; i++) {
            if (i == 0 || i == 2) {
                continue;
            }
            else if (i == 1) {
                (headers = clirows[i].split('|')).forEach((v, k) => {
                    headers[k] = v.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
                    if (headers[k] == '') {
                        delete headers[k];
                    }
                });
            }
            else {
                if (clirows[i].indexOf('|') > -1) {
                    let row = [];
                    clirows[i].split(/ \| /g).forEach((v, k) => {
                        row.push(v.replace(/^\||\|$/g, '').trim());
                    });
                    rows.push(row);
                }
            }
        }
        return { headers: headers, rows: rows };
    }
    static openVirtualFile(path, title, content) {
        return __awaiter(this, void 0, void 0, function* () {
            let uri = vscode_1.Uri.parse('laravel-artisan://artisan/' + path);
            let doc = yield vscode_1.workspace.openTextDocument(uri);
            let edit = new vscode_1.WorkspaceEdit();
            let range = new vscode_1.Range(0, 0, doc.lineCount, doc.getText().length);
            edit.set(uri, [new vscode_1.TextEdit(range, content)]);
            vscode_1.workspace.applyEdit(edit);
            vscode_1.commands.executeCommand('vscode.previewHtml', uri, vscode_1.ViewColumn.One, title);
        });
    }
    static openVirtualHtmlFile(path, title, headers, rows) {
        return __awaiter(this, void 0, void 0, function* () {
            let html = `<div class="search"><input type="text" id="filter" placeholder="Search for an item (RegExp Supported)"></div>`;
            html += `${this.tableStyle}<table>`;
            html += '<thead><tr>';
            headers.forEach(header => {
                html += '<th>' + header + '</th>';
            });
            html += '</tr></thead><tbody>';
            rows.forEach(row => {
                html += '<tr>';
                row.forEach(item => {
                    if (item.match(/app\\/i)) {
                        html += `<td><a href="file://${this.artisanRoot}/${item.replace(/@.+$/, '')}.php" class="app-item">` + item + '</a></td>';
                    }
                    else {
                        html += '<td>' + item + '</td>';
                    }
                });
                html += '</tr>';
            });
            html += '</tbody></table>';
            html += `<script>
            let filter = document.querySelector('#filter');
            filter.focus();
            filter.addEventListener('input', e => {
                let v = e.currentTarget.value;
                document.querySelectorAll('tbody > tr').forEach(row => {
                    let txt = row.innerText;
                    let reg = new RegExp(v, 'ig');
                    if (reg.test(txt) || v.length == 0) {
                        row.classList.remove('hidden');
                    } else {
                        row.classList.add('hidden');
                    }
                });
            });
        </script>`;
            this.openVirtualFile(path, title, html);
        });
    }
    static getInput(placeHolder) {
        return __awaiter(this, void 0, void 0, function* () {
            let name = yield vscode_1.window.showInputBox({ placeHolder: placeHolder.replace(/\s\s+/g, ' ').trim() });
            name = name == undefined ? '' : name;
            // if (name.length == 0) {
            //     window.showErrorMessage('Invalid ' + placeHolder);
            //     return '';
            // }
            return name;
        });
    }
    static getListInput(placeHolder, list) {
        return __awaiter(this, void 0, void 0, function* () {
            let name = yield vscode_1.window.showQuickPick(list, { placeHolder: placeHolder });
            name = name == undefined ? '' : name;
            return name;
        });
    }
    static getYesNo(placeHolder) {
        return __awaiter(this, void 0, void 0, function* () {
            let value = yield vscode_1.window.showQuickPick(['Yes', 'No'], { placeHolder: placeHolder });
            return value.toLowerCase() == 'yes' ? true : false;
        });
    }
    static showMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            vscode_1.window.showInformationMessage(message);
            return true;
        });
    }
    static showError(message, consoleErr = null) {
        return __awaiter(this, void 0, void 0, function* () {
            vscode_1.window.showErrorMessage(message);
            if (consoleErr !== null) {
                console.error(consoleErr + ' (See output console for more details)');
            }
            return false;
        });
    }
    static refreshFilesExplorer() {
        vscode_1.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
    }
    static getCommandList() {
        return new Promise(resolve => {
            cp.exec(`php "${this.artisan}" list --format=json`, (err, stdout) => {
                let commands = JSON.parse(stdout).commands;
                let commandList = [];
                commands.forEach(command => {
                    let commandItem = { name: command.name, description: command.description, options: [], arguments: [] };
                    for (let i in command.definition.options) {
                        if (['help', 'quiet', 'verbose', 'version', 'ansi', 'no-ansi', 'no-interaction', 'env'].indexOf(i) > -1)
                            continue;
                        commandItem.options.push(command.definition.options[i]);
                    }
                    for (let i in command.definition.arguments) {
                        commandItem.arguments.push(command.definition.arguments[i]);
                    }
                    commandList.push(commandItem);
                });
                resolve(commandList);
            });
        });
    }
}
exports.default = Common;
//# sourceMappingURL=Common.js.map