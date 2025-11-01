const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { showInputPanel } = require("../ui/inputPanel");
const { sendToOllama } = require("./ollamaClient");
const { extractImports, resolveImportPath } = require("../utils/codeUtils");
const { log } = require("../utils/logger");
const { PromptBuilder } = require("./promptBuilder");

const promptBuilder = new PromptBuilder();

function registerCommands(context) {
  console.log("📝 Registering commands...");

  // 🧩 Command 1: Ask About This Code
  const askCmd = vscode.commands.registerCommand(
    "haufe.askOllama",
    async () => {
      console.log("Command: askOllama triggered");

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active editor found!");
      }

      const code = editor.selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(editor.selection);

      const fileName = path.basename(editor.document.fileName);
      const language = editor.document.languageId;

      showInputPanel(
        "Ask About This Code",
        "What do you want to know about this code?",
        "e.g., How does this function work? What can I improve?",
        (question) => {
          const prompt = promptBuilder.buildAskPrompt(
            code,
            language,
            fileName,
            question
          );

          log.info(
            `🤖 Sending structured prompt to Ollama (${prompt.length} chars)`
          );
          sendToOllama(prompt, `Code Analysis: ${fileName}`);
        }
      );
    }
  );

  // 🧩 Command 2: Quick Fix
  const quickFixCmd = vscode.commands.registerCommand(
    "haufe.quickFix",
    async () => {
      console.log("Command: quickFix triggered");

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active editor found!");
      }

      const code = editor.document.getText(editor.selection);
      if (!code) {
        return vscode.window.showWarningMessage(
          "Please select some code first!"
        );
      }

      const language = editor.document.languageId;

      showInputPanel(
        "Quick Fix",
        "Describe the issue you're facing:",
        "e.g., This function throws an error when input is null",
        (issue) => {
          const prompt = promptBuilder.buildQuickFixPrompt(
            code,
            language,
            issue
          );

          log.info(`🔧 Sending fix request to Ollama (${prompt.length} chars)`);
          sendToOllama(prompt, "Quick Fix Solution");
        }
      );
    }
  );

  // 🧩 Command 3: Review with Dependencies
  const reviewCmd = vscode.commands.registerCommand(
    "haufe.reviewWithDependencies",
    async () => {
      console.log("Command: reviewWithDependencies triggered");

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active editor found!");
      }

      const document = editor.document;
      const code = document.getText();
      const language = document.languageId;
      const fileName = path.basename(document.fileName);
      const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      if (!workspaceFolder) {
        return vscode.window.showErrorMessage("No workspace folder found!");
      }

      log.info(`📦 Analyzing dependencies for ${fileName}...`);

      const imports = extractImports(code, language);
      let dependencies = "";
      let depCount = 0;

      for (const imp of imports) {
        const depPath = resolveImportPath(
          imp,
          document.fileName,
          workspaceFolder
        );

        if (depPath && fs.existsSync(depPath)) {
          const content = fs.readFileSync(depPath, "utf8");
          const relativePath = path.relative(workspaceFolder, depPath);
          dependencies += `\n\n### 📄 Dependency: \`${relativePath}\`\n\`\`\`${language}\n${content}\n\`\`\``;
          depCount++;
        }
      }

      log.info(`✅ Found ${depCount} dependencies to analyze`);

      showInputPanel(
        "Review with Dependencies",
        "What issue are you experiencing?",
        "e.g., Function X throws undefined error when called from Y",
        (issue) => {
          const prompt = promptBuilder.buildReviewWithDepsPrompt(
            code,
            language,
            fileName,
            dependencies,
            issue
          );

          log.info(
            `🔬 Sending deep review to Ollama (${prompt.length} chars, ${depCount} deps)`
          );
          sendToOllama(prompt, `Deep Review: ${fileName}`);
        }
      );
    }
  );

  // 🧩 Command 4: Explain Code
  const explainCmd = vscode.commands.registerCommand(
    "haufe.explainCode",
    async () => {
      console.log("Command: explainCode triggered");

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active editor found!");
      }

      const code = editor.selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(editor.selection);

      const fileName = path.basename(editor.document.fileName);
      const language = editor.document.languageId;

      const prompt = promptBuilder.buildExplainPrompt(code, language, fileName);

      log.info(`📖 Sending explanation request to Ollama`);
      sendToOllama(prompt, `Code Explanation: ${fileName}`);
    }
  );

  // 🧩 Command 5: Optimize Code
  const optimizeCmd = vscode.commands.registerCommand(
    "haufe.optimizeCode",
    async () => {
      console.log("Command: optimizeCode triggered");

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active editor found!");
      }

      const code = editor.selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(editor.selection);

      const fileName = path.basename(editor.document.fileName);
      const language = editor.document.languageId;

      const prompt = promptBuilder.buildOptimizePrompt(
        code,
        language,
        fileName
      );

      log.info(`🚀 Sending optimization request to Ollama`);
      sendToOllama(prompt, `Performance Optimization: ${fileName}`);
    }
  );

  // Add all commands to subscriptions
  context.subscriptions.push(
    askCmd,
    quickFixCmd,
    reviewCmd,
    explainCmd,
    optimizeCmd
  );

  console.log("✅ All 5 commands registered successfully");
  log.info("✅ Commands registered successfully");
}

module.exports = { registerCommands };
