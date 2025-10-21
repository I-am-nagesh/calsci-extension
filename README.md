# Calsci Extension

**Calsci Extension** is a VS Code extension for **MicroPython development on ESP32 devices**. It simplifies building, uploading, and testing small MicroPython apps, providing a friendly UI and seamless workflow for developers working with Calsci-compatible devices.

---

## Features

- **Device Connection Status:** Shows if your Calsci device (ESP32) is connected in the status bar.
- **App Builder:** Create a new `app.py` inside a selected folder and start coding immediately.
- **Upload Code:** Upload Python files directly to your connected ESP32 using `mpremote`.
- **Open REPL:** Open a live REPL session to interact with your MicroPython device.
- **Device Info:** Quickly check connected device information like firmware, memory, and more.
- **Sidebar UI:** Easy-to-use sidebar for accessing all features with buttons for every action.

*Example Workflow:*

1. Click **Make App** in the sidebar → select folder → `app.py` opens.
2. Write your MicroPython code.
3. Click **Upload App** to send it to the ESP32.
4. Use **Open REPL** to interact or test the code live.

---

## Requirements

- **VS Code** (version 1.105.0 or higher)
- **Node.js** for extension development
- **SerialPort** (already included in dependencies)
- **MicroPython-compatible ESP32 device**
- **mpremote** installed on your system (`pip install mpremote`)

---

## Extension Settings

This extension does not currently contribute user-configurable settings.

---

## Known Issues

- Only tested with ESP32-based devices. Other MicroPython boards may require modifications.
- Sidebar UI may require reloading VS Code if new commands are added.

---

## Release Notes

### 1.0.0
- Initial release with core features:
  - Device connection status
  - App builder
  - Upload Python code
  - Open REPL
  - Device info
  - Sidebar UI integration

---

## Getting Started

After installing the extension:

1. Connect your ESP32 device via USB.
2. Open the **Calsci Sidebar** in VS Code.
3. Use the buttons to **Make App**, **Upload App**, **Open REPL**, or view **Device Info**.
4. Enjoy a seamless MicroPython development experience.

---

## Additional Resources

- [Visual Studio Code](https://code.visualstudio.com/)
- [MicroPython Documentation](https://docs.micropython.org/)
- [mpremote Documentation](https://docs.micropython.org/en/latest/reference/mpremote.html)
