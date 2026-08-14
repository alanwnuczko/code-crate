a = Analysis(
    ['Windows\\main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('Windows/index.html', 'Windows'),
        ('assets', 'assets'),
        ('css', 'css'),
        ('js', 'js'),
    ],
    hiddenimports=[
        # Modules imported inside Python.Runtime.dll at runtime
        'platform',
        'warnings',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=['rthook_pythonnet.py'],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='CodeCrate',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['assets\\tray.ico'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    # Exclude all .NET DLLs from UPX compression – UPX can corrupt managed
    # assemblies and prevent the CLR from loading them (PE header mangling).
    upx_exclude=[
        'Python.Runtime.dll',
        'ClrLoader.dll',
        '*.dll',
    ],
    name='CodeCrate',
)
