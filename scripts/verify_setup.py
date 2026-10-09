"""Autonomiq Setup & Structure Verification Script.
Validates the workspace structure, directories, configurations, and core dependencies.
"""

import sys
import shutil
from pathlib import Path

REQUIRED_DIRS = [
    "backend/app/api",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/agent/nodes",
    "backend/app/tools",
    "backend/app/workflows",
    "backend/app/storage",
    "backend/tests",
    "frontend",
    "data/sqlite",
    "data/qdrant",
    "data/uploads",
    "data/artifacts",
    "scripts",
]

REQUIRED_FILES = [
    "srs.md",
    "task_plan.md",
    "findings.md",
    "progress.md",
    ".gitignore",
    ".env.example",
    "backend/requirements.txt",
    "backend/app/config.py",
]

def main():
    root = Path(__file__).resolve().parent.parent
    print(f"=== Autonomiq Verification ===")
    print(f"Project Root: {root}")
    print(f"Python Runtime: {sys.version.split()[0]}")

    missing_dirs = []
    for d in REQUIRED_DIRS:
        path = root / d
        if not path.is_dir():
            missing_dirs.append(d)

    missing_files = []
    for f in REQUIRED_FILES:
        path = root / f
        if not path.is_file():
            missing_files.append(f)

    if missing_dirs:
        print(f"[FAIL] Missing directories: {missing_dirs}")
    else:
        print(f"[PASS] All {len(REQUIRED_DIRS)} required directories exist.")

    if missing_files:
        print(f"[FAIL] Missing files: {missing_files}")
    else:
        print(f"[PASS] All {len(REQUIRED_FILES)} required files exist.")

    # Check external tools
    node_path = shutil.which("node")
    print(f"Node.js found: {'Yes (' + node_path + ')' if node_path else 'No'}")

    ollama_path = shutil.which("ollama")
    print(f"Ollama CLI found: {'Yes (' + ollama_path + ')' if ollama_path else 'No (optional or cloud/service mode)'}")

    if not missing_dirs and not missing_files:
        print("\nAll structure checks passed successfully! Project is ready for Phase 1.")
        return 0
    return 1

if __name__ == "__main__":
    sys.exit(main())
