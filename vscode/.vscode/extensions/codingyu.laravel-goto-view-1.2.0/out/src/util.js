'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs = require("fs");
function getFilePath(text, document) {
    let paths = getFilePaths(text, document);
    return paths.length > 0 ? paths[0] : null;
}
exports.getFilePath = getFilePath;
function getFilePaths(text, document) {
    let config = vscode_1.workspace.getConfiguration('laravel_goto_view');
    let workspaceFolder = vscode_1.workspace.getWorkspaceFolder(document.uri).uri.fsPath;
    text = text.replace(/\"|\'/g, '');
    let result = [];
    if (text.indexOf("::") != -1) {
        let info = text.split('::');
        let showPath = config.folders[info[0]] + "/" + info[1].replace(/\./g, '/') + ".blade.php";
        let filePath = workspaceFolder + showPath;
        if (fs.existsSync(filePath)) {
            result.push({
                "name": info[0],
                "showPath": showPath,
                "fileUri": vscode_1.Uri.file(filePath)
            });
        }
    }
    else {
        for (let item in config.folders) {
            let showPath = config.folders[item] + "/" + text.replace(/\./g, '/') + ".blade.php";
            let filePath = workspaceFolder + showPath;
            if (fs.existsSync(filePath)) {
                result.push({
                    "name": item,
                    "showPath": showPath,
                    "fileUri": vscode_1.Uri.file(filePath)
                });
            }
        }
    }
    return result;
}
exports.getFilePaths = getFilePaths;
//# sourceMappingURL=util.js.map