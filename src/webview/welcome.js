const vscode = require("vscode");

function showWelcomePage(context) {
  const panel = vscode.window.createWebviewPanel(
    "calsciWelcome",
    "Calsci Home",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getWelcomeHTML();

  return panel;
}

function getWelcomeHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: "Segoe UI", sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f5f9ff;
          color: #1a237e;
        }
        h1 {
          font-size: 2em;
          margin-bottom: 0.3em;
        }
        p {
          font-size: 1.2em;
          opacity: 0.8;
        }
        button {
          background: #1a73e8;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover {
          background: #0b5bd3;
        }
      </style>
    </head>
    <body>
      <h1>👋 Welcome to Calsci</h1>
      <p>Connect your device and start building your apps!</p>
      <button onclick="vscode.postMessage({command: 'openSidebar'})">
        Open Sidebar
      </button>

      <script>
        const vscode = acquireVsCodeApi();
      </script>
    </body>
    </html>
  `;
}

module.exports = { showWelcomePage };
