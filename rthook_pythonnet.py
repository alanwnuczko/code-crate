"""
PyInstaller runtime hook for pythonnet / clr_loader.

When frozen, ClrLoader.dll (the unmanaged .NET Framework loader) is loaded from
_internal\clr_loader\ffi\dlls\amd64\. It depends on python311.dll, which lives
at the _internal root. Without the _internal directory on PATH, the OS DLL search
cannot find python311.dll, causing pyclr_get_function() to return NULL and raising:
  RuntimeError: Failed to resolve Python.Runtime.Loader.Initialize from Python.Runtime.dll

Adding sys._MEIPASS to PATH at the very start of the frozen process fixes this.
"""
import os
import sys

if getattr(sys, "frozen", False):
    # Prepend the bundle root so ClrLoader.dll can resolve python311.dll and any
    # other sibling DLLs that the .NET loader needs to call back into Python.
    _meipass = sys._MEIPASS
    os.environ["PATH"] = _meipass + os.pathsep + os.environ.get("PATH", "")
