'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const link_1 = require("./link");
const util = require("./util");
const REG = /(['"])[^'"]*\1/;
function activate(context) {
    let hover = vscode_1.languages.registerHoverProvider(['php', 'blade', 'laravel-blade'], {
        provideHover(document, position, token) {
            let config = vscode_1.workspace.getConfiguration('laravel_goto_view');
            let linkRange = document.getWordRangeAtPosition(position, REG);
            if (linkRange) {
                let filePaths = util.getFilePaths(document.getText(linkRange), document);
                let workspaceFolder = vscode_1.workspace.getWorkspaceFolder(document.uri);
                if (filePaths.length > 0) {
                    let text = "";
                    for (let i in filePaths) {
                        text += config.folderTip ? `\`${filePaths[i].name}\`` : '';
                        text += ` [${workspaceFolder.name + filePaths[i].showPath}](${filePaths[i].fileUri})  \r`;
                    }
                    return new vscode_1.Hover(new vscode_1.MarkdownString(text));
                }
            }
            return;
        }
    });
    context.subscriptions.push(hover);
    let link = vscode_1.languages.registerDocumentLinkProvider(['php', 'blade', 'laravel-blade'], new link_1.LinkProvider());
    context.subscriptions.push(link);
}
exports.activate = activate;
function deactivate() {
    //
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map