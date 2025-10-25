const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

async function makeApp(outputChannel) {
  try {
    // open folder picker
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

    //asking for app file name
    const appName = await vscode.window.showInputBox({
      prompt: "Enter your app file name (e.g. myApp or myApp.py)",
      placeHolder: "myApp",
      validateInput: (value) => {
        if (!value || value.trim() === "") return "File name cannot be empty.";
        if (/[<>:"/\\|?*\x00-\x1F]/.test(value))
          return "Invalid characters in file name.";
        return null;
      },
    });

    if (!appName) {
      vscode.window.showWarningMessage("App creation cancelled.");
      outputChannel.appendLine("App creation cancelled by user.");
      return;
    }

    //ensuring it ends with .py
    const finalName = appName.endsWith(".py") ? appName : `${appName}.py`;
    const appFile = path.join(folderPath, finalName);

    //creating if it does not exist
    if (!fs.existsSync(appFile)) {
      fs.writeFileSync(
        appFile,
        `# ${finalName}\nprint("Hello from ${finalName}!")`
      );
      outputChannel.appendLine(`Created ${finalName} at ${appFile}`);
    } else {
      outputChannel.appendLine(`File already exists: ${appFile}`);
      vscode.window.showWarningMessage(`File already exists: ${finalName}`);
    }

    // open app.py in editor
    const doc = await vscode.workspace.openTextDocument(appFile);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(
      `Calsci app "${finalName}" is ready for coding!`
    );
  } catch (err) {
    vscode.window.showErrorMessage("Error creating app: " + err.message);
    outputChannel.appendLine("Error: " + err.message);
  }
}

module.exports = {
  makeApp,
};
