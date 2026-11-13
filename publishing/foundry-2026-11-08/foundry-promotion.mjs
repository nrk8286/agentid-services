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
  if (articles.some(({ slug }) => [recoverySlug, cueExampleSlug, recoveryExampleSlug].includes(slug))) throw new Error("Foundry article already published");
  return [cueExampleArticle, recoveryExampleArticle, recoveryArticle, ...articles.map((article) => article.slug === cueSlug ? cueArticle : article)];
}

// November 12 expansion: concrete output examples, preserving the earlier guides.
export const cueExampleSlug = "srt-to-markdown-before-and-after";
export const recoveryExampleSlug = "supabase-incident-packet-example";
const exampleDate = "2026-11-12";
const examplesBase = "https://github.com/nrk8286/agentid-services/blob/main/publishing/foundry-2026-11-12";
const examplesTree = "https://github.com/nrk8286/agentid-services/tree/main/publishing/foundry-2026-11-12";
const exampleDisclosure = '<p><strong>Ownership and preparation:</strong> We own and sell the tool described here. This article was prepared with AI assistance from a first-party automated run of the shipped fictional example on November 12, 2026. It is a commercial introduction, not an independent review or a customer result.</p>';
const exampleCode = (text) => `<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code></pre>`;
const examplePrice = (name, product, ref) => ({ name, url: `${origin}/${product}?ref=${ref}`, price: "$1.00 USD with PayPal; or 1.00 USDC on Base", note: "One-time toolkit purchase. Python 3.10+; no third-party Python packages. Checked November 12, 2026. Review current checkout terms." });

export const cueExampleArticle = {
  slug: cueExampleSlug,
  title: "What stays when you turn subtitles into Markdown? A two-cue example",
  description: "See the same fictional SRT excerpt as timestamped Markdown, dialogue-only text, and a quality report. Try a free 20-cue browser preview before buying CueKeeper.",
  category: "ai-business", kind: "guide", status: "published",
  publishedAt: exampleDate, updatedAt: exampleDate, readMinutes: 4,
  verdict: "Keep the timed copy for traceability and the dialogue-only copy for reading. This sample makes the output format inspectable; your source captions still need review.",
  pros: ["The timed export keeps both start and end times.", "A separate dialogue-only copy serves a different reading task.", "The report exposes cue counts, warnings, and errors."],
  cons: ["A clean conversion report does not establish caption accuracy.", "This two-cue example does not cover every subtitle format or edge case."],
  suitableFor: ["Creators and researchers who already have subtitle files and want to inspect the export format."],
  notFor: ["Anyone who needs speech-to-text, translation, or verified speaker identification."],
  prices: [examplePrice("CueKeeper", "cuekeeper", "gmp-cue-example-20261112")],
  about: { "@type": "SoftwareApplication", name: "CueKeeper", url: `${origin}/cuekeeper` },
  sources: [{ title: "Exact sample inputs, outputs, archive hashes, and run evidence", url: examplesTree }, { title: "CueKeeper product scope and purchase options", url: `${origin}/cuekeeper?ref=gmp-cue-example-20261112` }],
  screenshots: [], structuredData: [], relatedProducts: [],
  testing: {
    label: "First-party automated sample run", date: exampleDate,
    scope: "Ran the shipped CueKeeper 1.0.0 valid.srt example with Python 3.13.9. The command exited 0, emitted two cues, and wrote a timed transcript, dialogue copy, report, and batch summary. The examples below are taken from those files.",
    limits: "Synthetic subtitles only. This does not test media accuracy, time savings, customer use, payment settlement, or sales. The successful sample does not cover malformed or non-English input.",
    steps: ["Verified the shipped ZIP SHA-256.", "Ran the exact command shown below in an isolated directory.", "Compared the generated files with the published sample artifacts."]
  },
  bodyHtml: `${exampleDisclosure}
    <p>A reading copy and a source reference are different things. Here is what <a href="${origin}/cuekeeper?ref=gmp-cue-example-20261112">CueKeeper</a> produces from two fictional subtitle cues, so you can judge the format before spending $1.00 USD.</p>
    <h2>Start with these two cues</h2>
    ${exampleCode("1\n00:00:01,000 --> 00:00:03,250\nWelcome to CueKeeper.\nEvery timestamp stays attached.\n\n2\n00:00:04,500 --> 00:00:06,000\nReady for analysis.")}
    <p>The first cue has two lines. The example contains no audio, real speaker, or customer data. You can paste it into the <a href="${origin}/cuekeeper/try?ref=gmp-cue-example-20261112">free browser preview</a>, which accepts up to 20 cues and processes the excerpt locally in your browser.</p>
    <h2>The timed Markdown preserves the intervals</h2>
    ${exampleCode(String.raw`[00:00:01.000 --> 00:00:03.250] Welcome to CueKeeper\. Every timestamp stays attached\.

[00:00:04.500 --> 00:00:06.000] Ready for analysis\.`)}
    <p>This is the raw <code>valid.md</code> output. The backslashes escape punctuation for Markdown. The two dialogue lines in the first cue become one line, while both endpoint timestamps stay attached. Keep the original subtitle file alongside this reading copy.</p>
    <h2>The dialogue-only copy deliberately drops the times</h2>
    ${exampleCode("Welcome to CueKeeper. Every timestamp stays attached.\n\nReady for analysis.")}
    <p><code>valid.dialogue.txt</code> is convenient for reading or searching, but it cannot by itself tell you where a sentence occurred. Use the timed file when a reviewer needs to locate the passage in the original recording.</p>
    <h2>The report says what the conversion did</h2>
    ${exampleCode('{"status":"COMPLETE","detected_format":"srt","parsed_cue_count":2,"emitted_cue_count":2,"errors":[],"warnings":[]}')}
    <p>This is a selected-field excerpt from <a href="${examplesBase}/samples/cuekeeper/valid.report.json">the full generated JSON report</a>. Two parsed cues became two emitted cues without reported issues in this sample. That does not prove the supplied text matches a recording, identify speakers, or certify a transcript.</p>
    <h2>Run the same example locally</h2>
    <p>The paid toolkit requires Python 3.10+ and no third-party packages. After extracting it, run this from the directory containing <code>app.py</code>:</p>
    ${exampleCode("python3 app.py convert samples/valid.srt -o output --dialogue-only")}
    <p>Use your installed Python launcher after checking its version. Our run used Python 3.13.9. Browse <a href="${examplesTree}/samples/cuekeeper">all four generated files and the input</a>, or read the <a href="https://gptmarketplus.com/guides/turn-srt-webvtt-into-timestamped-transcript">first-run walkthrough</a>.</p>
    <h2>Try the format, then choose the toolkit</h2>
    <p><a href="${origin}/cuekeeper/try?ref=gmp-cue-example-20261112">Try the free excerpt preview</a>. For local file and batch conversion, <a href="${origin}/cuekeeper/paypal?ref=gmp-cue-example-20261112">buy CueKeeper for $1.00 USD with PayPal</a>; the product page also offers 1.00 USDC on Base. The ZIP is released after verified payment. CueKeeper converts existing subtitles; it does not transcribe audio or translate dialogue.</p>`
};

