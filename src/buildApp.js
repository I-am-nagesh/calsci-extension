const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

async function makeApp(outputChannel) {
  try {
    // ask user what they want
    const createLabel = "📦 Create New App";
    const openLabel = "📄 Open Existing .py File";

    const choice = await vscode.window.showQuickPick(
      [
        {
          label: createLabel,
          description: "Select a folder and create a new .py file",
        },
        {
          label: openLabel,
          description: "Select an existing .py file from your computer",
        },
      ],
      {
        placeHolder: "Do you want to create a new app or open an existing one?",
      }
    );

    if (!choice) {
      vscode.window.showWarningMessage("Operation cancelled.");
      // outputChannel.appendLine("Make App operation cancelled by user.");
      return;
    }

    let appFile = null; //storing final file path to open

    // --- path 1: user wants to CREATE a new app ---
    if (choice.label === createLabel) {
      // open folder picker
      const folderUris = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: "Select folder for Calsci app",
      });

      if (!folderUris || folderUris.length === 0) {
        vscode.window.showWarningMessage("No folder selected.");
        // outputChannel.appendLine("No folder selected.");
        return;
      }

      const folderPath = folderUris[0].fsPath;
      outputChannel.appendLine(`Selected folder: ${folderPath}`);

      //asking for app file name
      const appName = await vscode.window.showInputBox({
        prompt: "Enter your app file name (e.g. myApp or myApp.py)",
        placeHolder: "myApp",
        validateInput: (value) => {
          if (!value || value.trim() === "")
            return "File name cannot be empty.";
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
      appFile = path.join(folderPath, finalName); // Set the file path

      //creating if it does not exist
      if (!fs.existsSync(appFile)) {
        fs.writeFileSync(
          appFile,
          `# ${finalName}\nprint("Hello from ${finalName}!")`
        );
        // outputChannel.appendLine(`Created ${finalName} at ${appFile}`);
      } else {
        // outputChannel.appendLine(`File already exists: ${appFile}`);
        vscode.window.showWarningMessage(`File already exists: ${finalName}`);
      }
    }
    // --- path 2: user wants to OPEN an existing file ---
    else if (choice.label === openLabel) {
      const fileUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { Python: ["py"] },
        openLabel: "Select existing Calsci app",
      });

      if (!fileUris || fileUris.length === 0) {
        vscode.window.showWarningMessage("No file selected.");
        // outputChannel.appendLine("No file selected.");
        return;
      }

      appFile = fileUris[0].fsPath;
      // outputChannel.appendLine(`Selected existing file: ${appFile}`);
    }

    // open the selected file in the editor ---
    // this will run for both paths
    if (appFile) {
      const doc = await vscode.workspace.openTextDocument(appFile);
      await vscode.window.showTextDocument(doc);

      vscode.window.showInformationMessage(
        `Calsci app "${path.basename(appFile)}" is ready for coding!`
      );
    }
  } catch (err) {
    vscode.window.showErrorMessage("Error creating app: " + err.message);
    // outputChannel.appendLine("Error: " + err.message);
  }
}

module.exports = {
  makeApp,
};
