const vscode = require("vscode");
const path = require("path");

function showWelcomePage(context) {
  const panel = vscode.window.createWebviewPanel(
    "calsciHome",
    "Calsci",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "media")),
      ],
    }
  );

  const nonce = getNonce();
  panel.webview.html = getWebviewContent(context, panel.webview, nonce);

  //link opening handler
  panel.webview.onDidReceiveMessage((message) => {
    if (message.command === "openUrl" && message.url) {
      vscode.env.openExternal(vscode.Uri.parse(message.url));
    }
  });
}

function getWebviewContent(context, webview, nonce) {
  const imagePath = vscode.Uri.file(
    path.join(context.extensionPath, "media", "calsci-device.png")
  );
  const imageSrc = webview.asWebviewUri(imagePath);

  return /*html*/ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; 
                 img-src ${webview.cspSource} https: data:; 
                 style-src ${webview.cspSource} 'unsafe-inline'; 
                 script-src 'nonce-${nonce}';">

      <title>Calsci Home</title>

      <style>
        :root {
          --green-dark: #1b4332;
          --green-light: #95d5b2;
          --green-bg: #e9f5ee;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: "Inter", sans-serif;
          color: var(--green-dark);
          background: var(--green-bg);
          overflow-x: hidden;
          animation: fadeIn 0.7s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          text-align: center;
          max-width: 1200px;
          margin: auto;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        p.subtitle {
          max-width: 800px;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #2d6a4f;
        }

        img {
          margin-top: 2rem;
          width: 60%;
          max-width: 500px;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          transition: transform 0.3s ease-in-out;
        }

        img:hover {
          transform: scale(1.03);
        }

        .content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          margin-top: 3rem;
          width: 100%;
        }

        .box {
          flex: 1 1 45%;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          padding: 2rem;
          text-align: left;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .box:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
        }

        .box h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        ul {
          padding-left: 1.2rem;
        }

        li {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          line-height: 1.5;
        }

        .cta {
          margin-top: 3rem;
        }

        button {
          background-color: var(--green-dark);
          color: white;
          border: none;
          border-radius: 0.6rem;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background-color: #2d6a4f;
        }

        a {
          color: var(--green-dark);
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }
          img {
            width: 80%;
          }
          .content {
            flex-direction: column;
            align-items: center;
          }
          .box {
            width: 100%;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <h1>⚡ Calsci — Advanced Programmable Scientific Calculator</h1>
        <p class="subtitle">
          Welcome to <b>Calsci</b> — India’s only ESP32-based programmable scientific calculator.
          Create, upload, and execute your MicroPython-powered apps directly on hardware.
        </p>

        <img src="${imageSrc}" alt="Calsci Device" />

        <div class="content">
          <div class="box">
            <h2>✨ Quick Start & Features</h2>
            <ul>
              <li>Run and test MicroPython scripts on-device</li>
              <li>Access live REPL through VS Code</li>
              <li>Upload firmware and projects instantly</li>
              <li>Extend calculator logic with SDK APIs</li>
            </ul>
          </div>

          <div class="box">
            <h2>📘 Learn & Build</h2>
            <ul>
              <li><a class="open-link" data-url="https://calsci.io/software/native">Documentation</a></li>
              <li><a class="open-link" data-url="hhttps://calsci.io/software/native">How to Make an App</a></li>
              <li><a class="open-link" data-url="https://calsci.io/software/native">Calsci SDK Reference</a></li>
            </ul>
          </div>
        </div>

        <div class="cta">
          <button id="open-site">🌐 Open Calsci Website</button>
        </div>
      </div>

      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        document.querySelectorAll('.open-link').forEach(el => {
          el.addEventListener('click', (e) => {
            vscode.postMessage({ command: 'openUrl', url: el.dataset.url });
          });
        });
        document.getElementById('open-site').addEventListener('click', () => {
          vscode.postMessage({ command: 'openUrl', url: 'https://calsci.io' });
        });
      </script>
    </body>
  </html>`;
}

// helper nonce generator (needed for secure inline scripts)
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = { showWelcomePage };