export const recoveryExampleArticle = {
  slug: recoveryExampleSlug,
  title: "A Supabase incident packet you can inspect before buying the tool",
  description: "Read a fictional incident timeline, unknown-time DNS observation, and escalation draft. See exactly what the local Recovery Evidence Agent outputs and what still needs review.",
  category: "hosting-security", kind: "tutorial", status: "published",
  publishedAt: exampleDate, updatedAt: exampleDate, readMinutes: 5,
  verdict: "Use the packet to organize and question supplied evidence. A generated finding or completed checklist label is not proof of a current service state, a performed action, or a root cause.",
  pros: ["Preserves source identifiers and original timestamps in JSON.", "Keeps unknown observation times explicit.", "Provides a readable draft and a structured report for review."],
  cons: ["Nearby state changes can be flagged as contradictions even when they describe a transition.", "Checklist completion labels reflect supplied evidence, not independent verification of operator work.", "The draft needs review and redaction before sharing."],
  suitableFor: ["Developers evaluating the packet format before using a local evidence-organizing workflow."],
  notFor: ["Anyone expecting automatic recovery, root-cause diagnosis, or an official Supabase support service."],
  prices: [examplePrice("Supabase Recovery Evidence Agent", "supabase-recovery", "gmp-recovery-example-20261112")],
  about: { "@type": "SoftwareApplication", name: "Supabase Recovery Evidence Agent", url: `${origin}/supabase-recovery` },
  sources: [{ title: "Fictional input and complete generated packet", url: `${examplesTree}/samples/recovery` }, { title: "Dated run evidence and archive hashes", url: `${examplesBase}/evidence.json` }, { title: "Recovery product scope and purchase options", url: `${origin}/supabase-recovery?ref=gmp-recovery-example-20261112` }],
  screenshots: [], structuredData: [], relatedProducts: [],
  testing: {
    label: "First-party automated sample run", date: exampleDate,
    scope: "Ran Recovery Evidence Agent 1.0.0 with its shipped fictional sample, Python 3.13.9, and a fixed example clock. Exit status was 0. The complete generated report.json and escalation.md are published with this article.",
    limits: "Synthetic example only. No Supabase account, real incident, customer data, infrastructure recovery, support response, paid receipt, or financial result was tested. Generated labels are not independent evidence.",
    steps: ["Verified the shipped ZIP SHA-256.", "Ran the included sample with the fixed-clock command below.", "Reviewed the timeline, unknown-time observation, contradiction, missing evidence, and draft status against the input."]
  },
  bodyHtml: `${exampleDisclosure}
    <p>Before buying an evidence tool, you should be able to read its output. This page shows the fictional packet produced by <a href="${origin}/supabase-recovery?ref=gmp-recovery-example-20261112">Supabase Recovery Evidence Agent</a>. The <a href="${examplesBase}/samples/recovery/report.json">full JSON report</a>, <a href="${examplesBase}/samples/recovery/escalation.md">Markdown escalation draft</a>, and <a href="${examplesBase}/samples/recovery/sample_incident.json">input fixture</a> are available to inspect without a purchase.</p>
    <p>This is an independent product, not affiliated with Supabase. It organizes already-redacted observations locally. It does not log into Supabase, repair infrastructure, determine a definitive root cause, or contact support.</p>
    <h2>Four timestamped observations, one unknown time</h2>
    ${exampleCode("2026-08-28T23:10:00Z  billing / invoice: PAID          source billing-1\n2026-08-28T23:15:00Z  control_plane: PAUSED          source control-1\n2026-08-28T23:18:00Z  control_plane: RUNNING         source control-2\n2026-08-28T23:20:00Z  service_health: UNHEALTHY      source health-1\nUnknown time          dns / api-host: RESOLVING      source dns-1")}
    <p>This compact display follows the generated timeline. The billing input used <code>2026-08-28T18:10:00-05:00</code>; the JSON retains that original value and the normalized UTC value. The DNS observation has no timestamp, so it stays explicitly unknown. A resolving hostname does not establish a healthy API, and an invoice marked paid does not establish a running project.</p>
    <h2>A contradiction flag is a question to investigate</h2>
    <p>The sample flags <code>PAUSED</code> and <code>RUNNING</code> for the same project within its configured 15-minute window, citing <code>control-1</code> and <code>control-2</code>. Those observations are three minutes apart. They may describe a state transition; the flag does not prove both states existed at once or diagnose a platform fault. Read the source times before treating a derived finding as a conclusion.</p>
    <h2>Missing evidence remains visible</h2>
    <p>The report explicitly lists a missing current project-state observation, impact end time, and support case identifier. None is filled with a guess. The draft keeps the attempted unpause action separate from its reported outcome and proposes questions an operator can edit before contacting support.</p>
    <h2>Review the generated labels too</h2>
    <p>The sample JSON says <code>review.status: pending</code>. The Markdown template begins with “Operator-reviewed draft,” but generating that text does not complete a human review. Likewise, a checklist item marked <code>completed</code> reflects the presence of supplied evidence; it does not prove that an operator checked the current state or that the service recovered. Review and correct the draft before relying on or sending it.</p>
    <h2>Reproduce the packet</h2>
    <p>The local toolkit requires Python 3.10+ and no third-party packages. After extracting the purchased ZIP, run:</p>
    ${exampleCode("python3 app.py examples/sample_incident.json --output-dir output --clock 2026-08-29T01:00:00Z")}
    <p>The fixed clock belongs to the fictional example. Our Python 3.13.9 run created <code>output/report.json</code> and <code>output/escalation.md</code>. For your own incident, follow the included schema, use actual observations and timestamps, and redact sensitive information before creating the input. Pattern checks are an aid, not an automatic redaction service.</p>
    <h2>Use the example or get the local generator</h2>
    <p>You can use the example to evaluate the format and the <a href="https://gptmarketplus.com/guides/supabase-incident-evidence-packet">incident-packet walkthrough</a> to understand the workflow. If you want the local generator, <a href="${origin}/supabase-recovery/paypal?ref=gmp-recovery-example-20261112">buy it for $1.00 USD with PayPal</a>, or use the product page's 1.00 USDC on Base option. The ZIP is delivered after verified payment; incident response and recovery services are not included.</p>`
};
