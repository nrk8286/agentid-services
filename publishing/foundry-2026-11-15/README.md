# SRT quality checklist — November 15, 2026

This content release adds one guide, `srt-subtitle-quality-checklist`, to the existing seven GPTMarketPlus guides. The guide gives readers a manual checklist without a purchase, then shows what the unchanged CueKeeper 1.0.0 CLI reports for seven fictional SRT fixtures. It discloses ownership, AI assistance, synthetic inputs, and the implementation limits. Existing article data remains unchanged.

The production content stays self-contained in `../foundry-2026-11-08/foundry-promotion.mjs`. No new production module or service is introduced. The free-preview, product, and PayPal links use `ref=gmp-cue-qc-20261115`. Publication and clicks are not paid sales or profit.

## Provenance and selection

The purchased archive SHA-256 is `b9d7fdb31bdbe69423b5031e1681a9868406b7fb093cef82b8db66396fcc6dcc`. [evidence.json](evidence.json) records the actual CPython 3.13.14 Windows runtime, case commands, exit statuses, raw-output hashes, and hashes of the published artifacts. The clean input is the same shipped fictional two-cue sample used in the November 12 article. Other inputs are deliberately constructed fictional defects or counterexamples.

Only the fixtures, generated reading copies, and **selected deterministic JSON fields** are public:

- Each `*.report.selected.json` contains `source_name`, `detected_format`, `status`, parsed/emitted cue counts, warnings, and errors. It omits the raw report's `artifact_paths` field.
- Each `batch-summary.selected.json` contains the batch status/file counts and the selected report fields under `results`.
- Selected JSON is pretty-printed with sorted keys and LF newlines. It is not a full unmodified report. Inputs and generated Markdown/dialogue copies are copied byte-for-byte. The local `.gitattributes` keeps published fixture/output line endings stable.
- Raw stdout/stderr, full raw reports, paid Python source, and the CLI-created `cuekeeper.db` remain only in the private working directory. Their raw output hashes are recorded without publishing local usernames, absolute runtime paths, database contents, or job identifiers. Raw stdout hashes can vary by host newline convention; published artifact hashes are the portable comparison.

The reproduction script extracts only `app.py` and `cuekeeper.py` from the hash-verified archive into its isolated work directory. It never downloads code or calls a service. The CLI calls `db_init()` even in conversion mode; that SQLite file is deliberately confined to the private work directory and excluded from publication.

## Reproduce offline

The manual checklist and all public artifacts can be inspected without buying anything. **Running the original CLI requires your own purchased CueKeeper 1.0.0 ZIP**; this public repository does not provide its full source or archive. Python 3.10+ is the declared requirement. These captured runs used Python 3.13.14, not every supported version.

From the repository root, use a new work directory outside the repository:

```text
python publishing/foundry-2026-11-15/reproduce.py /path/to/cuekeeper-1.0.0.zip --work-dir /tmp/cuekeeper-quality-reproduction --verify-published
```

On Windows, for example:

```text
python publishing/foundry-2026-11-15/reproduce.py C:\Downloads\cuekeeper-1.0.0.zip --work-dir C:\Temp\cuekeeper-quality-reproduction --verify-published
```

Use `python3` or `py -3` instead if that selects your intended installed interpreter. The work directory must not already exist. The script uses the same interpreter for each child command, isolates its current directory/environment/temp/home paths, and retains all runtime writes under that work directory. It produces `public/evidence.json` and selected artifacts under `public/samples/` for comparison. `--verify-published` checks selected artifact hashes and recorded outcomes against this release's evidence; it does not rewrite the repository.

These are the exact command arguments run from the isolated toolkit directory; `python` denotes the reproduction script's interpreter:

```text
python app.py convert fixtures/clean.srt -o output/clean --dialogue-only
python app.py convert fixtures/invalid-timestamp.srt -o output/invalid-timestamp --dialogue-only
python app.py convert fixtures/reversed-interval.srt -o output/reversed-interval --dialogue-only
python app.py convert fixtures/empty-dialogue.srt -o output/empty-dialogue --dialogue-only
python app.py convert fixtures/warnings.srt -o output/warnings --dialogue-only
python app.py convert fixtures/zero-length.srt -o output/zero-length --dialogue-only
python app.py convert fixtures/nonadjacent-overlap.srt -o output/nonadjacent-overlap --dialogue-only
```

The three invalid cases exit `2` with `INVALID_TIMESTAMP`, `INVALID_INTERVAL`, and `EMPTY_DIALOGUE`, respectively. The other four commands exit `0`. A successful command may still have warnings or miss an issue:

- `warnings`: three emitted cues; markup, overlap, and exact-duplicate warnings; the passages remain in the output.
- `zero-length`: one emitted cue with identical endpoints and no warning. The browser preview rejects this input; the shipped Python parser permits it.
- `nonadjacent-overlap`: three emitted cues, only one overlap warning for cues 1/2. Cue 3 also intersects cue 1, but the parser compares only adjacent cues.
- The Python toolkit removes markup and decodes entities. The separate browser preview keeps that text literally; its results are not an identical full Python quality report.

Preview comparisons come from review and local in-memory checks of the separate preview implementation, not from these CLI reports or a live browser session. The CLI evidence does not claim browser/UI coverage.

Relevant archive members: `cuekeeper-1.0.0/cuekeeper.py` (`parse_time`, `clean_dialogue`, `parse_subtitles`, `convert_file`), `README.md`, and `tests/test_cuekeeper.py`. No customer subtitles, media accuracy, exhaustive SRT/WebVTT conformance, usability, measured savings, payments, sales, or profit were evaluated. A `COMPLETE` report is not a caption-quality certificate.

## Content release boundary

Run `npm run test:publication` for artifact, article, and discovery checks. Preparation is local and does not deploy:

```text
node publishing/foundry-2026-11-15/prepare.mjs <captured-live-modules-directory> <new-output-directory>
```

The expected captured `foundry-promotion.mjs` baseline is `4883ee5042838a169238c426dc274fe42224fbec12b9dbedf0a9200f55fadc74`; the other four module hashes match the previous content release. Preparation verifies all five hashes, retains the four unaffected modules byte-for-byte, and replaces only `foundry-promotion.mjs`. It requires a new output directory and writes files with exclusive-create semantics. Captured modules, settings, credentials, and output release bundles belong outside this public repository. Publication is handled separately; this folder does not claim a live deployment.
