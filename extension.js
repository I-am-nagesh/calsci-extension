const vscode = require("vscode");
const { SerialPort } = require("serialport");

const { uploadFile } = require("./uploadManager");

const { openREPL } = require("./replManager");

function activate(context) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = "Calsci: Checking...";
  statusBarItem.command = "calsci.showMenu";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  async function checkDevice() {
    try {
      const ports = await SerialPort.list();

      const targetDevice = ports.find(
        (port) =>
          port.vendorId === "10C4" || //vid for esp32-wroom
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

  checkDevice(); //run on startup

  const interval = setInterval(checkDevice, 5000); //run every 5 sec
  context.subscriptions.push({ dispose: () => clearInterval(interval) });

  let disposable = vscode.commands.registerCommand(
    "calsci.checkStatus",
    checkDevice
  );
  context.subscriptions.push(disposable);

  let showMenuCmd = vscode.commands.registerCommand(
    "calsci.showMenu",
    async () => {
      const statusText = statusBarItem.text;

      //menu list
      if (statusText.includes("Connected")) {
        const choice = await vscode.window.showQuickPick(
          [
            "Upload Code",
            "Open REPL",
            "Get Device Info",
            "Reset Device",
            "Disconnect",
          ],
          { placeHolder: "Calsci - Choose an action" }
        );

        //to upload code
        if (choice === "Upload Code") {
          const ports = await require("serialport").SerialPort.list();
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

        //to open repl
        if (choice === "Open REPL") {
          const ports = await require("serialport").SerialPort.list();
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

        vscode.window.showInformationMessage(`You selected: ${choice}`);
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
