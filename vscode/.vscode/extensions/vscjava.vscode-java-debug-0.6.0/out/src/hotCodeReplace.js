"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const suppressedReasons = new Set();
const NOT_SHOW_AGAIN = "Not show again";
const JAVA_LANGID = "java";
const HCR_EVENT = "hotcodereplace";
var HcrChangeType;
(function (HcrChangeType) {
    HcrChangeType["ERROR"] = "ERROR";
    HcrChangeType["WARNING"] = "WARNING";
    HcrChangeType["STARTING"] = "STARTING";
    HcrChangeType["END"] = "END";
    HcrChangeType["BUILD_COMPLETE"] = "BUILD_COMPLETE";
})(HcrChangeType || (HcrChangeType = {}));
function initializeHotCodeReplace(context) {
    context.subscriptions.push(vscode.debug.onDidTerminateDebugSession((session) => {
        const t = session ? session.type : undefined;
        if (t === JAVA_LANGID) {
            suppressedReasons.clear();
        }
    }));
    context.subscriptions.push(vscode.debug.onDidReceiveDebugSessionCustomEvent((customEvent) => {
        const t = customEvent.session ? customEvent.session.type : undefined;
        if (t !== JAVA_LANGID || customEvent.event !== HCR_EVENT) {
            return;
        }
        if (customEvent.body.changeType === HcrChangeType.BUILD_COMPLETE) {
            return vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, (progress) => {
                progress.report({ message: "Applying code changes..." });
                return customEvent.session.customRequest("redefineClasses");
            });
        }
        if (customEvent.body.changeType === HcrChangeType.ERROR || customEvent.body.changeType === HcrChangeType.WARNING) {
            if (!suppressedReasons.has(customEvent.body.message)) {
                vscode.window.showInformationMessage(`Hot code replace failed - ${customEvent.body.message}`, NOT_SHOW_AGAIN).then((res) => {
                    if (res === NOT_SHOW_AGAIN) {
                        suppressedReasons.add(customEvent.body.message);
                    }
                });
            }
        }
    }));
}
exports.initializeHotCodeReplace = initializeHotCodeReplace;
//# sourceMappingURL=hotCodeReplace.js.map