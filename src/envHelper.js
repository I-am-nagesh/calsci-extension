const { exec } = require("child_process");
const vscode = require("vscode");
const os = require("os");

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout.trim());
    });
  });
}


async function getPythonCommand() {
  const candidates = os.platform() === "win32"
    ? ["python", "py", "python3"]
    : ["python3", "python"];
  for (const cmd of candidates) {
    try {
      await run(`${cmd} --version`);
      return cmd;
    } catch (_) {}
  }
  return null;
}

async function isMpremoteInstalled() {
  try {
    await run("mpremote --version");
    return true;
  } catch (_) {
    return false;
  }
}


async function ensurePythonAndMpremote(outputChannel) {
  const pythonCmd = await getPythonCommand();

  if (!pythonCmd) {
    vscode.window.showErrorMessage(
      "Python is not installed. Please install Python 3.7+ from python.org or Microsoft Store, then restart VS Code."
    );
    outputChannel.appendLine("❌ Python not found.");
    return false;
  }

  const hasMpremote = await isMpremoteInstalled();

  if (!hasMpremote) {
    const choice = await vscode.window.showWarningMessage(
      "mpremote not found. Install it now?",
      "Yes", "No"
    );
    if (choice === "Yes") {
      const terminal = vscode.window.createTerminal("Calsci Setup");
      terminal.show();
      terminal.sendText(`${pythonCmd} -m pip install --upgrade pip`);
      terminal.sendText(`${pythonCmd} -m pip install mpremote`);
      vscode.window.showInformationMessage(
        "Installing mpremote... Once done, re-run your command."
      );
      return false;
    } else {
      outputChannel.appendLine("⚠️ mpremote installation skipped by user.");
      return false;
    }
  }

  outputChannel.appendLine("✅ Python and mpremote are ready.");
  return true;
}

module.exports = { ensurePythonAndMpremote };
