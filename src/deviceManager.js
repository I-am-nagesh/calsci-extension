const vscode = require("vscode");
const { SerialPort } = require("serialport");
const { exec } = require("child_process");
const os = require("os");

let connectedPort = null; // cache currently connected device path

//finding esp32 details
async function findESP32Port() {
  const ports = await SerialPort.list();
  const platform = os.platform();

  const port = ports.find((p) => {
    const path = p.path.toLowerCase();
    const manufacturer = p.manufacturer ? p.manufacturer.toLowerCase() : "";

    if (p.vendorId === "10C4") return true;
    if (manufacturer.includes("espressif")) return true;
    if (manufacturer.includes("silicon")) return true;

    if (platform === "linux")
      return path.includes("ttyusb") || path.includes("ttyacm");
    if (platform === "darwin")
      return path.includes("cu.slab") || path.includes("cu.usbserial");
    if (platform === "win32") return path.includes("com");

    return false;
  });

  return port || null;
}

//checking device and update status bar
async function checkDevice(statusBarItem, outputChannel) {
  try {
    const port = await findESP32Port();
    if (port) {
      connectedPort = port.path;
      statusBarItem.text = `Calsci: Connected (${connectedPort})`;
      outputChannel.appendLine(`Device connected: ${connectedPort}`);
      return connectedPort;
    } else {
      connectedPort = null;
      statusBarItem.text = "Calsci: Not Connected";
      outputChannel.appendLine(
        "Device not detected. Possible driver issue or unplugged device."
      );

      const choice = await vscode.window.showWarningMessage(
        "Calsci device not detected. Ensure the device is plugged in and drivers are installed.",
        "Help",
        "Ignore"
      );

      if (choice === "Help") {
        const url =
          "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers";
        vscode.env.openExternal(vscode.Uri.parse(url));
      }
      return null;
    }
  } catch (err) {
    connectedPort = null;
    statusBarItem.text = "Calsci: Error";
    outputChannel.appendLine(`Device check failed: ${err.message}`);
    console.error("Device check error:", err);
    return null;
  }
}

//updating device watch every 5sec
function initDeviceWatcher(statusBarItem, outputChannel) {
  checkDevice(statusBarItem, outputChannel);
  const interval = setInterval(async () => {
    const port = await findESP32Port();
    if (port && port.path !== connectedPort) {
      connectedPort = port.path;
      outputChannel.appendLine(`Device changed: ${connectedPort}`);
      statusBarItem.text = `Calsci: Connected (${connectedPort})`;
    } else if (!port && connectedPort) {
      connectedPort = null;
      outputChannel.appendLine("Device disconnected.");
      statusBarItem.text = "Calsci: Not Connected";
    }
  }, 5000);

  return interval;
}

//getting port connected
async function getConnectedPort(outputChannel) {
  if (connectedPort) return connectedPort;

  outputChannel.appendLine("No cached device found, checking...");
  const port = await findESP32Port();
  if (port) {
    connectedPort = port.path;
    outputChannel.appendLine(`Found device: ${connectedPort}`);
    return connectedPort;
  } else {
    vscode.window.showWarningMessage("No Calsci device connected.");
    return null;
  }
}

//getting device info
async function getDeviceInfo(outputChannel, callback) {
  try {
    const port = await getConnectedPort(outputChannel);
    if (!port) {
      callback("No device connected", null);
      return;
    }

    const command = `mpremote connect ${port} exec "import os; import sys; print('Platform:', sys.platform); print('Firmware:', os.uname())"`;
    outputChannel.appendLine(`Fetching device info from ${port}...`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        const msg = `Error getting device info: ${stderr || error.message}`;
        outputChannel.appendLine(msg);
        callback(msg, null);
        return;
      }

      const info = stdout.trim();
      outputChannel.appendLine(`Device info fetched:\n${info}`);
      callback(null, info);
    });
  } catch (err) {
    const msg = `Unexpected error: ${err.message}`;
    outputChannel.appendLine(msg);
    callback(msg, null);
  }
}

module.exports = {
  findESP32Port,
  checkDevice,
  initDeviceWatcher,
  getConnectedPort,
  getDeviceInfo,
};
