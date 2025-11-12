const { exec } = require("child_process");
const { getConnectedPort } = require("./deviceManager");
const vscode = require("vscode");

//fetching list of installed apps from calsci
async function fetchInstalledApps(outputChannel, callback) {
  try {
    const port = await getConnectedPort(outputChannel);
    if (!port) {
      const msg = "No Calsci device connected.";
      vscode.window.showErrorMessage(msg);
      callback(msg, null);
      return;
    }

    const command = `mpremote connect "${port}" fs ls :/apps/installed_apps`;
    // outputChannel.appendLine(`Fetching installed apps from ${port}...`);

    exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const msg = `Error fetching apps: ${stderr || error.message}`;
        // outputChannel.appendLine(msg);
        callback(msg, null);
        return;
      }

      if (stderr) {
        // outputChannel.appendLine(`Stderr: ${stderr}`);
      }

      //parsing app list clearly
      const apps = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !line.startsWith("Connected") &&
            !line.startsWith("ls ") &&
            !line.startsWith("installed_app") &&
            !line.includes("Error")
        )
        .map((line) => {
          const parts = line.split(/\s+/);
          return parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
        })
        .filter((value, index, self) => value && self.indexOf(value) === index);

      // outputChannel.appendLine(`Found ${apps.length} apps.`);
      callback(null, apps);
    });
  } catch (err) {
    const msg = `Unexpected error: ${err.message}`;
    // outputChannel.appendLine(msg);
    callback(msg, null);
  }
}

module.exports = { fetchInstalledApps };
