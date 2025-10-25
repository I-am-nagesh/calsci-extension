const vscode = require("vscode");
const { getConnectedPort } = require("./deviceManager");

async function openREPL(outputChannel) {
  try {
    const port = await getConnectedPort(outputChannel);
    if (!port) {
      vscode.window.showErrorMessage("No Calsci device connected.");
      return;
    }

    const terminal = vscode.window.createTerminal(`Calsci REPL (${port})`);
    terminal.show(true);

    const cmd = `mpremote connect ${port} repl`;
    terminal.sendText(cmd);

    outputChannel.appendLine(`REPL started on ${port}`);
    vscode.window.showInformationMessage(
      `Calsci REPL started on ${port}. Check the terminal.`
    );
  } catch (err) {
    const msg = `Failed to start REPL: ${err.message}`;
    outputChannel.appendLine(msg);
    vscode.window.showErrorMessage(msg);
  }
}

module.exports = { openREPL };
