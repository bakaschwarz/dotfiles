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
class Server extends Common_1.default {
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            let host = yield this.getInput('Should I use a specific host (Default: localhost)?');
            let port = yield this.getInput('Should I use a specific port (Default: 8000)?');
            let command = `php "${this.artisan}" serve ${host.length > 0 ? '--host=' + host : ''} ${port.length > 0 ? '--port=' + port : ''}`;
            Output_1.default.command(command);
            Server.child = cp.spawn('php', [this.artisan, 'serve'], { detached: true });
            Server.child.stdout.on('data', data => {
                Output_1.default.info(data.toString());
                Server.host = host.length > 0 ? host : 'localhost';
                Server.port = port.length > 0 ? port : '8000';
                this.showMessage(`The server is now running on http://${Server.host}:${Server.port}`);
            });
        });
    }
    static stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Server.child) {
                process.kill(-Server.child.pid);
                Server.child = null;
                this.showMessage(`The server has been stopped on http://${Server.host}:${Server.port}`);
            }
            else {
                this.showError('There is no server currently running');
            }
        });
    }
}
exports.default = Server;
//# sourceMappingURL=Serve.js.map