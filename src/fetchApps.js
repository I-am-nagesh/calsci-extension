const { exec } = require("child_process");

function fetchInstalledApps(port, callback) {
  const command = `mpremote connect ${port} ls installed_app`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(`Error fetching apps: ${stderr || error.message}`);
      return;
    }

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

    callback(null, apps);
  });
}

module.exports = { fetchInstalledApps };
