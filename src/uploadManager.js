const vscode = require("vscode");
const { exec } = require("child_process");

async function uploadFile(port) {
  try {
    //opennig file picker
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectMany: false,
      filters: { Python: ["py"] },
      openLabel: "Upload to Calsci",
    });

    if (!fileUri || fileUri.length === 0) {
      vscode.window.showWarningMessage("No file selected.");
      return;
    }

    const filePath = fileUri[0].fsPath;

    // command to push file using mpremote
    const cmd = `mpremote connect ${port} fs cp ${filePath} :/installed_app/`;

    const terminal = vscode.window.createOutputChannel("Calsci Upload");
    terminal.show(true);
    terminal.appendLine(`Uploading ${filePath} to ${port} ...\n`);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        terminal.appendLine(`❌ Error: ${error.message}`);
        vscode.window.showErrorMessage(
          "Upload failed. Check Calsci Upload terminal."
        );
        return;
      }
      if (stderr) {
        terminal.appendLine(`⚠️ Stderr: ${stderr}`);
      }
      terminal.appendLine(`✅ Success:\n${stdout}`);
      vscode.window.showInformationMessage("File uploaded successfully!");
    });
  } catch (err) {
    vscode.window.showErrorMessage("Upload error: " + err.message);
  }
}

module.exports = {
  uploadFile,
};
