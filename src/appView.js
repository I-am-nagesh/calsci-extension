const vscode = require("vscode");
const { exec } = require("child_process");

class AppsProvider {
  constructor(port, outputChannel) {
    this.port = port;
    this.outputChannel = outputChannel;
    this.apps = [];
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh(apps) {
    this.apps = apps;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    if (!this.apps || this.apps.length === 0) {
      return [new vscode.TreeItem("No apps found.")];
    }
    return this.apps.map((app) => {
      const item = new vscode.TreeItem(
        app,
        vscode.TreeItemCollapsibleState.None
      );
      item.command = {
        command: "calsci.openApp",
        title: "Open App",
        arguments: [app],
      };
      item.iconPath = new vscode.ThemeIcon("file-code");
      return item;
    });
  }
}

function openApp(port, appName, outputChannel) {
  const command = `mpremote connect ${port} fs cat :/installed_app/${appName}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(
        `Error opening ${appName}: ${stderr || error.message}`
      );
      outputChannel.appendLine(`${stderr || error.message}`);
      return;
    }

    vscode.workspace
      .openTextDocument({ content: stdout, language: "python" })
      .then((doc) => vscode.window.showTextDocument(doc));
    vscode.window.showInformationMessage(`Opened ${appName} from ESP32`);
  });
}

module.exports = { AppsProvider, openApp };
