const vscode = require("vscode");
const { SerialPort } = require("serialport");
const { makeApp } = require("./src/buildApp");
const { uploadFile } = require("./src/uploadManager");
const { getDeviceInfo } = require("./src/deviceManager");
const { openREPL } = require("./src/replManager");

const { fetchInstalledApps } = require("./src/fetchApps");

class CalsciTreeDataProvider {
  constructor() {}

  getTreeItem(element) {
    const item = new vscode.TreeItem(
      element.label,
      vscode.TreeItemCollapsibleState.None
    );
    item.command = {
      command: element.command,
      title: element.label,
      arguments: element.args || [],
    };
    return item;
  }

  getChildren() {
    return [
      { label: "🔹 Connect Device", command: "calsci.checkStatus" },
      { label: "🔹 Make App", command: "calsci.makeApp" },
      { label: "🔹 Upload Code", command: "calsci.uploadCode" },
      { label: "🔹 Device Info", command: "calsci.deviceInfo" },
      { label: "🔹 Open REPL", command: "calsci.openRepl" },

      { label: "🔹 Fetch Installed Apps", command: "calsci.fetchApps" },
    ];
  }
}

function activate(context) {
  const outputChannel = vscode.window.createOutputChannel("Calsci");

  // Status bar
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "Calsci: Checking...";
  statusBarItem.command = "calsci.showMenu";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Device check
  async function checkDevice() {
    try {
      const ports = await SerialPort.list();
      const target = ports.find(
        (p) =>
          p.vendorId === "10C4" ||
          (p.manufacturer &&
            (p.manufacturer.includes("Espressif") ||
              p.manufacturer.includes("Silicon"))) ||
          p.path.includes("ttyUSB") ||
          p.path.includes("COM")
      );

      if (target) statusBarItem.text = `Calsci: Connected (${target.path})`;
      else statusBarItem.text = "Calsci: Not Connected";
    } catch (err) {
      console.error("Device check error:", err);
      statusBarItem.text = "Calsci: Error";
    }
  }

  checkDevice();
  const interval = setInterval(checkDevice, 5000);
  context.subscriptions.push({ dispose: () => clearInterval(interval) });

  // Tree view provider
  const provider = new CalsciTreeDataProvider();
  vscode.window.registerTreeDataProvider("calsciView", provider);

  // Register commands
  context.subscriptions.push(
    //register command for fetching installed apps
    vscode.commands.registerCommand("calsci.fetchApps", async () => {
      const ports = await SerialPort.list();
      const target = ports.find(
        (p) => p.path.includes("ttyUSB") || p.path.includes("COM")
      );

      if (!target) {
        vscode.window.showErrorMessage("No device connected.");
        return;
      }

      outputChannel.appendLine(
        `Fetching installed apps from ${target.path}...`
      );
      fetchInstalledApps(target.path, (err, apps) => {
        if (err) {
          vscode.window.showErrorMessage(err);
          outputChannel.appendLine(err);
        } else {
          vscode.window.showInformationMessage(`Fetched ${apps.length} apps`);
          outputChannel.show(true);
          outputChannel.appendLine("=== Installed Apps ===");
          apps.forEach((app) => outputChannel.appendLine(app));
        }
      });
    }),

    //regiter command for checking device status
    vscode.commands.registerCommand("calsci.checkStatus", async () => {
      const ports = await SerialPort.list();
      const target = ports.find(
        (p) => p.path.includes("ttyUSB") || p.path.includes("COM")
      );
      vscode.window.showInformationMessage(
        target ? `Device connected: ${target.path}` : "No device connected"
      );
    }),

    vscode.commands.registerCommand("calsci.makeApp", async () => {
      await makeApp(outputChannel);
    }),

    //register command for uploading code or file
    vscode.commands.registerCommand("calsci.uploadCode", async () => {
      const ports = await SerialPort.list();
      const target = ports.find(
        (p) => p.path.includes("ttyUSB") || p.path.includes("COM")
      );
      if (target) uploadFile(target.path);
      else vscode.window.showErrorMessage("No device connected.");
    }),

    //register command for getting device info
    vscode.commands.registerCommand("calsci.deviceInfo", () => {
      getDeviceInfo((err, info) => {
        if (err) vscode.window.showErrorMessage("Error: " + err);
        else {
          vscode.window.showInformationMessage(info);
          outputChannel.show(true);
          outputChannel.appendLine("=== Device Info ===");
          outputChannel.appendLine(info);
        }
      });
    }),

    //register command for opening repl
    vscode.commands.registerCommand("calsci.openRepl", async () => {
      const ports = await SerialPort.list();
      const target = ports.find(
        (p) => p.path.includes("ttyUSB") || p.path.includes("COM")
      );
      if (target) openREPL(target.path);
      else vscode.window.showErrorMessage("No device connected.");
    }),

    //register command for showing menu
    vscode.commands.registerCommand("calsci.showMenu", async () => {
      const statusText = statusBarItem.text;
      if (!statusText.includes("Connected")) {
        vscode.window.showWarningMessage("No Calsci device connected.");
        return;
      }

      const choice = await vscode.window.showQuickPick(
        ["Upload Code", "Open REPL", "Device Info", "Make App"],
        { placeHolder: "Calsci - Choose an action" }
      );

      if (!choice) return;

      switch (choice) {
        case "Upload Code":
          vscode.commands.executeCommand("calsci.uploadCode");
          break;
        case "Open REPL":
          vscode.commands.executeCommand("calsci.openRepl");
          break;
        case "Device Info":
          vscode.commands.executeCommand("calsci.deviceInfo");
          break;
        case "Make App":
          vscode.commands.executeCommand("calsci.makeApp");
          break;
      }
    })
  );

  console.log("Calsci extension activated!");
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
