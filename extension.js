const vscode = require('vscode');
const { SerialPort } = require('serialport');

function activate(context) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = 'Calsci: Checking...';
  statusBarItem.command = 'calsci.showMenu'; // ✅ Add click handler
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  async function checkDevice() {
    try {
      const ports = await SerialPort.list();

      const targetDevice = ports.find(port =>
        port.vendorId === '10C4' ||   // Update VID later
        (port.manufacturer && (
          port.manufacturer.includes('Espressif') ||
          port.manufacturer.includes('Silicon')
        )) ||
        port.path.includes('ttyUSB') ||
        port.path.includes('COM')
      );

      if (targetDevice) {
        statusBarItem.text = `Calsci: Connected (${targetDevice.path})`;
      } else {
        statusBarItem.text = 'Calsci: Not Connected';
      }
    } catch (error) {
      // Log the error and show a brief message including the error text to avoid unused-variable linting
      console.error('Error checking device:', error);
      statusBarItem.text = `Calsci: Error${error && error.message ? ` (${error.message})` : ''}`;
    }
  }

  // ✅ Run once on startup
  checkDevice();

  // ✅ Run every 5 seconds
  const interval = setInterval(checkDevice, 5000);
  context.subscriptions.push({ dispose: () => clearInterval(interval) });

  // ✅ Keep the command for manual checking
  let disposable = vscode.commands.registerCommand('calsci.checkStatus', checkDevice);
  context.subscriptions.push(disposable);


  let showMenuCmd = vscode.commands.registerCommand('calsci.showMenu', async () => {
  const statusText = statusBarItem.text;

  if (statusText.includes('Connected')) {
    const choice = await vscode.window.showQuickPick([
      'Upload Code',
      'Open REPL',
      'Get Device Info',
      'Reset Device',
      'Disconnect'
    ], { placeHolder: 'Calsci - Choose an action' });

    vscode.window.showInformationMessage(`You selected: ${choice}`);
  } else {
    const choice = await vscode.window.showQuickPick([
      'Rescan Devices',
      'Setup / Help',
    ], { placeHolder: 'Calsci - Device not connected' });

    vscode.window.showInformationMessage(`You selected: ${choice}`);
  }
});

context.subscriptions.push(showMenuCmd);

}




function deactivate() {}

module.exports = {
  activate,
  deactivate
};


