const { exec } = require("child_process");

const DEVICE_PATH = "/dev/ttyUSB0";

function getDeviceInfo(callback) {

    //command to get device info
  const command = `mpremote connect ${DEVICE_PATH} exec "import os; print(os.uname())"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(`Error: ${stderr || error.message}`, null);
    } else {
      callback(null, stdout.trim());
    }
  });
}

module.exports = {
  getDeviceInfo,
};
