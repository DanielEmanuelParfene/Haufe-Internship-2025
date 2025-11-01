function getOutputPanelHTML() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <style>
      body {
        background: #1e1e1e;
        color: #d4d4d4;
        font-family: 'Segoe UI', Tahoma, sans-serif;
        padding: 20px;
      }

      #status {
        background: #264f78;
        color: #fff;
        padding: 12px 20px;
        border-radius: 6px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff40;
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin { to { transform: rotate(360deg); } }

      #output {
        white-space: pre-wrap;
        word-wrap: break-word;
        background: #252526;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #3e3e42;
        font-size: 14px;
        line-height: 1.6;
      }

      #stopBtn {
        background: #f44336;
        color: #fff;
        border: none;
        padding: 10px 18px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      #stopBtn:hover { background: #e53935; }

      .done {
        color: #4ec9b0;
        margin-top: 20px;
        padding: 12px;
        background: #1a3a1a;
        border-left: 4px solid #4ec9b0;
        border-radius: 4px;
        font-weight: bold;
      }

      .error {
        color: #f48771;
        background: #3a1a1a;
        padding: 12px;
        border-left: 4px solid #f48771;
        border-radius: 4px;
        font-weight: bold;
        margin-top: 16px;
      }
    </style>
  </head>
  <body>
    <div id="status">
      <div class="spinner"></div>
      <span id="statusText">Connecting to Ollama...</span>
    </div>
    <button id="stopBtn">🛑 Stop Generation</button>
    <div id="output"></div>

    <script>
      const vscode = acquireVsCodeApi();
      const status = document.getElementById('status');
      const statusText = document.getElementById('statusText');
      const output = document.getElementById('output');
      const stopBtn = document.getElementById('stopBtn');

      stopBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'stop' });
        stopBtn.disabled = true;
        stopBtn.textContent = '🛑 Stopping...';
      });

      window.addEventListener('message', event => {
        const { type, text, message } = event.data;
        switch(type) {
          case 'status': statusText.textContent = message; break;
          case 'content': output.textContent += text; break;
          case 'done':
            const doneMsg = document.createElement('div');
            doneMsg.className = 'done';
            doneMsg.textContent = '✅ Analysis complete';
            output.appendChild(doneMsg);
            break;
          case 'error':
            const err = document.createElement('div');
            err.className = 'error';
            err.textContent = '❌ ' + message;
            output.appendChild(err);
            break;
        }
        window.scrollTo(0, document.body.scrollHeight);
      });
    </script>
  </body>
  </html>`;
}

module.exports = { getOutputPanelHTML };
