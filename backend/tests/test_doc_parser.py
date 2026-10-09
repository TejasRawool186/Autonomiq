import sys
import tempfile
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.tools.doc_parser import DocumentParser
from backend.app.storage.file_manager import FileManager


def test_parse_markdown():
    with tempfile.NamedTemporaryFile("w+", suffix=".md", delete=False, encoding="utf-8") as f:
        f.write("# Autonomiq Research\n\nThis is sample research data.")
        temp_path = Path(f.name)

    try:
        res = DocumentParser.parse_file(temp_path)
        assert res["title"] == "Autonomiq Research"
        assert "This is sample research data." in res["content"]
        assert res["format"] == "md"
    finally:
        temp_path.unlink()


def test_parse_text():
    with tempfile.NamedTemporaryFile("w+", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write("Raw research notes.")
        temp_path = Path(f.name)

    try:
        res = DocumentParser.parse_file(temp_path)
        assert res["title"] == temp_path.stem
        assert res["content"] == "Raw research notes."
        assert res["format"] == "txt"
    finally:
        temp_path.unlink()


def test_file_manager_artifact_saving():
    task_id = "test-task-123"
    content = b"# Generated Report\nEvidence summary."
    target_path, checksum, size = FileManager.save_artifact(task_id, "report.md", content)
    
    assert target_path.exists()
    assert size == len(content)
    assert len(checksum) == 64
    
    # Cleanup
    if target_path.exists():
        target_path.unlink()
        target_path.parent.rmdir()


if __name__ == "__main__":
    test_parse_markdown()
    test_parse_text()
    test_file_manager_artifact_saving()
    print("All doc parser tests passed!")
