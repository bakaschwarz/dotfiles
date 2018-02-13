'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const net = require("net");
const childProcess = require("child_process");
const events_1 = require("events");
const xmldom_1 = require("xmldom");
const common_1 = require("./common");
const helper_1 = require("./helper");
var domErrorLocator = {};
const ELEMENT_NODE = 1; // Node.ELEMENT_NODE
class RubyProcess extends events_1.EventEmitter {
    constructor(mode, args) {
        super();
        this.debugSocketClient = null;
        this.pendingResponses = [];
        this.pendingCommands = [];
        this.socketConnected = false;
        this.state = common_1.SocketClientState.ready;
        this.buffer = '';
        this.parser = new xmldom_1.DOMParser({
            errorHandler: (type, msg) => this.domErrorHandler(type, msg),
            locator: domErrorLocator
        });
        this.debugSocketClient = new net.Socket();
        this.debugSocketClient.on('connect', (buffer) => {
            this.state = common_1.SocketClientState.connected;
            //first thing we have to send is the start - if stopOnEntry is
            //selected, rdebug-ide stops on the first executable line
            this.pendingCommands.forEach(cmd => {
                this.pendingResponses.push(cmd);
                this.debugSocketClient.write(cmd.command + '\n');
            });
            this.emit('debuggerConnect');
            this.pendingCommands = [];
        });
        this.debugSocketClient.on('end', (ex) => {
            this.state = common_1.SocketClientState.closed;
            // Emitted when the other end of the socket sends a FIN packet.
            this.emit('debuggerComplete');
        });
        this.debugSocketClient.on('close', d => {
            this.state = common_1.SocketClientState.closed;
        });
        this.debugSocketClient.on('error', d => {
            var msg = 'Client: ' + d;
            this.emit('nonTerminalError', msg);
        });
        this.debugSocketClient.on('timeout', d => {
            var msg = 'Timeout: ' + d;
            this.emit('nonTerminalError', msg);
        });
        this.debugSocketClient.on('data', (buffer) => {
            this.buffer += buffer.toString();
            var threadId;
            //ensure the dom is stable (complete)
            this.domErrors = [];
            var document = this.parser.parseFromString(this.buffer, 'application/xml');
            if (this.domErrors.length) {
                //don't report stuff we can deal with happily
                if (!(helper_1.includes(this.domErrors[0].error, 'unclosed xml attribute', 0) ||
                    helper_1.includes(this.domErrors[0].error, 'attribute space is required', 0) ||
                    helper_1.includes(this.domErrors[0].error, "elements closed character '/' and '>' must be connected", 0)))
                    this.emit('debuggerOutput', 'Debugger failed to parse: ' + this.domErrors[0].error + "\nFor: " + this.buffer.slice(0, 20));
                if (this.buffer.indexOf('<eval ') >= 0 &&
                    (helper_1.includes(this.domErrors[0].error, 'attribute space is required', 0) ||
                        helper_1.includes(this.domErrors[0].error, "elements closed character '/' and '>' must be connected", 0))) {
                    //potentially an issue with the 'eval' tagName
                    let start = this.buffer.indexOf('<eval ');
                    let end = this.buffer.indexOf('" />', start);
                    if (end < 0)
                        return; //perhaps not all in yet
                    start = this.buffer.indexOf(' value="', start);
                    if (start < 0)
                        return; //not the right structure
                    start += 8;
                    let inner = this.buffer.slice(start, end).replace(/\"/g, '&quot;');
                    this.buffer = this.buffer.slice(0, start) + inner + this.buffer.slice(end);
                    this.domErrors = [];
                    document = this.parser.parseFromString(this.buffer, 'application/xml');
                }
                else
                    return; //one of the xml elements is incomplete
            }
            //if it's still bad: - we need to do something else with this
            if (this.domErrors.length)
                return;
            for (let idx = 0; idx < document.childNodes.length; idx++) {
                let node = document.childNodes[idx];
                let attributes = {};
                if (node.attributes && node.attributes.length) {
                    for (let attrIdx = 0; attrIdx < node.attributes.length; attrIdx++) {
                        attributes[node.attributes[attrIdx].name] = node.attributes[attrIdx].value;
                    }
                    if (attributes.threadId)
                        attributes.threadId = +attributes.threadId;
                }
                //the structure here only has one or the other
                if (node.childNodes && node.childNodes.length) {
                    let finalAttributes = [];
                    //all of the child nodes are the same type in our responses
                    for (let nodeIdx = 0; nodeIdx < node.childNodes.length; nodeIdx++) {
                        let childNode = node.childNodes[nodeIdx];
                        if (childNode.nodeType !== ELEMENT_NODE)
                            continue;
                        attributes = {};
                        if (childNode.attributes && childNode.attributes.length) {
                            for (let attrIdx = 0; attrIdx < childNode.attributes.length; attrIdx++) {
                                attributes[childNode.attributes[attrIdx].name] = childNode.attributes[attrIdx].value;
                            }
                        }
                        finalAttributes.push(attributes);
                    }
                    attributes = finalAttributes;
                }
                if (['breakpoint', 'suspended', 'exception'].indexOf(node.tagName) >= 0) {
                    this.emit(node.tagName, attributes);
                }
                else
                    this.FinishCmd(attributes);
            }
            this.buffer = "";
        });
        if (mode == common_1.Mode.launch) {
            var runtimeArgs = ['--evaluation-timeout', '10'];
            var runtimeExecutable;
            if (process.platform === 'win32') {
                runtimeExecutable = 'rdebug-ide.bat';
            }
            else {
                // platform: linux or darwin
                runtimeExecutable = 'rdebug-ide';
            }
            if (args.pathToRDebugIDE && args.pathToRDebugIDE !== 'rdebug-ide') {
                runtimeExecutable = args.pathToRDebugIDE;
            }
            var processCwd = args.cwd || path_1.dirname(args.program);
            var processEnv = {};
            //use process environment
            for (var env in process.env) {
                processEnv[env] = process.env[env];
            }
            //merge supplied environment
            for (var env in args.env) {
                processEnv[env] = args.env[env];
            }
            if (args.showDebuggerOutput) {
                runtimeArgs.push('-x');
            }
            if (args.debuggerPort && args.debuggerPort !== '1234') {
                runtimeArgs.push('-p');
                runtimeArgs.push(args.debuggerPort);
            }
            if (args.stopOnEntry) {
                runtimeArgs.push('--stop');
            }
            if (args.useBundler) {
                runtimeArgs.unshift(runtimeExecutable);
                runtimeArgs.unshift('exec');
                runtimeExecutable = 'bundle';
                if (args.pathToBundler && args.pathToBundler !== 'bundle') {
                    runtimeExecutable = args.pathToBundler;
                }
            }
            if (args.includes) {
                args.includes.forEach((path) => {
                    runtimeArgs.push('-I');
                    runtimeArgs.push(path);
                });
            }
            // '--' forces process arguments (args.args) not to be swollowed by rdebug-ide
            this.debugprocess = childProcess.spawn(runtimeExecutable, [...runtimeArgs, '--', args.program, ...args.args || []], { cwd: processCwd, env: processEnv });
            // redirect output to debug console
            this.debugprocess.stdout.on('data', (data) => {
                this.emit('executableOutput', data);
            });
            this.debugprocess.stderr.on('data', (data) => {
                if (/^Fast Debugger/.test(data.toString())) {
                    this.debugSocketClient.connect(args.debuggerPort || '1234');
                    if (args.showDebuggerOutput) {
                        this.emit('debuggerOutput', data);
                    }
                }
                else {
                    this.emit('executableStdErr', data);
                }
            });
            this.debugprocess.on('exit', () => {
                this.emit('debuggerProcessExit');
            });
            this.debugprocess.on('error', (error) => {
                this.emit('terminalError', "Process failed: " + error.message);
            });
        }
        else {
            this.debugSocketClient.connect(args.remotePort, args.remoteHost);
        }
    }
    domErrorHandler(type, error) {
        this.domErrors.push({
            lineNumber: domErrorLocator.lineNumber,
            columnNumber: domErrorLocator.columnNumber,
            error: error,
            type: type
        });
    }
    get state() {
        return this._state;
    }
    set state(newState) {
        this._state = newState;
    }
    Run(cmd) {
        if (this.state !== common_1.SocketClientState.connected) {
            var newCommand = {
                command: cmd,
                resolve: () => 0,
                reject: () => 0
            };
            this.pendingCommands.push(newCommand);
        }
        else {
            this.debugSocketClient.write(cmd + '\n');
        }
    }
    Enqueue(cmd) {
        var pro = new Promise((resolve, reject) => {
            var newCommand = {
                command: cmd,
                resolve: resolve,
                reject: reject
            };
            if (this.state !== common_1.SocketClientState.connected) {
                this.pendingCommands.push(newCommand);
            }
            else {
                this.pendingResponses.push(newCommand);
                this.debugSocketClient.write(newCommand.command + '\n');
            }
        });
        return pro;
    }
    FinishCmd(result) {
        if (this.pendingResponses.length > 0) {
            this.pendingResponses[0].resolve(result);
            this.pendingResponses.shift();
        }
    }
}
exports.RubyProcess = RubyProcess;
//# sourceMappingURL=ruby.js.map