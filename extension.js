const vscode = require("vscode");
const { makeApp } = require("./src/buildApp");
const { uploadFile } = require("./src/uploadManager");
const {
  initDeviceWatcher,
  getConnectedPort,
  getDeviceInfo,
} = require("./src/deviceManager");
const { openREPL } = require("./src/replManager");

const { fetchInstalledApps } = require("./src/fetchApps");
const { AppsProvider, openApp } = require("./src/appView");
const { ensurePythonAndMpremote } = require("./src/envHelper");

const { showWelcomePage } = require("./src/webview/welcome");

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
      { label: "🔹 Check Environment", command: "calsci.checkEnv" },
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

  // Device check interval
  initDeviceWatcher(statusBarItem, outputChannel);

  context.subscriptions.push(outputChannel);

  // Tree view provider
  const provider = new CalsciTreeDataProvider();
  vscode.window.registerTreeDataProvider("calsciView", provider);

  // // Sidebar for installed apps
  // const appsProvider = new AppsProvider(null, outputChannel);
  // vscode.window.registerTreeDataProvider("calsciAppsView", appsProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("calsci.checkEnv", async () => {
      const ready = await ensurePythonAndMpremote(outputChannel);
      if (ready)
        vscode.window.showInformationMessage("Environment looks good!");
    }),
    //register command for fetching installed apps
    vscode.commands.registerCommand("calsci.fetchApps", async () => {
      // const ports = await SerialPort.list();
      // const target = ports.find(
      //   (p) => p.path.includes("ttyUSB") || p.path.includes("COM")
      // );

      // if (!target) {
      //   vscode.window.showErrorMessage("No device connected.");
      //   return;
      // }

      // outputChannel.appendLine(
      //   `Fetching installed apps from ${target.path}...`
      // );
      // fetchInstalledApps(target.path, (err, apps) => {
      //   if (err) {
      //     vscode.window.showErrorMessage(err);
      //     outputChannel.appendLine(err);
      //   } else {
      //     vscode.window.showInformationMessage(`Fetched ${apps.length} apps`);
      //     outputChannel.show(true);
      //     outputChannel.appendLine("=== Installed Apps ===");
      //     apps.forEach((app) => outputChannel.appendLine(app));

      //     // register and refresh only when apps are fetch
      //     const appsProvider = new AppsProvider(target.path, outputChannel);
      //     vscode.window.registerTreeDataProvider(
      //       "calsciAppsView",
      //       appsProvider
      //     );

      //     // refreshing sidebar
      //     appsProvider.refresh(apps);

      //     // installed app view
      //     vscode.commands.executeCommand(
      //       "workbench.view.extension.calsciSidebar"
      //     );
      //   }
      // });

      fetchInstalledApps(
        vscode.window.createOutputChannel("Calsci"),
        async (err, apps) => {
          if (err) {
            vscode.window.showErrorMessage(err);
            return;
          }

          vscode.window.showInformationMessage(`Fetched ${apps.length} apps`);

          const outputChannel = vscode.window.createOutputChannel("Calsci");
          outputChannel.show(true);
          outputChannel.appendLine("=== Installed Apps ===");
          apps.forEach((app) => outputChannel.appendLine(app));

          // Initialize AppsProvider and register sidebar
          const appsProvider = new AppsProvider(outputChannel);
          vscode.window.registerTreeDataProvider(
            "calsciAppsView",
            appsProvider
          );

          // Refresh sidebar with fetched apps
          appsProvider.refresh(apps);

          // Show sidebar
          vscode.commands.executeCommand(
            "workbench.view.extension.calsciSidebar"
          );
        }
      );
    }),

    // open app command (used by AppsProvider)
    vscode.commands.registerCommand("calsci.openApp", async (appName) => {
      const outputChannel = vscode.window.createOutputChannel("Calsci");
      await openApp(appName, outputChannel);
    }),
    //regiter command for checking device status
    vscode.commands.registerCommand("calsci.checkStatus", async () => {
      const outputChannel = vscode.window.createOutputChannel("Calsci");
      const port = await getConnectedPort(outputChannel);
      if (port) {
        vscode.window.showInformationMessage(`Device connected: ${port}`);
        outputChannel.appendLine(`Device connected: ${port}`);
      } else {
        vscode.window.showWarningMessage("No Calsci device connected.");
        outputChannel.appendLine("No device connected.");
      }
    }),

    vscode.commands.registerCommand("calsci.makeApp", async () => {
      await makeApp(outputChannel);
    }),

    //register command for uploading code or file
    vscode.commands.registerCommand("calsci.uploadCode", async () => {
      try {
        const port = await getConnectedPort(outputChannel);
        if (!port) {
          vscode.window.showErrorMessage("No device connected.");
          return;
        }

        await uploadFile(outputChannel);
      } catch (err) {
        vscode.window.showErrorMessage("Upload failed: " + err.message);
      }
    }),

    //register command for getting device info
    vscode.commands.registerCommand("calsci.deviceInfo", async () => {
      getDeviceInfo(outputChannel, (err, info) => {
        if (err) {
          vscode.window.showErrorMessage("Error: " + err);
        } else {
          vscode.window.showInformationMessage("Device info fetched!");
          outputChannel.show(true);
          outputChannel.appendLine("=== Device Info ===");
          outputChannel.appendLine(info);
        }
      });
    }),

    //register command for opening repl
    vscode.commands.registerCommand("calsci.openRepl", async () => {
      await openREPL(outputChannel);
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

  if (!context.globalState.get("calsci.welcomeShown")) {
    showWelcomePage(context);
    context.globalState.update("calsci.welcomeShown", true);
  }

  console.log("Calsci extension activated!");
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
