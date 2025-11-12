const vscode = require("vscode");
const { exec } = require("child_process");
const { getConnectedPort } = require("./deviceManager");
const path = require("path");

// function to show file picker
async function showFilePicker() {
  const fileUri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
    filters: { Python: ["py"] },
    openLabel: "Upload to Calsci",
  });

  if (fileUri && fileUri.length > 0) {
    return fileUri[0].fsPath;
  }
  return null;
}

async function uploadFile(outputChannel) {
  try {
    const port = await getConnectedPort(outputChannel);
    if (!port) {
      vscode.window.showErrorMessage("No Calsci device connected.");
      return;
    }

    let filePath = null;
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor && activeEditor.document.uri.fsPath.endsWith(".py")) {
      const activeFilePath = activeEditor.document.uri.fsPath;
      const fileName = path.basename(activeFilePath);

      const uploadActiveText = `Upload Active File (${fileName})`;
      const chooseAnotherText = "Choose Another File...";

      const choice = await vscode.window.showInformationMessage(
        "How do you want to upload?",
        { modal: true },
        uploadActiveText,
        chooseAnotherText
      );

      if (choice === uploadActiveText) {
        // option 1: use the active file
        filePath = activeFilePath;
      } else if (choice === chooseAnotherText) {
        // option 2: open the file picker
        filePath = await showFilePicker();
      } else {
        // option 3: user cancelled
        vscode.window.showWarningMessage("Upload cancelled.");
        return;
      }
    } else {
      filePath = await showFilePicker();
    }
    if (!filePath) {
      vscode.window.showWarningMessage("No file selected.");
      return;
    }

    const cmd = `mpremote connect "${port}" fs cp "${filePath}" :/apps/installed_apps/`;

    const terminal = vscode.window.createOutputChannel("Calsci Upload");
    terminal.show(true);
    terminal.appendLine(`Uploading ${filePath} to ${port} ...\n`);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        terminal.appendLine(`Error: ${error.message}`);
        vscode.window.showErrorMessage(
          "Upload failed. Check Calsci Upload terminal."
        );
        return;
      }
      if (stderr) {
        terminal.appendLine(`Stderr: ${stderr}`);
      }
      terminal.appendLine(`Success:\n${stdout}`);
      vscode.window.showInformationMessage("File uploaded successfully!");
    });
  } catch (err) {
    vscode.window.showErrorMessage("Upload error: " + err.message);
  }
}

module.exports = {
  uploadFile,
};
