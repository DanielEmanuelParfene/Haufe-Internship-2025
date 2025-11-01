const vscode = require("vscode");
const { registerCommands } = require("./core/commandRegistry");

function activate(context) {
  registerCommands(context);
}

function deactivate() {}

module.exports = { activate, deactivate };
