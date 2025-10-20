const vscode = require("vscode");
const { SerialPort } = require("serialport");

const { uploadFile } = require("./uploadManager");
const { openREPL } = require("./replManager");
const { getDeviceInfo } = require("./deviceManager");
const { makeApp } = require("./buildApp");

function activate(context) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "Calsci: Checking...";
  statusBarItem.command = "calsci.showMenu";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  let outputChannel = vscode.window.createOutputChannel("calsci");

  //checking device connection status
  async function checkDevice() {
    try {
      const ports = await SerialPort.list();
      const targetDevice = ports.find(
        (port) =>
          port.vendorId === "10C4" ||
          (port.manufacturer &&
            (port.manufacturer.includes("Espressif") ||
              port.manufacturer.includes("Silicon"))) ||
          port.path.includes("ttyUSB") ||
          port.path.includes("COM")
      );

      if (targetDevice) {
        statusBarItem.text = `Calsci: Connected (${targetDevice.path})`;
      } else {
        statusBarItem.text = "Calsci: Not Connected";
      }
    } catch (error) {
      console.error("Error checking device:", error);
      statusBarItem.text = `Calsci: Error${
        error && error.message ? ` (${error.message})` : ""
      }`;
    }
  }

  checkDevice(); // initial check
  const interval = setInterval(checkDevice, 5000); // every 5 sec
  context.subscriptions.push({ dispose: () => clearInterval(interval) });

  // Command to check status manually
  let disposable = vscode.commands.registerCommand(
    "calsci.checkStatus",
    checkDevice
  );
  context.subscriptions.push(disposable);

  // make app command
  let makeAppCmd = vscode.commands.registerCommand(
    "calsci.makeApp",
    async () => {
      await makeApp(outputChannel);
    }
  );
  context.subscriptions.push(makeAppCmd);

  // showing menu command
  let showMenuCmd = vscode.commands.registerCommand(
    "calsci.showMenu",
    async () => {
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

      // upload code
      if (choice === "Upload Code") {
        const ports = await SerialPort.list();
        const targetDevice = ports.find(
          (port) =>
            port.vendorId === "10C4" ||
            (port.manufacturer &&
              (port.manufacturer.includes("Espressif") ||
                port.manufacturer.includes("Silicon"))) ||
            port.path.includes("ttyUSB") ||
            port.path.includes("COM")
        );

        if (!targetDevice) {
          vscode.window.showErrorMessage("Device not found for upload.");
        } else {
          uploadFile(targetDevice.path);
        }
      }

      // opening repl
      if (choice === "Open REPL") {
        const ports = await SerialPort.list();
        const targetDevice = ports.find(
          (port) =>
            port.vendorId === "10C4" ||
            (port.manufacturer &&
              (port.manufacturer.includes("Espressif") ||
                port.manufacturer.includes("Silicon"))) ||
            port.path.includes("ttyUSB") ||
            port.path.includes("COM")
        );

        if (!targetDevice) {
          vscode.window.showErrorMessage("Device not found for REPL.");
        } else {
          openREPL(targetDevice.path);
        }
      }

      // device info
      if (choice === "Device Info") {
        getDeviceInfo((err, info) => {
          if (err) {
            vscode.window.showErrorMessage("Error getting device info: " + err);
            outputChannel.appendLine(err);
          } else {
            vscode.window.showInformationMessage("Device Info: " + info);
            outputChannel.show(true);
            outputChannel.appendLine("=== Device Info ===");
            outputChannel.appendLine(info);
          }
        });
      }

      // make app trigger
      if (choice === "Make App") {
        vscode.commands.executeCommand("calsci.makeApp");
      }
    }
  );

  context.subscriptions.push(showMenuCmd);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
