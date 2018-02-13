'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const util = require("./util");
class LinkProvider {
    provideDocumentLinks(document, token) {
        let config = vscode_1.workspace.getConfiguration('laravel_goto_view');
        let documentLinks = [];
        let index = 0;
        let reg = /(['"])[^'"]*\1/g;
        if (config.quickJump) {
            while (index < document.lineCount) {
                let line = document.lineAt(index);
                let result = line.text.match(reg);
                if (result != null) {
                    for (let item of result) {
                        let file = util.getFilePath(item, document);
                        if (file != null) {
                            let start = new vscode_1.Position(line.lineNumber, line.text.indexOf(item) + 1);
                            let end = start.translate(0, item.length - 2);
                            let documentlink = new vscode_1.DocumentLink(new vscode_1.Range(start, end), file.fileUri);
                            documentLinks.push(documentlink);
                        }
                        ;
                    }
                }
                index++;
            }
        }
        return documentLinks;
    }
}
exports.LinkProvider = LinkProvider;
//# sourceMappingURL=link.js.map