function getInputPanelHTML(promptText, placeholder) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%);
        color: #d4d4d4;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
      }

      .container {
        background: #252526;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        padding: 40px;
        max-width: 700px;
        width: 100%;
        border: 1px solid #3e3e42;
      }

      h1 {
        color: #4ec9b0;
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: 600;
      }

      .prompt-text {
        color: #858585;
        font-size: 14px;
        margin-bottom: 24px;
        line-height: 1.6;
      }

      textarea {
        width: 100%;
        min-height: 200px;
        background: #1e1e1e;
        border: 2px solid #3e3e42;
        border-radius: 8px;
        color: #d4d4d4;
        padding: 16px;
        font-size: 15px;
        font-family: 'Segoe UI', sans-serif;
        resize: vertical;
        transition: all 0.3s ease;
        line-height: 1.6;
      }

      textarea:focus {
        outline: none;
        border-color: #4ec9b0;
        box-shadow: 0 0 0 3px rgba(78, 201, 176, 0.1);
      }

      textarea::placeholder {
        color: #6a6a6a;
      }

      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }

      button {
        flex: 1;
        padding: 14px 24px;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Segoe UI', sans-serif;
      }

      .submit-btn {
        background: linear-gradient(135deg, #4ec9b0 0%, #3ba089 100%);
        color: #fff;
      }

      .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(78, 201, 176, 0.3);
      }

      .cancel-btn {
        background: #3e3e42;
        color: #d4d4d4;
      }

      .cancel-btn:hover {
        background: #4e4e52;
      }

      .error {
        color: #f48771;
        background: #3a1a1a;
        padding: 12px;
        border-radius: 6px;
        margin-top: 16px;
        border-left: 4px solid #f48771;
        display: none;
      }

      .error.show {
        display: block;
        animation: shake 0.3s ease;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }

      .char-count {
        text-align: right;
        color: #858585;
        font-size: 12px;
        margin-top: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🤖 ${promptText}</h1>
      <div class="prompt-text">
        Type your question below. Be as specific as possible for better results.
      </div>

      <textarea id="userInput" placeholder="${placeholder}" autofocus></textarea>
      <div class="char-count"><span id="charCount">0</span> characters</div>
      <div class="error" id="error">⚠️ <span id="errorText"></span></div>

      <div class="button-group">
        <button class="cancel-btn" onclick="cancel()">Cancel</button>
        <button class="submit-btn" onclick="submit()">🚀 Analyze Code</button>
      </div>
    </div>

    <script>
      const vscode = acquireVsCodeApi();
      const textarea = document.getElementById('userInput');
      const charCount = document.getElementById('charCount');
      const error = document.getElementById('error');
      const errorText = document.getElementById('errorText');

      textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
        error.classList.remove('show');
      });

      textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit();
      });

      function submit() {
        const text = textarea.value.trim();
        if (!text) {
          showError('Please enter a question!');
          return;
        }
        vscode.postMessage({ command: 'submit', text });
      }

      function cancel() { vscode.postMessage({ command: 'cancel' }); }

      function showError(message) {
        errorText.textContent = message;
        error.classList.add('show');
        textarea.focus();
      }

      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.command === 'error') showError(message.text);
      });
    </script>
  </body>
  </html>`;
}

module.exports = { getInputPanelHTML };
