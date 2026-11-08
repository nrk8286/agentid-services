// Owned product introductions. Evidence covers synthetic local examples only.
export const checkedDate = "2026-11-08";
export const cueSlug = "turn-srt-webvtt-into-timestamped-transcript";
export const recoverySlug = "supabase-incident-evidence-packet";
const origin = "https://score.agentid.life";
const evidenceUrl = "https://github.com/nrk8286/agentid-services/blob/main/publishing/foundry-2026-11-08/evidence.json";
const cueUrl = `${origin}/cuekeeper?ref=gmp-cuekeeper-guide`;
const recoveryUrl = `${origin}/supabase-recovery?ref=gmp-recovery-guide`;
const disclosure = `<p><strong>Ownership and preparation:</strong> GPTMarketPlus and Agent Foundry share ownership with the products described here. This commercial introduction was prepared with AI assistance. An automated development agent ran the included fictional examples on November 8, 2026; the shared editorial byline does not imply independent testing or a named human review.</p>`;
const evidenceSource = { title: "Dated archive hashes, commands, observed files, and evaluation limits", url: evidenceUrl };
const price = (name, url) => ({ name, url, price: "$1.00 USD with PayPal; or 1.00 USDC on Base", note: "One-time purchase per toolkit. Python 3.10+ required; no third-party Python packages. Price checked November 8, 2026. Review the current checkout before paying." });

export const cueArticle = {
  slug: cueSlug,
  title: "Keep subtitle timestamps: a first run with the $1 CueKeeper toolkit",
  description: "Convert an existing SRT or WebVTT file locally, inspect a timestamped transcript and quality report, and try a free browser excerpt before buying.",
  category: "ai-business", kind: "guide", status: "published",
  publishedAt: "2026-09-25", updatedAt: checkedDate, readMinutes: 5,
  verdict: "CueKeeper fits a narrow job: making existing subtitle files easier to read and review while retaining cue timing. Try the free excerpt first, then choose the local toolkit if you need its batch conversion and reports.",
  pros: ["Preserves cue timing in the transcript.", "Includes a command-line converter, a local browser interface, source, sample input, and tests.", "Produces a separate quality report alongside the reading copy."],
  cons: ["Requires Python 3.10 or newer.", "Does not create captions from audio or video, translate dialogue, or verify speaker identities.", "A successful conversion does not establish that supplied captions match the recording."],
  suitableFor: ["Creators and researchers who already have SRT or WebVTT files.", "People preparing timestamped text for a local review or analysis workflow."],
  notFor: ["Anyone starting with media and needing speech-to-text.", "Anyone needing certified transcript accuracy or automatic translation."],
  prices: [price("CueKeeper", cueUrl)],
  about: { "@type": "SoftwareApplication", name: "CueKeeper", url: `${origin}/cuekeeper` },
  sources: [{ title: "CueKeeper: current price, requirements, archive hash, and scope", url: cueUrl }, { title: "Free CueKeeper excerpt preview", url: `${origin}/cuekeeper/try?ref=gmp-cuekeeper-guide` }, evidenceSource],
  screenshots: [], structuredData: [], relatedProducts: [],
  testing: {
    label: "First-party automated sample run", date: checkedDate,
    scope: "An automated development agent ran the shipped CueKeeper 1.0.0 SRT example with Python 3.13.9 in a temporary WSL directory. The command exited successfully and created four output files. The live product page was checked for price and requirements.",
    limits: "This run used the included synthetic SRT sample, not customer subtitles. It did not evaluate WebVTT edge cases, audio accuracy, usability, time savings, payment settlement, or customer results. Python 3.10+ is the declared requirement; this sample was run on 3.13.9.",
    steps: ["Matched the shipped ZIP to the archive SHA-256 recorded in the linked evidence file.", "Unpacked into a temporary directory and ran the exact command below.", "Checked exit status 0 and the four output filenames.", "Confirmed the product page lists $1.00 USD with PayPal and 1.00 USDC on Base."]
  },
  bodyHtml: `${disclosure}
    <p>You have an SRT or WebVTT file and want readable text that still points back to the original moments. <a href="${cueUrl}">CueKeeper</a> converts that existing subtitle file on your machine. The complete toolkit costs $1.00 USD through PayPal, with a separate 1.00 USDC option on Base.</p>
    <h2>Try a short excerpt first</h2>
    <p>Open the <a href="${origin}/cuekeeper/try?ref=gmp-cuekeeper-guide">free browser preview</a> and paste a short, non-sensitive subtitle excerpt of up to 20 cues. It converts in the browser without uploading the text. This lets you see the transcript format before deciding whether you need the downloadable toolkit.</p>
    <h2>Run the included example</h2>
    <p>Install Python 3.10 or newer if needed. After purchasing and downloading the ZIP, extract it and open a terminal in the directory containing <code>app.py</code>. No third-party Python packages are required. Run:</p>
    <pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>python3 app.py convert samples/valid.srt -o output --dialogue-only</code></pre>
    <p>If your Python installation uses <code>python</code> or <code>py -3</code>, use that launcher after checking its version. Our automated run used Python 3.13.9 and completed with exit status 0. It created:</p>
    <ul><li><code>output/valid.md</code>: the timestamped Markdown transcript.</li><li><code>output/valid.dialogue.txt</code>: a dialogue-only reading copy.</li><li><code>output/valid.report.json</code>: the conversion quality report.</li><li><code>output/batch-summary.json</code>: the batch summary.</li></ul>
    <h2>Keep the report beside the transcript</h2>
    <p>Read the timestamped output and the report together before using the result. The toolkit reports issues such as invalid intervals, overlaps, duplicate cues, empty dialogue, and encoding problems. A dialogue-only copy is convenient for reading, but keep the timed version and original subtitle file so you can trace an excerpt to its source.</p>
    <p>For the optional local interface, run <code>python3 app.py serve</code> and open <code>http://127.0.0.1:8080</code> on your machine. This interface is included in the archive; the automated sample check documented here exercised the command line.</p>
    <h2>Use it for the right job</h2>
    <p>CueKeeper processes subtitle text you already have. It does not listen to audio, transcribe video, translate dialogue, identify speakers, or prove that captions are accurate. Check important passages against your source recording. If you later paste an export into a separate online service, that service has its own data-handling terms.</p>
    <h2>Get the local toolkit</h2>
    <p>The purchase includes source, a sample, tests, the converter, and the local interface. <a href="${origin}/cuekeeper/paypal?ref=gmp-cuekeeper-guide">Pay $1.00 USD with PayPal</a>, or visit the <a href="${cueUrl}">product page for the USDC option and current requirements</a>. The ZIP becomes available after verified payment. For payment or download problems, use <a href="https://gptmarketplus.com/contact">purchase support</a> with your product name and order reference; keep private download links private.</p>`
};

