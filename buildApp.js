const vscode = require("vscode");

async function makeApp(outputChannel) {
  try {
    //openning folder picker
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
    vscode.window.showInformationMessage(`Selected folder: ${folderPath}`);
    outputChannel.appendLine(`Selected folder: ${folderPath}`);

  } catch (err) {
    vscode.window.showErrorMessage("Error selecting folder: " + err.message);
    outputChannel.appendLine("Error: " + err.message);
  }
}

module.exports = {
  makeApp,
};
