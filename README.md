# CodeCrate

## System requirements
### Windows
- **OS**: Windows 10/11
- **Architecture**: x64
- **Python**: 3.10+

### Linux
- **OS**: Ubuntu 22.04+ / Debian 12+ (or any Debian-based distro)
- **Python**: 3.10+
- **Desktop**: GNOME, KDE, XFCE, or any DE with AppIndicator support
<p align="center">
  <img src="assets/readme/2.png">
</p>
<p align="center">
  <img src="assets/readme/3.png" width="49.5%" />
  <img src="assets/readme/5.png" width="49.5%" />
</p>

## In-editor hints

Speed up development with inline code expansions.

Supported languages:
- HTML
- CSS
- JavaScript

### HTML boilerplate

Type `!` and press Enter to instantly generate a full HTML boilerplate.

<p align="center">
  <img src="assets/readme/7.png" width="47.5%" />
</p>

### Inline expansions

Expand abbreviations into complete code structures as you type.

<p align="center">
  <img src="assets/readme/8.png" width="47.5%" />
  <img src="assets/readme/9.png" width="47.5%" />
</p>

## Download

| Platform | Version | Download |
|----------|----------|----------|
| Windows 11 | v2.1 | [CodeCrateWindows.zip](https://github.com/alanwnuczko/code-crate/releases/tag/v2.1) |
| Linux | v2.1 | [CodeCrateLinux.tar.xz](https://github.com/alanwnuczko/code-crate/releases/tag/v2.1) |

---

## Build Guide
#### Windows Dependencies
```bash
pip install pyinstaller pywebview pystray pillow pywin32
```

#### Linux Dependencies
```bash
# Ubuntu/Debian system dependencies
sudo apt update
sudo apt install -y python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-webkit2-4.1 libgirepository1.0-dev gcc libcairo2-dev pkg-config python3-dev

# Python dependencies
pip install pyinstaller pywebview pystray pillow pygobject
```

### Building on Windows

#### Run PyInstaller
Execute the following command from the project root (`code-crate`):

```powershell
pyinstaller --noconfirm --onedir --windowed `
  --name "CodeCrate" `
  --icon "assets/tray.ico" `
  --add-data "Windows/index.html;." `
  --add-data "assets;assets" `
  --add-data "css;css" `
  --add-data "js;js" `
  "Windows/main.py"
```

### Building on Linux

#### Run PyInstaller
Execute the following command from the project root (`code-crate`):

```bash
pyinstaller --noconfirm --onedir --windowed \
  --name "CodeCrate" \
  --icon "assets/tray.png" \
  --add-data "Linux/index.html:." \
  --add-data "assets:assets" \
  --add-data "css:css" \
  --add-data "js:js" \
  "Linux/main.py"
```
