const vscode = require("vscode");

function openREPL(port) {
  // Open a dedicated terminal in VS Code
  const terminal = vscode.window.createTerminal(`Calsci REPL (${port})`);
  terminal.show(true);

  // Command to start mpremote REPL
  const cmd = `mpremote connect ${port} repl`;

  terminal.sendText(cmd);
  vscode.window.showInformationMessage(
    `REPL started on ${port}. Check the terminal.`
  );
}

module.exports = {
  openREPL,
};