export const recoveryArticle = {
  slug: recoverySlug,
  title: "Build a Supabase incident evidence packet with a $1 local toolkit",
  description: "Turn already-redacted incident observations into a timeline and escalation draft. Run the included sample locally and review what the Recovery Evidence Agent can and cannot establish.",
  category: "hosting-security", kind: "tutorial", status: "published",
  publishedAt: checkedDate, updatedAt: checkedDate, readMinutes: 5,
  verdict: "The Recovery Evidence Agent can help organize supplied observations into a reviewable support packet. Use it when you need a local evidence workflow and will review the draft yourself; it does not restore a project or determine a root cause.",
  pros: ["Runs locally without a Supabase login or network calls.", "Keeps source identifiers and separates supplied observations from derived findings.", "Includes source, a fictional example, tests, and JSON and Markdown output."],
  cons: ["Input must already be redacted and requires operator review.", "Missing or incorrect input limits the usefulness of the packet.", "Does not repair infrastructure, contact support, or establish a definitive root cause."],
  suitableFor: ["Developers collecting billing, pause, restore, health, or DNS observations for a Supabase incident.", "Operators who can redact evidence and review the packet before sharing it."],
  notFor: ["Anyone expecting automated recovery or a guaranteed support response.", "Anyone seeking an automatic redaction service or an official Supabase tool."],
  prices: [price("Supabase Recovery Evidence Agent", recoveryUrl)],
  about: { "@type": "SoftwareApplication", name: "Supabase Recovery Evidence Agent", url: `${origin}/supabase-recovery` },
  sources: [{ title: "Recovery Evidence Agent: current price, requirements, archive hash, and scope", url: recoveryUrl }, evidenceSource],
  screenshots: [], structuredData: [], relatedProducts: [],
  testing: {
    label: "First-party automated sample run", date: checkedDate,
    scope: "An automated development agent ran version 1.0.0 with the included fictional incident, a fixed example clock, and Python 3.13.9 in a temporary WSL directory. The command exited successfully and created report.json and escalation.md. The live product page was checked for price and requirements.",
    limits: "This was a local synthetic example, not a real Supabase incident. No account, production system, customer data, support submission, recovery outcome, payment settlement, or financial result was tested.",
    steps: ["Matched the shipped ZIP to the archive SHA-256 recorded in the linked evidence file.", "Ran the included sample with the exact fixed-clock command below.", "Checked exit status 0 and both generated output filenames.", "Confirmed the public product page describes evidence organization and disclaims infrastructure repair."]
  },
  bodyHtml: `${disclosure}
    <p>During an incident, billing notes, dashboard states, application errors, and support replies can leave you with a scattered record. The <a href="${recoveryUrl}">Supabase Recovery Evidence Agent</a> organizes already-redacted observations into a local incident packet. It costs $1.00 USD through PayPal, or 1.00 USDC on Base, as a one-time toolkit purchase.</p>
    <p>This is an independent product and is not affiliated with Supabase. Its role is evidence organization. It does not log into an account, restore a database, change DNS, or send anything to support.</p>
    <h2>Begin with the fictional incident</h2>
    <p>The ZIP includes Python source, a sample input file, and tests. It requires Python 3.10 or newer and no third-party Python packages. Extract the archive, open a terminal in the folder containing <code>app.py</code>, and run:</p>
    <pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>python3 app.py examples/sample_incident.json --output-dir output --clock 2026-08-29T01:00:00Z</code></pre>
    <p>Use your installed Python launcher if it is named <code>python</code> or <code>py -3</code>, after checking its version. The fixed clock belongs to this fictional example and makes it repeatable; it is not the current time or a suggested timestamp for your own incident.</p>
    <p>Our automated sample run used Python 3.13.9, exited with status 0, and created <code>output/report.json</code> and <code>output/escalation.md</code>. Open both files locally to understand the packet before adapting the sample input.</p>
    <h2>Prepare a record you can safely review</h2>
    <p>Follow the included input example and README. Keep observations tied to their source identifiers and original timestamps. Record what you actually observed, including uncertainty and missing details, instead of filling gaps with guesses. Billing state, control-plane state, service health, and DNS observations describe different parts of an incident.</p>
    <p>Remove passwords, API keys, access tokens, personal information, and other sensitive material before creating the input file. The toolkit's secret-pattern checks are an aid; they do not make arbitrary raw logs safe or replace redaction. Use only information you are authorized to process.</p>
    <h2>Review the packet before sharing it</h2>
    <p>The toolkit is designed to produce a timeline, documented contradiction findings, missing-evidence checks, and an escalation draft. Read each finding against its supplied source. A mismatch or missing item is a reason to investigate; it does not by itself establish what broke or who caused it.</p>
    <p>Check the impact statement, timestamps, attempted actions, and support questions in the Markdown draft. Remove anything that is wrong or unsuitable to share, then decide whether and where to send it yourself. The toolkit makes no network calls and does not submit a support ticket.</p>
    <h2>Get the toolkit</h2>
    <p><a href="${origin}/supabase-recovery/paypal?ref=gmp-recovery-guide">Pay $1.00 USD with PayPal</a>, or check the <a href="${recoveryUrl}">product page for the USDC option and current scope</a>. The ZIP becomes available after verified payment. For purchase or download help, use <a href="https://gptmarketplus.com/contact">purchase support</a>. This purchase provides local evidence tooling; it does not include incident response services or promise a recovery outcome.</p>`
};

export function applyFoundryPublication(articles) {
  if (!Array.isArray(articles) || articles.filter(({ slug }) => slug === cueSlug).length !== 1) throw new Error("Expected exactly one existing CueKeeper article");
  if (articles.some(({ slug }) => slug === recoverySlug)) throw new Error("Recovery article already published");
  return [recoveryArticle, ...articles.map((article) => article.slug === cueSlug ? cueArticle : article)];
}
