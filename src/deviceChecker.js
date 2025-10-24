const vscode = require("vscode");
const { SerialPort } = require("serialport");
const os = require("os");

async function findESP32Port() {
  const ports = await SerialPort.list();
  const platform = os.platform(); // 'win32', 'darwin', 'linux'

  return (
    ports.find((p) => {
      const path = p.path.toLowerCase();
      const manufacturer = p.manufacturer ? p.manufacturer.toLowerCase() : "";

      if (p.vendorId === "10C4") return true;
      if (manufacturer.includes("espressif")) return true;
      if (manufacturer.includes("silicon")) return true;

      // Platform-specific path heuristics
      if (platform === "linux")
        return path.includes("ttyusb") || path.includes("ttyacm");
      if (platform === "darwin")
        return path.includes("cu.slab") || path.includes("cu.usbserial");
      if (platform === "win32") return path.includes("com");

      return false;
    }) || null
  );
}

async function checkDevice(statusBarItem, outputChannel) {
  try {
    const target = await findESP32Port();

    if (target) {
      statusBarItem.text = `Calsci: Connected (${target.path})`;
      outputChannel.appendLine(`✅ Device connected: ${target.path}`);
      return target.path;
    } else {
      statusBarItem.text = "Calsci: Not Connected";
      outputChannel.appendLine(
        "⚠️ Device not detected. Possible driver issue or unplugged device."
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
    console.error("Device check error:", err);
    statusBarItem.text = "Calsci: Error";
    outputChannel.appendLine(`❌ Device check failed: ${err.message}`);
    return null;
  }
}

module.exports = { findESP32Port, checkDevice };
