const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

async function makeApp(outputChannel) {
  try {
    // 1️⃣ Open folder picker
    const folderUris = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: "Select folder for Calsci app",
    });

    if (!folderUris || folderUris.length === 0) {
      vscode.window.showWarningMessage("No folder selected.");
      outputChannel.appendLine("No folder selected.");
      return;
    }

    const folderPath = folderUris[0].fsPath;
    outputChannel.appendLine(`Selected folder: ${folderPath}`);
    vscode.window.showInformationMessage(`Selected folder: ${folderPath}`);

    // 2️⃣ Create app.py if it doesn't exist
    const appFile = path.join(folderPath, "app.py");
    if (!fs.existsSync(appFile)) {
      fs.writeFileSync(
        appFile,
        `# Simple Calsci App\nprint("Hello Calsci!")`
      );
      outputChannel.appendLine(`Created app.py at ${appFile}`);
    } else {
      outputChannel.appendLine(`app.py already exists at ${appFile}`);
    }

    // 3️⃣ Open app.py in editor
    const doc = await vscode.workspace.openTextDocument(appFile);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage("Simple Calsci app is ready for coding!");
  } catch (err) {
    vscode.window.showErrorMessage("Error creating app: " + err.message);
    outputChannel.appendLine("Error: " + err.message);
  }
}

module.exports = {
  makeApp,
};
