#!/usr/bin/env python3
"""Run purchased CueKeeper 1.0.0 against public fictional fixtures, offline."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
import zipfile

ARCHIVE_SHA256 = "b9d7fdb31bdbe69423b5031e1681a9868406b7fb093cef82b8db66396fcc6dcc"
BASE = Path(__file__).resolve().parent
REPOSITORY = BASE.parents[1]
CASES = (
    ("clean", 0), ("invalid-timestamp", 2), ("reversed-interval", 2),
    ("empty-dialogue", 2), ("warnings", 0), ("zero-length", 0),
    ("nonadjacent-overlap", 0),
)
REPORT_FIELDS = ("source_name", "detected_format", "status", "parsed_cue_count", "emitted_cue_count", "warnings", "errors")
SUMMARY_FIELDS = ("status", "total_files", "completed_files", "failed_files")


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Locally held purchased CueKeeper 1.0.0 ZIP; never downloaded by this script")
    parser.add_argument("--work-dir", required=True, type=Path, help="New isolated directory outside the repository")
    parser.add_argument("--verify-published", action="store_true", help="Compare selected outputs with committed evidence")
    args = parser.parse_args()
    archive = args.archive.read_bytes()
    if digest(archive) != ARCHIVE_SHA256:
        parser.error("Archive SHA-256 does not match the reviewed CueKeeper 1.0.0 release")
    work = args.work_dir.resolve()
    if work == REPOSITORY or REPOSITORY in work.parents:
        parser.error("Runtime work directory must be outside the repository")
    work.mkdir(parents=True, exist_ok=False)
    toolkit = work / "toolkit"
    for directory in (toolkit, toolkit / "fixtures", work / "captures", work / "public", work / "tmp", work / "home"):
        directory.mkdir()
    with zipfile.ZipFile(args.archive) as bundle:
        for filename in ("app.py", "cuekeeper.py"):
            (toolkit / filename).write_bytes(bundle.read(f"cuekeeper-1.0.0/{filename}"))
    environment = {
        "PATH": os.environ.get("PATH", ""), "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1", "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8",
        "TEMP": str(work / "tmp"), "TMP": str(work / "tmp"),
        "HOME": str(work / "home"), "USERPROFILE": str(work / "home"),
    }
    for key in ("SYSTEMROOT", "WINDIR"):
        if key in os.environ:
            environment[key] = os.environ[key]
    evidence = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "method": "First-party automated offline CLI runs of fictional fixtures in a new isolated directory",
        "product": "CueKeeper", "version": "1.0.0", "archive_sha256": ARCHIVE_SHA256,
        "runtime": {"implementation": platform.python_implementation(), "python": platform.python_version(), "platform": platform.system()},
        "command_launcher": "python means the interpreter running this reproduction script; use python3 or py -3 for the same installed version where appropriate",
        "public_selection": {
            "report_fields": list(REPORT_FIELDS), "batch_summary_fields": list(SUMMARY_FIELDS) + ["results (selected report fields)"],
            "json_transform": "Selected deterministic fields, pretty-printed with sorted keys and LF newlines; these files are excerpts, not full unmodified reports",
            "inputs_and_transcripts": "Copied byte-for-byte; no text changes",
            "raw_output": "Raw stdout, stderr, reports, and runtime files remain only in the private work directory; SHA-256 digests below record the observed raw output",
        },
        "private_runtime_artifacts_not_published": ["app.py", "cuekeeper.py", "cuekeeper.db", "captures/*.stdout.json", "captures/*.stderr.txt"],
        "cases": [],
        "limits": "Fictional SRT fixtures only; no customer/media accuracy, exhaustive SRT/WebVTT conformance, usability, time-saving, payment, sales, or profit result established. The CLI was tested with the recorded Python version, not every declared supported version.",
    }
    for case_id, expected_exit in CASES:
        source = BASE / "samples" / case_id / f"{case_id}.srt"
        input_bytes = source.read_bytes()
        (toolkit / "fixtures" / source.name).write_bytes(input_bytes)
        arguments = ["app.py", "convert", f"fixtures/{source.name}", "-o", f"output/{case_id}", "--dialogue-only"]
        result = subprocess.run([sys.executable, *arguments], cwd=toolkit, env=environment,
                                stdin=subprocess.DEVNULL, capture_output=True, timeout=30, check=False)
        (work / "captures" / f"{case_id}.stdout.json").write_bytes(result.stdout)
        (work / "captures" / f"{case_id}.stderr.txt").write_bytes(result.stderr)
        if result.returncode != expected_exit or result.stderr:
            raise RuntimeError(f"Unexpected CLI result for {case_id}: exit {result.returncode}, stderr bytes {len(result.stderr)}")
        output = toolkit / "output" / case_id
        raw_report = json.loads((output / f"{case_id}.report.json").read_text(encoding="utf-8"))
        raw_summary = json.loads((output / "batch-summary.json").read_text(encoding="utf-8"))
        if json.loads(result.stdout) != raw_summary:
            raise RuntimeError(f"CLI stdout differs from batch summary for {case_id}")
        selected = {key: raw_report[key] for key in REPORT_FIELDS}
        selected_summary = {key: raw_summary[key] for key in SUMMARY_FIELDS}
        selected_summary["results"] = [selected]
        public = work / "public" / "samples" / case_id
        public.mkdir(parents=True)
        (public / source.name).write_bytes(input_bytes)
        write_json(public / f"{case_id}.report.selected.json", selected)
        write_json(public / "batch-summary.selected.json", selected_summary)
        for suffix in (".md", ".dialogue.txt"):
            generated = output / f"{case_id}{suffix}"
            if generated.exists():
                (public / generated.name).write_bytes(generated.read_bytes())
        files = [{"path": file.relative_to(work / "public").as_posix(), "sha256": digest(file.read_bytes()), "bytes": file.stat().st_size}
                 for file in sorted(public.iterdir())]
        raw_files = [{"name": file.name, "sha256": digest(file.read_bytes()), "bytes": file.stat().st_size}
                     for file in sorted(output.iterdir())]
        evidence["cases"].append({
            "id": case_id, "command": "python " + " ".join(arguments), "exit_status": result.returncode,
            "batch_status": raw_summary["status"], "report_status": selected["status"],
            "error_codes": [entry["code"] for entry in selected["errors"]],
            "warning_codes": [entry["code"] for entry in selected["warnings"]],
            "raw_stdout_sha256": digest(result.stdout), "raw_stderr_sha256": digest(result.stderr),
            "raw_generated_files": raw_files, "published_files": files,
        })
    if args.verify_published:
        expected = json.loads((BASE / "evidence.json").read_text(encoding="utf-8"))
        stable = lambda case: {key: case[key] for key in ("id", "exit_status", "batch_status", "report_status", "error_codes", "warning_codes", "published_files")}
        if [stable(case) for case in evidence["cases"]] != [stable(case) for case in expected["cases"]]:
            raise RuntimeError("Reproduced selected artifacts differ from published evidence")
        evidence["verification"] = "Selected artifact hashes and recorded outcomes match published evidence; raw stdout byte hashes can vary with host newline conventions"
    write_json(work / "public" / "evidence.json", evidence)
    print(json.dumps({"cases": len(CASES), "python": platform.python_version(), "public_output": str(work / "public"), "verified_published": args.verify_published}))


if __name__ == "__main__":
    main()
