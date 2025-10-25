const vscode = require("vscode");
const { exec } = require("child_process");
const { getConnectedPort } = require("./deviceManager");

class AppsProvider {
  constructor(outputChannel) {
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

async function openApp(appName, outputChannel) {
  try {
    const port = await getConnectedPort(outputChannel);
    if (!port) {
      vscode.window.showErrorMessage("No Calsci device connected.");
      return;
    }

    const command = `mpremote connect ${port} fs cat :/apps/installed_apps/${appName}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const msg = `Error opening ${appName}: ${stderr || error.message}`;
        vscode.window.showErrorMessage(msg);
        outputChannel.appendLine(msg);
        return;
      }

      vscode.workspace
        .openTextDocument({ content: stdout, language: "python" })
        .then((doc) => vscode.window.showTextDocument(doc));
      vscode.window.showInformationMessage(
        `Opened ${appName} from Calsci device`
      );
      outputChannel.appendLine(`Opened app: ${appName}`);
    });
  } catch (err) {
    const msg = `Unexpected error opening ${appName}: ${err.message}`;
    vscode.window.showErrorMessage(msg);
    outputChannel.appendLine(msg);
  }
}

module.exports = { AppsProvider, openApp };
