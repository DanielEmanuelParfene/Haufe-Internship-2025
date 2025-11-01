const vscode = require("vscode");
const { getInputPanelHTML } = require("./htmlTemplates");

function showInputPanel(title, prompt, placeholder, onSubmit) {
  const panel = vscode.window.createWebviewPanel(
    "inputPanel",
    title,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getInputPanelHTML(prompt, placeholder);

  panel.webview.onDidReceiveMessage((msg) => {
    if (msg.command === "submit" && msg.text.trim()) {
      panel.dispose();
      onSubmit(msg.text);
    } else if (msg.command === "cancel") {
      panel.dispose();
    } else {
      panel.webview.postMessage({
        command: "error",
        text: "Please enter a question!",
      });
    }
  });
}

module.exports = { showInputPanel };
