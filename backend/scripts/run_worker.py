"""Convenience proxy script so running from backend/ directory also works."""
import runpy
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

if __name__ == "__main__":
    target = project_root / "scripts" / "run_worker.py"
    runpy.run_path(str(target), run_name="__main__")
