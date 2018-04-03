"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const fullRange = doc => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
class OperatingSystem {
    constructor(name, fileExt, checker) {
        this.name = name;
        this.fileExt = fileExt;
        this.checker = checker;
    }
}
exports.OperatingSystem = OperatingSystem;
const windows = new OperatingSystem('win32', '.exe', 'where');
const linux = new OperatingSystem('linux', '.pl', 'which');
const mac = new OperatingSystem('darwin', '.pl', 'which');
class LaTexFormatter {
    constructor(extension) {
        this.extension = extension;
        this.machineOs = os.platform();
    }
    formatDocument(document, range) {
        return new Promise((resolve, _reject) => {
            if (this.machineOs === windows.name) {
                this.currentOs = windows;
            }
            else if (this.machineOs === linux.name) {
                this.currentOs = linux;
            }
            else if (this.machineOs === mac.name) {
                this.currentOs = mac;
            }
            const configuration = vscode.workspace.getConfiguration('latex-workshop.latexindent');
            this.formatter = configuration.get('path') || 'latexindent';
            const pathMeta = configuration.inspect('path');
            if (pathMeta && pathMeta.defaultValue && pathMeta.defaultValue !== this.formatter) {
                this.format(document, range).then((edit) => {
                    return resolve(edit);
                });
            }
            else {
                this.checkPath(this.currentOs.checker).then((latexindentPresent) => {
                    if (!latexindentPresent) {
                        this.extension.logger.addLogMessage('Can not find latexindent in PATH!');
                        vscode.window.showErrorMessage('Can not find latexindent in PATH!');
                        return resolve();
                    }
                    this.format(document, range).then((edit) => {
                        return resolve(edit);
                    });
                });
            }
        });
    }
    checkPath(checker) {
        return new Promise((resolve, _reject) => {
            cp.exec(checker + ' ' + this.formatter, (err, _stdout, _stderr) => {
                if (err) {
                    this.formatter += this.currentOs.fileExt;
                    cp.exec(checker + ' ' + this.formatter, (err1, _stdout1, _stderr1) => {
                        if (err1) {
                            resolve(false);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    format(document, range) {
        return new Promise((resolve, _reject) => {
            const latexSettings = vscode.workspace.getConfiguration('[latex]', document.uri);
            const configuration = vscode.workspace.getConfiguration('editor', document.uri);
            let useSpaces = configuration.get('insertSpaces');
            if (latexSettings.hasOwnProperty('editor.insertSpaces')) {
                useSpaces = latexSettings['editor.insertSpaces'];
            }
            let tabSize = configuration.get('tabSize') || 4;
            if (latexSettings.hasOwnProperty('editor.tabSize')) {
                tabSize = latexSettings['editor.tabSize'];
            }
            const indent = useSpaces ? ' '.repeat(tabSize) : '\\t';
            const documentDirectory = path.dirname(document.fileName);
            // The version of latexindent shipped with current latex distributions doesn't support piping in the data using stdin, support was
            // only added on 2018-01-13 with version 3.4 so we have to create a temporary file
            const textToFormat = document.getText(range);
            const temporaryFile = documentDirectory + path.sep + '__latexindent_temp.tex';
            fs.writeFileSync(temporaryFile, textToFormat);
            cp.exec(this.formatter + ' -c "' + documentDirectory + '" "' + temporaryFile + '"'
                + ' -y="defaultIndent: \'' + indent + '\'"', (err, stdout, _stderr) => {
                if (err) {
                    this.extension.logger.addLogMessage(`Formatting failed: ${err.message}`);
                    vscode.window.showErrorMessage('Formatting failed. Please refer to LaTeX Workshop Output for details.');
                    return resolve();
                }
                if (stdout !== '') {
                    const edit = [vscode.TextEdit.replace(range ? range : fullRange(document), stdout)];
                    try {
                        fs.unlink(temporaryFile);
                        fs.unlinkSync(documentDirectory + path.sep + 'indent.log');
                    }
                    catch (ignored) {
                    }
                    this.extension.logger.addLogMessage('Formatted ' + document.fileName);
                    return resolve(edit);
                }
                return resolve();
            });
        });
    }
}
exports.LaTexFormatter = LaTexFormatter;
class LatexFormatterProvider {
    constructor(extension) {
        this.formatter = new LaTexFormatter(extension);
    }
    provideDocumentFormattingEdits(document, _options, _token) {
        return document.save().then(() => {
            return this.formatter.formatDocument(document);
        });
    }
    provideDocumentRangeFormattingEdits(document, range, _options, _token) {
        return document.save().then(() => {
            return this.formatter.formatDocument(document, range);
        });
    }
}
exports.LatexFormatterProvider = LatexFormatterProvider;
//# sourceMappingURL=latexformatter.js.map