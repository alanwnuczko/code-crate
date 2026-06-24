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
  <img src="assets/readme/6.png">
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
  <img src="assets/readme/4.png" width="47.5%" />
</p>

### Inline expansions

Expand abbreviations into complete code structures as you type.

<p align="center">
  <img src="assets/readme/2.png" width="47.5%" />
  <img src="assets/readme/3.png" width="47.5%" />
</p>

## Download

| Platform | Version | Download |
|----------|----------|----------|
| Windows 11 | v1.2 | [CodeCrate.zip](https://github.com/alanwnuczko/code-crate/releases/tag/Windows) |
| Linux | v1.2 | [CodeCrate.tar.xz](https://github.com/alanwnuczko/code-crate/releases/tag/Linux) |

## Python Dependencies
```shell
pip install pywebview pillow pystray
```

## APT Dependencies

```shell
sudo apt update
sudo apt install -y \
    python3 python3-pip python3-venv \
    python3-gi python3-gi-cairo \
    gir1.2-gtk-3.0 \
    gir1.2-webkit2-4.1 \
    gir1.2-ayatanaappindicator3-0.1 \
    libgirepository1.0-dev \
    gcc libcairo2-dev pkg-config
```