const SECURITY_HEADERS = {
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "content-security-policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.google.com https://*.googleapis.com https://*.gstatic.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://analytics.google.com https://*.google-analytics.com https://stats.g.doubleclick.net https://*.adtrafficquality.google https://*.cloudflareinsights.com https://*.paypal.com; frame-src https://challenges.cloudflare.com https://*.adtrafficquality.google https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.paypal.com; upgrade-insecure-requests",
  "cross-origin-opener-policy": "same-origin-allow-popups",
  "cross-origin-resource-policy": "same-site",
  "origin-agent-cluster": "?1",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "x-permitted-cross-domain-policies": "none",
};

const JSON_HEADERS = {
  ...SECURITY_HEADERS,
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const HTML_HEADERS = {
  ...SECURITY_HEADERS,
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=120",
  "x-robots-tag": "index,follow,max-image-preview:large",
};

const PRIVATE_HTML_HEADERS = {
  "cache-control": "private, no-store, max-age=0",
  pragma: "no-cache",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex,nofollow,noarchive",
};

const CSS_HEADERS = {
  ...SECURITY_HEADERS,
  "content-type": "text/css; charset=utf-8",
  "cache-control": "public, max-age=3600",
};

const TEXT_HEADERS = {
  ...SECURITY_HEADERS,
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=3600",
};

const XML_HEADERS = {
  ...SECURITY_HEADERS,
  "content-type": "application/xml; charset=utf-8",
  "cache-control": "public, max-age=3600",
};

const SVG_HEADERS = {
  ...SECURITY_HEADERS,
  "content-type": "image/svg+xml; charset=utf-8",
  "cache-control": "public, max-age=86400",
};

const FORM_RATE_LIMIT = {
  windowSeconds: 60,
  maxPerWindow: 5,
  maxPerDay: 20,
};

const EVENT_RATE_LIMIT = {
  windowSeconds: 60,
  maxPerWindow: 60,
  maxPerDay: 1000,
};

const MAX_JSON_BODY_BYTES = 128 * 1024;
const MAX_STRIPE_WEBHOOK_BODY_BYTES = 1024 * 1024;
const BODY_TOO_LARGE = Symbol("body-too-large");
const GOOGLE_SITE_VERIFICATION = "hxvcDl32V0BA5LSTQx-OfIUE6DAIR6TrRp2pUbE5XZo";
const GOOGLE_SITE_VERIFICATION_FILE = "google9b1a14a98542c3e1.html";
const GOOGLE_SITE_VERIFICATION_BODY = `google-site-verification: ${GOOGLE_SITE_VERIFICATION_FILE}`;

let googleAccessTokenCache = {
  token: "",
  expiresAt: 0,
};

const SITE_CONTENT_LAST_MODIFIED = "2026-07-30";

const BUILD_STAGES = [
  "purchase_received",
  "onboarding_needed",
  "blueprint_generated",
  "build_in_progress",
  "integration_setup",
  "testing",
  "client_review",
  "launch_ready",
  "live",
  "optimization",
];

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/ai-agents", label: "AI Agents" },
  { path: "/use-cases", label: "Use Cases" },
  { path: "/resources", label: "Resources" },
  { path: "/pricing", label: "Pricing" },
  { path: "/about", label: "About", optional: true },
  { path: "/faq", label: "FAQ", optional: true },
  { path: "/contact", label: "Contact" },
];

const SERVICE_CARDS = [
  {
    title: "Custom Website AI Agent",
    description:
      "An AI assistant installed on your website to answer questions, qualify leads, collect contact information, and push visitors toward booking or contacting you.",
  },
  {
    title: "Lead Capture and Follow-Up Agent",
    description:
      "Automatically collects leads, scores them, sends follow-up messages, and alerts your team.",
  },
  {
    title: "Customer Support Agent",
    description:
      "Answers common customer questions, explains services, routes issues, and reduces repetitive calls or messages.",
  },
  {
    title: "Business Operations Agent",
    description:
      "Helps manage tasks, work orders, schedules, reminders, inventory, documents, and internal processes.",
  },
  {
    title: "Sales Assistant Agent",
    description:
      "Helps turn visitors into prospects with guided questions, objection handling, service recommendations, and consultation booking.",
  },
  {
    title: "AI Automation Setup",
    description:
      "Connect forms, emails, calendars, sheets, CRMs, task boards, and business tools into one automated workflow.",
  },
  {
    title: "AI Website Buildout",
    description:
      "Builds or upgrades a business website with AI lead capture, SEO structure, analytics, and conversion-focused copy.",
  },
  {
    title: "Ongoing AI Agent Management",
    description:
      "Maintains, improves, monitors, and updates AI agents so they keep working as the business changes.",
  },
];

const AGENT_TYPES = [
  {
    slug: "website-sales-agent",
    title: "Website Sales Agent",
    whatItDoes:
      "Greets visitors, answers approved questions, recommends the right service, and moves serious buyers toward a call or quote.",
    whoItIsFor: "Businesses that want more conversions from their website traffic.",
    benefit: "Turns passive traffic into qualified opportunities.",
    workflow:
      "Visitor opens chat, gets greeted, answers qualifying questions, receives the best package recommendation, and is routed to booking or quote request.",
    request: "Request This Agent",
  },
  {
    slug: "receptionist-agent",
    title: "Receptionist Agent",
    whatItDoes:
      "Handles first-contact questions, routes requests, captures contact details, and keeps the front desk from getting overloaded.",
    whoItIsFor: "Businesses with steady phone, chat, or form inquiries.",
    benefit: "Reduces missed calls and slow responses.",
    workflow:
      "Visitor asks for help, the agent asks for the service need, collects contact info, and sends a summary to staff.",
    request: "Request This Agent",
  },
  {
    slug: "appointment-booking-agent",
    title: "Appointment Booking Agent",
    whatItDoes:
      "Checks availability, gathers the reason for the appointment, confirms contact details, and pushes the request into a calendar flow.",
    whoItIsFor: "Service businesses, clinics, and consultancies that rely on appointments.",
    benefit: "Improves booking rates and reduces back-and-forth.",
    workflow:
      "User asks to book, the agent qualifies the request, captures preferred time, and routes to booking confirmation or calendar integration.",
    request: "Request This Agent",
  },
  {
    slug: "follow-up-agent",
    title: "Follow-Up Agent",
    whatItDoes:
      "Keeps leads warm with timely follow-up and handoff notifications when the visitor leaves before booking.",
    whoItIsFor: "Teams that lose deals because follow-up happens too late.",
    benefit: "Prevents leads from going cold.",
    workflow:
      "Lead submits details, the system tags the lead, creates a summary, and queues a follow-up sequence with consent controls.",
    request: "Request This Agent",
  },
  {
    slug: "estimate-intake-agent",
    title: "Estimate Intake Agent",
    whatItDoes:
      "Collects job scope, location, urgency, photos, and contact details before the owner replies.",
    whoItIsFor: "Contractors and field service businesses.",
    benefit: "Captures better job information on the first try.",
    workflow:
      "Homeowner describes the job, the agent asks for scope, property details, photos, and timeline, then sends the intake summary.",
    request: "Request This Agent",
  },
  {
    slug: "faq-agent",
    title: "FAQ Agent",
    whatItDoes:
      "Answers common questions, explains services, and keeps repetitive inquiries from consuming the team.",
    whoItIsFor: "Businesses with recurring pre-sale or support questions.",
    benefit: "Saves time while keeping customers informed.",
    workflow:
      "Visitor asks a question, the agent responds from approved material, and offers the next best action if the question turns into a lead.",
    request: "Request This Agent",
  },
  {
    slug: "work-order-agent",
    title: "Work Order Agent",
    whatItDoes:
      "Turns requests into structured tasks, work orders, and internal updates.",
    whoItIsFor: "Facility management and operations teams.",
    benefit: "Keeps work from getting lost in messages.",
    workflow:
      "Employee submits a request, the agent captures the details, creates a summary, and routes it to the right team.",
    request: "Request This Agent",
  },
  {
    slug: "document-assistant",
    title: "Document Assistant",
    whatItDoes:
      "Summarizes documents, extracts key details, and helps teams find the next step faster.",
    whoItIsFor: "Teams that handle proposals, policies, SOPs, and client docs.",
    benefit: "Reduces time spent reading and reformatting information.",
    workflow:
      "User uploads or links a document, the assistant summarizes it, and returns action items and suggested replies.",
    request: "Request This Agent",
  },
  {
    slug: "employee-training-agent",
    title: "Employee Training Agent",
    whatItDoes:
      "Guides staff through approved procedures and answers internal process questions.",
    whoItIsFor: "Teams that need consistent process training.",
    benefit: "Makes onboarding and SOP lookup faster.",
    workflow:
      "Employee asks how to do something, the agent returns approved instructions and links the right SOP or checklist.",
    request: "Request This Agent",
  },
  {
    slug: "customer-service-agent",
    title: "Customer Service Agent",
    whatItDoes:
      "Answers customer questions, explains policies, and routes unresolved issues to a human.",
    whoItIsFor: "Businesses with recurring support demand.",
    benefit: "Improves response time without sacrificing handoff quality.",
    workflow:
      "Customer asks for help, the agent searches approved information, responds, and escalates if the issue is sensitive or unclear.",
    request: "Request This Agent",
  },
  {
    slug: "crm-update-agent",
    title: "CRM Update Agent",
    whatItDoes:
      "Turns captured lead data into structured CRM updates and task records.",
    whoItIsFor: "Businesses that rely on clean CRM data.",
    benefit: "Cuts down on duplicate data entry.",
    workflow:
      "Lead submits a form or chat, the agent normalizes the details, and pushes them into the CRM workflow.",
    request: "Request This Agent",
  },
  {
    slug: "review-request-agent",
    title: "Review Request Agent",
    whatItDoes:
      "Asks satisfied customers for reviews after work is completed.",
    whoItIsFor: "Businesses that depend on local reputation and referrals.",
    benefit: "Creates a repeatable review generation system.",
    workflow:
      "A job is marked complete, the agent checks consent rules, and sends the right review request at the right time.",
    request: "Request This Agent",
  },
  {
    slug: "local-business-growth-agent",
    title: "Local Business Growth Agent",
    whatItDoes:
      "Combines lead capture, booking, follow-up, and review requests into one growth system.",
    whoItIsFor: "Local companies that want a single business-focused automation layer.",
    benefit: "Connects the full customer journey.",
    workflow:
      "Visitor arrives, the agent qualifies the need, routes the request, follows up, and asks for a review after the job closes.",
    request: "Request This Agent",
  },
];

const BUSINESS_RECOMMENDATIONS = [
  {
    match: "contractor",
    agentType: "Job Intake and Estimate Agent",
    package: "Growth Agent System",
  },
  {
    match: "real estate",
    agentType: "Buyer/Seller Lead Agent",
    package: "Growth Agent System",
  },
  {
    match: "medical",
    agentType: "Non-Medical Office Support Agent",
    package: "Growth Agent System",
  },
  {
    match: "senior-care",
    agentType: "Non-Medical Office Support Agent",
    package: "Growth Agent System",
  },
  {
    match: "law",
    agentType: "Legal Intake Routing Agent",
    package: "Growth Agent System",
  },
  {
    match: "ecommerce",
    agentType: "Product Recommendation and Support Agent",
    package: "Growth Agent System",
  },
  {
    match: "local service",
    agentType: "Lead Capture and Booking Agent",
    package: "Growth Agent System",
  },
  {
    match: "agency",
    agentType: "Client Intake and Qualification Agent",
    package: "Growth Agent System",
  },
  {
    match: "operations",
    agentType: "Operations Assistant Agent",
    package: "Business Automation Suite",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is an AI agent?",
    answer:
      "An AI agent is a trained workflow assistant that can answer approved questions, collect information, follow rules, and move a task or lead to the next step.",
  },
  {
    question: "Is this just a chatbot?",
    answer:
      "No. A chatbot usually answers questions. An AI agent can follow a workflow, collect information, qualify leads, create summaries, trigger automations, and help move a customer or task to the next step.",
  },
  {
    question: "Can it connect to my website?",
    answer:
      "Yes. We can install the agent on your website and connect it to forms, booking flows, and lead capture paths.",
  },
  {
    question: "Can it connect to my CRM?",
    answer:
      "Yes. We can design the workflow so the agent sends structured lead data into your CRM or into a CRM-ready webhook.",
  },
  {
    question: "Can it answer customer questions?",
    answer:
      "Yes, as long as the answers come from approved business information, FAQs, scripts, or documents you provide.",
  },
  {
    question: "Can it book appointments?",
    answer:
      "Yes. We can connect the agent to your booking flow or build a booking-intake workflow that captures the right details first.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Starter Agent setups start at $497, Growth Agent Systems start at $1,497, and Business Automation Suites start at $3,500. Final pricing depends on complexity, integrations, data sources, and compliance requirements.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Simple setups can move quickly. More advanced workflows take longer because we map the process, configure integrations, and test the handoff.",
  },
  {
    question: "Do I need technical knowledge?",
    answer:
      "No. We design the workflow around your business and guide you through onboarding.",
  },
  {
    question: "Can you maintain it for me?",
    answer:
      "Yes. Ongoing support plans are available if you want us to monitor, improve, and update the system after launch.",
  },
  {
    question: "Is customer data secure?",
    answer:
      "We use secure environment variables, server-side validation, and clear consent language. We do not promise compliance that has not been implemented.",
  },
  {
    question: "Can this replace employees?",
    answer:
      "It is better to think of it as support, not replacement. The agent handles repetitive intake, questions, routing, and follow-up so people can focus on higher-value work.",
  },
  {
    question: "What businesses is this best for?",
    answer:
      "It is best for businesses with recurring questions, lead capture needs, booking flows, admin work, or internal process bottlenecks.",
  },
];

const PRICING_TIERS = [
  {
    id: "starter_agent",
    name: "Starter Agent",
    startingAt: 49700,
    summary:
      "For small businesses that need a basic website chatbot or lead capture assistant.",
    includes: [
      "Basic AI website agent",
      "Lead capture form",
      "FAQ training",
      "Contact routing",
      "Basic analytics",
      "1 revision round",
    ],
    cta: "Start Starter Agent",
  },
  {
    id: "growth_agent_system",
    name: "Growth Agent System",
    startingAt: 149700,
    summary:
      "For businesses that want lead capture, follow-up, and workflow automation.",
    includes: [
      "Custom AI agent",
      "Website integration",
      "Lead qualification flow",
      "Email or CRM handoff",
      "Follow-up automation",
      "Analytics events",
      "2 revision rounds",
      "Basic training documentation",
    ],
    cta: "Start Growth Agent System",
  },
  {
    id: "business_automation_suite",
    name: "Business Automation Suite",
    startingAt: 350000,
    summary:
      "For companies that want multiple agents and internal automations.",
    includes: [
      "Multiple AI agents",
      "Website and workflow integration",
      "CRM/calendar/email/task automation",
      "Admin dashboard or reporting",
      "Staff workflow design",
      "Ongoing optimization plan",
      "Priority support",
    ],
    cta: "Start Business Automation Suite",
  },
];

const MONTHLY_SUPPORT = [
  {
    id: "basic_monitoring",
    name: "Basic Monitoring",
    price: 9900,
    summary: "Light monitoring and issue review for a single agent.",
  },
  {
    id: "growth_support",
    name: "Growth Support",
    price: 29900,
    summary: "Monitoring, minor improvements, and monthly workflow review.",
  },
  {
    id: "managed_ai_operations",
    name: "Managed AI Operations",
    price: 75000,
    summary: "Hands-on support for teams that want the system managed for them.",
  },
];

const SPONSOR_SUBSCRIPTIONS = [
  {
    id: "sponsor_starter_monthly",
    name: "Sponsor Starter",
    price: 4900,
    summary: "A reviewed 30-day sponsor placement across the GPTMarketPlus dashboard and sponsor directory.",
    placement: "Dashboard sponsor slot",
  },
  {
    id: "featured_tool_monthly",
    name: "Featured AI Tool",
    price: 9900,
    summary: "A reviewed 30-day featured placement for an AI, automation, or small-business product across buyer-intent pages.",
    placement: "Featured tool placement",
  },
  {
    id: "growth_partner_monthly",
    name: "Growth Partner",
    price: 14900,
    summary: "A reviewed 30-day priority placement with dashboard visibility, partner mentions, and lead-follow-up content.",
    placement: "Priority partner placement",
  },
];

const DIGITAL_PRODUCTS = [
  {
    id: "ai_agent_launch_kit",
    name: "AI Agent Launch Kit",
    price: 2900,
    packageTier: "digital_product",
    checkoutType: "digital_product",
    delivery: "secure_download",
    summary: "A practical workbook, prompt pack, intake template, launch checklist, and 30-day scorecard for planning your first business AI agent.",
    includes: [
      "AI workflow opportunity scorecard",
      "Customer-question and knowledge intake template",
      "Agent guardrail and escalation worksheet",
      "Lead follow-up message templates",
      "Launch QA checklist",
      "30-day performance scorecard",
    ],
  },
];

const DEPOSITS = [
  {
    id: "starter_agent_setup_deposit",
    name: "Starter Agent Setup Deposit",
    price: 19700,
    packageId: "starter_agent",
  },
  {
    id: "growth_agent_strategy_deposit",
    name: "Growth Agent Strategy Deposit",
    price: 49700,
    packageId: "growth_agent_system",
  },
  {
    id: "business_automation_consultation_deposit",
    name: "Business Automation Consultation Deposit",
    price: 75000,
    packageId: "business_automation_suite",
  },
];

const CHECKOUT_PRODUCTS = [
  ...PRICING_TIERS.map((tier) => ({
    id: tier.id,
    name: tier.name,
    price: tier.startingAt,
    mode: "payment",
    packageTier: tier.id,
    checkoutType: "setup",
    description: tier.summary,
  })),
  ...DEPOSITS.map((deposit) => ({
    id: deposit.id,
    name: deposit.name,
    price: deposit.price,
    mode: "payment",
    packageTier: deposit.packageId,
    checkoutType: "deposit",
    description: "Secure your build slot with a deposit. Final scope and pricing will be confirmed after your strategy call.",
  })),
  ...MONTHLY_SUPPORT.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    mode: "subscription",
    interval: "month",
    packageTier: plan.id,
    checkoutType: "support",
    description: plan.summary,
  })),
  ...SPONSOR_SUBSCRIPTIONS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    mode: "subscription",
    interval: "month",
    packageTier: plan.id,
    checkoutType: "sponsor",
    description: plan.summary,
  })),
  ...DIGITAL_PRODUCTS.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    mode: "payment",
    packageTier: product.packageTier,
    checkoutType: product.checkoutType,
    delivery: product.delivery,
    description: product.summary,
  })),
];

export function agentIdOneTimeProducts() {
  return CHECKOUT_PRODUCTS
    .filter((product) => product.mode === "payment")
    .map((product) => ({ ...product }));
}

const LEAD_MAGNET_CHECKLIST = [
  "Answer customer questions faster with a trained website agent.",
  "Capture contact details before leads leave the page.",
  "Route urgent requests to the right person automatically.",
  "Follow up with new leads before they go cold.",
  "Reduce repetitive admin work across forms and inboxes.",
  "Connect the website to CRM, email, calendar, and task tools.",
  "Improve booking rates without adding more manual work.",
  "Create a clean handoff summary for the owner or team.",
  "Add ethical upsell paths only when the business truly needs them.",
  "Launch an AI workflow that actually supports revenue and operations.",
];

const BOOKING_COVERS = [
  "Website lead capture",
  "Repetitive admin tasks",
  "Customer questions",
  "Sales follow-up",
  "CRM or email automation",
  "Best AI agent for the business",
];

const USE_CASES = [
  {
    title: "Contractor Lead Agent",
    description:
      "A visitor asks about a repair. The agent collects job type, location, urgency, photos if available, and contact details. Then it sends the lead to the owner and triggers follow-up.",
  },
  {
    title: "Real Estate Agent Assistant",
    description:
      "The agent answers buyer and seller questions, qualifies leads, collects property details, and books consultations.",
  },
  {
    title: "Facility Operations Agent",
    description:
      "The agent helps staff submit work orders, track tasks, organize maintenance requests, and summarize issues.",
  },
  {
    title: "Medical Office Admin Assistant",
    description:
      "The agent answers non-medical office questions, routes appointment requests, provides office information, and avoids protected health information unless the system is properly compliant.",
  },
  {
    title: "Agency Client Intake Agent",
    description:
      "The agent qualifies new clients, asks budget and service questions, and sends structured summaries to the sales team.",
  },
];

const RESOURCE_PAGES = [
  {
    path: "/guides/ai-agent-for-small-business",
    category: "Guide",
    title: "AI Agent for Small Business: Costs, Use Cases, and 30-Day Plan",
    description: "Choose a practical AI agent for a small business, compare first-workflow use cases and cost drivers, estimate payback, and follow a measurable 30-day rollout plan.",
    summary: "Start with one measurable bottleneck, connect it to a real handoff, and expand only after the first workflow is reliable.",
    publishedAt: "2026-07-30",
    updatedAt: "2026-08-07",
    updatedLabel: "August 7, 2026",
    faqKicker: "Buyer questions",
    faqTitle: "Small-business AI agent FAQ",
    faqDescription: "Use these answers to choose a first workflow, budget conservatively, and keep a person accountable for the result.",
    faqs: [
      {
        question: "What is the best first AI agent for a small business?",
        answer: "Start with a frequent, rules-based workflow that has a clear owner and measurable outcome. Missed-lead response, appointment intake, common pre-sale questions, and CRM handoff are usually easier to test than a broad all-purpose assistant.",
      },
      {
        question: "How should a small business budget for an AI agent?",
        answer: "Separate one-time workflow design, integration, testing, and launch from monthly software, usage, monitoring, and support. Compare the full cost with measured time value and contribution from recovered opportunities, not with gross revenue alone.",
      },
      {
        question: "How long should an AI-agent pilot run?",
        answer: "A 30-day controlled pilot is long enough to capture representative requests for many small-business workflows. Record a baseline first, review failures weekly, and expand only after the agent meets the agreed accuracy, handoff, and outcome targets.",
      },
    ],
    sections: [
      {
        title: "What a business AI agent should actually do",
        body: "A useful agent does more than answer a prompt. It receives a request, follows approved rules, collects structured information, completes a narrow task, and hands the work to a person or system when it reaches a boundary.",
        points: [
          "Answer from approved business information",
          "Capture the details staff need to act",
          "Create a booking, task, CRM record, or summary",
          "Escalate sensitive, unclear, or high-value situations",
        ],
      },
      {
        title: "Choose the first workflow by business impact",
        body: "List the work that repeats every week, then rank each item by frequency, time consumed, revenue impact, and risk. A high-frequency, rules-based task with a clear owner is usually a better first project than a broad all-purpose assistant.",
        points: [
          "Missed-lead response and qualification",
          "Estimate or appointment intake",
          "Common pre-sale questions",
          "Follow-up reminders and internal handoff",
        ],
      },
      {
        title: "What to require before you buy",
        body: "Ask for a written workflow, approved data sources, escalation rules, success metrics, ownership of accounts and data, a test plan, and a clear maintenance scope. Those items matter more than the model name used in a demo.",
        points: [
          "One accountable workflow owner",
          "A measurable baseline and target",
          "A human fallback path",
          "A plan for updating business information",
        ],
      },
      {
        title: "A sensible 30-day rollout",
        body: "Use the first week to map and collect source material, the second to build and connect the workflow, the third to test realistic edge cases, and the fourth to launch with monitoring. Review real conversations before expanding scope.",
        points: [
          "Week 1: workflow map and content intake",
          "Week 2: build and integration",
          "Week 3: testing and staff review",
          "Week 4: controlled launch and measurement",
        ],
      },
      {
        title: "Estimate cost and payback before signing",
        body: "Model one-time setup, monthly software and support, expected usage, staff time saved, and the contribution margin from opportunities the workflow may recover. Use conservative assumptions, then replace estimates with real operating data after the first 30 days.",
        points: [
          "Separate setup cost from recurring cost",
          "Apply gross margin before counting recovered revenue as value",
          "Include monitoring, corrections, and human review",
          "Set a maximum acceptable payback period before launch",
        ],
      },
    ],
    related: ["/tools/ai-automation-roi-calculator", "/guides/ai-lead-follow-up", "/ai-marketing-automation", "/compare/ai-agent-vs-chatbot"],
  },
  {
    path: "/guides/ai-receptionist-cost",
    category: "Cost guide",
    title: "AI Receptionist Pricing (2026): Costs, Plans, and Fees",
    description: "Compare published AI receptionist prices from $20 to $500 per month, included usage, overage fees, setup costs, integrations, and support.",
    summary: "Published self-service plans in this August 2026 snapshot range from $20 to $500 per month, but included usage, overages, integrations, setup, and support determine the real cost.",
    publishedAt: "2026-07-30",
    updatedAt: "2026-08-07",
    updatedLabel: "August 7, 2026",
    pricingSnapshot: [
      {
        provider: "Frontdesk",
        url: "https://www.myaifrontdesk.com/pricing",
        publishedPrice: "$20 or $99/month; enterprise custom",
        usageModel: "The $99 plan lists 200 voice minutes plus chat, SMS, CRM, and automations.",
      },
      {
        provider: "Dialzara",
        url: "https://dialzara.com/pricing",
        publishedPrice: "From $29/month",
        usageModel: "The entry voice plan lists 60 minutes and $0.48 per overage minute; the vendor says no setup fee.",
      },
      {
        provider: "Goodcall",
        url: "https://www.goodcall.com/pricing",
        publishedPrice: "$79, $129, or $249/month per agent",
        usageModel: "Plans are based on unique customers, with published overage pricing of $0.50 per customer.",
      },
      {
        provider: "Smith.ai",
        url: "https://smith.ai/pricing/ai-receptionist",
        publishedPrice: "$0 base pay-as-you-go; $150, $270, or $500/month plans",
        usageModel: "Published tiers use included calls and per-call overages; custom pricing applies above the listed volumes.",
      },
    ],
    sources: [
      { name: "Frontdesk pricing", url: "https://www.myaifrontdesk.com/pricing" },
      { name: "Dialzara pricing", url: "https://dialzara.com/pricing" },
      { name: "Goodcall pricing", url: "https://www.goodcall.com/pricing" },
      { name: "Smith.ai AI receptionist pricing", url: "https://smith.ai/pricing/ai-receptionist" },
    ],
    faqs: [
      {
        question: "How much does an AI receptionist cost per month?",
        answer: "The published self-service plans checked for this guide range from $20 to $500 per month, plus possible usage overages. Enterprise, multi-location, white-label, and custom-integration work is commonly quote-based.",
      },
      {
        question: "Which fees can make the monthly price misleading?",
        answer: "Check included calls or minutes, per-call or per-minute overages, unique-customer limits, phone numbers, SMS, integrations, setup, monitoring, support, and data-retention charges.",
      },
      {
        question: "Should a business choose the cheapest AI receptionist plan?",
        answer: "Choose the least expensive plan that can complete the required workflow reliably. Booking, CRM updates, human transfer, consent, monitoring, and support can matter more than the advertised base price.",
      },
    ],
    sections: [
      {
        title: "The five cost drivers",
        body: "A website-only intake agent is simpler than a voice receptionist connected to scheduling, payments, and a CRM. Price should reflect the number of channels, the depth of the workflow, integration work, usage volume, and the operational risk of a mistake.",
        points: [
          "Website chat, SMS, email, or voice channels",
          "FAQ-only versus qualification and booking",
          "Calendar, CRM, phone, and payment integrations",
          "Usage volume, monitoring, and regulated-data requirements",
        ],
      },
      {
        title: "One-time setup versus monthly operating cost",
        body: "Setup typically covers discovery, content preparation, workflow design, integration, testing, and launch. Ongoing cost can include model or voice usage, phone numbers, automation tools, monitoring, content updates, and support.",
        points: [
          "Confirm which third-party fees are included",
          "Ask what happens when usage grows",
          "Define how many updates and integrations are covered",
          "Avoid unlimited claims without a written fair-use policy",
        ],
      },
      {
        title: "Compare cost with the current process",
        body: "Do not compare the system only with an employee salary. Compare it with missed opportunities, after-hours gaps, time spent on repeat questions, poor intake quality, and delayed follow-up. Keep human judgment for situations where empathy, negotiation, or risk is high.",
        points: [
          "Measure inquiries and response time before launch",
          "Estimate minutes saved per completed intake",
          "Track qualified leads, bookings, and escalations",
          "Review false answers and abandoned conversations",
        ],
      },
      {
        title: "Questions that protect your budget",
        body: "Request a fixed first-workflow scope and a clear change process. Confirm who owns the phone number, accounts, transcripts, prompts, and integrations. Ask how failures are monitored and how quickly a human can take over.",
        points: [
          "What is included in setup?",
          "Which fees vary with usage?",
          "How is the agent tested?",
          "Can I export my data and move providers?",
        ],
      },
    ],
    related: ["/ai-receptionist-software", "/tools/ai-automation-roi-calculator", "/pricing"],
  },
  {
    path: "/guides/ai-lead-follow-up",
    category: "Playbook",
    title: "AI Lead Follow-Up: 4-Stage Workflow and Scripts",
    description: "Use a practical AI lead follow-up workflow for fast acknowledgment, qualification, reminders, human handoff, consent, scripts, and measurement.",
    summary: "Automation should shorten the wait, preserve context, and tell the team what to do next—not send endless generic messages.",
    publishedAt: "2026-07-30",
    updatedAt: "2026-08-07",
    updatedLabel: "August 7, 2026",
    sections: [
      {
        title: "Stage 1: acknowledge and set expectations",
        body: "Send an immediate confirmation that names the request, explains what happens next, and gives a human contact path. Do not pretend the automated response is a person.",
        points: [
          "Confirm the request was received",
          "State the normal response window",
          "Repeat the most important submitted detail",
          "Offer an urgent or human escalation path",
        ],
      },
      {
        title: "Stage 2: qualify without interrogating",
        body: "Ask only for information that changes the next step. For a service inquiry, that may be location, scope, timing, and preferred contact method. Save answers once so the prospect does not repeat them.",
        points: [
          "Keep the first round short",
          "Explain why a sensitive detail is needed",
          "Do not collect regulated data without the right controls",
          "Stop when the lead asks not to be contacted",
        ],
      },
      {
        title: "Stage 3: route and remind",
        body: "Score urgency and fit using visible rules, assign an owner, and create a reminder. High-intent requests should reach a person quickly. Lower-intent leads can receive a useful resource and a limited follow-up sequence.",
        points: [
          "Define hot, warm, and research-stage signals",
          "Record the owner and next action",
          "Limit frequency and respect consent",
          "End the sequence when the person replies",
        ],
      },
      {
        title: "Measure the whole workflow",
        body: "Track response time, contact rate, qualified-lead rate, booking rate, opt-outs, and staff follow-through. A higher message count is not a success metric. The goal is a faster, clearer path to a useful human conversation.",
        points: [
          "Median time to first useful response",
          "Qualified leads that reach an owner",
          "Bookings or quotes created",
          "Opt-outs, complaints, and wrong-route rate",
        ],
      },
    ],
    related: ["/templates/lead-follow-up-scripts", "/small-business-crm-automation", "/contact"],
  },
  {
    path: "/compare/ai-agent-vs-chatbot",
    category: "Comparison",
    title: "AI Agent vs. Chatbot: Which Does Your Business Need?",
    description: "Compare rules-based chatbots, generative assistants, and workflow agents by capability, risk, integration depth, maintenance, and best use case.",
    summary: "Use the simplest system that can complete the workflow safely. A chatbot may be enough; an agent earns its complexity only when it moves work forward.",
    sections: [
      {
        title: "A chatbot handles conversation",
        body: "A traditional chatbot follows defined branches or retrieves approved answers. It is useful for predictable FAQs, routing, and simple data collection where the path changes very little.",
        points: [
          "Best for stable questions and simple menus",
          "Easy to test when responses are tightly defined",
          "Limited when the request requires multiple systems",
          "Usually lower cost and lower operational risk",
        ],
      },
      {
        title: "An assistant generates flexible responses",
        body: "A generative assistant can interpret varied language and produce more natural explanations. It still needs approved sources, boundaries, and a fallback when it is uncertain.",
        points: [
          "Best for broader language and content retrieval",
          "Needs source control and answer evaluation",
          "Should clearly identify automated responses",
          "Does not automatically become a workflow agent",
        ],
      },
      {
        title: "An agent takes bounded action",
        body: "A workflow agent can call tools, update records, create tasks, schedule events, or trigger a follow-up. Each action adds value and risk, so permissions, validation, logs, and human approval should match the consequence.",
        points: [
          "Best for multi-step work with a clear outcome",
          "Requires integration and error-handling design",
          "Needs logs, permission boundaries, and monitoring",
          "High-impact actions may require human approval",
        ],
      },
      {
        title: "A simple decision rule",
        body: "Choose a chatbot when the goal is to answer or route. Choose an assistant when users need flexible explanations from approved content. Choose an agent when the business needs a bounded action completed and can define what success, failure, and escalation mean.",
        points: [
          "Answer: chatbot",
          "Explain: assistant",
          "Complete a workflow: agent",
          "Combine them only when the business case is clear",
        ],
      },
    ],
    related: ["/guides/ai-agent-for-small-business", "/ai-agents", "/tools/ai-automation-roi-calculator"],
  },
  {
    path: "/industries/contractors-ai-automation",
    category: "Industry guide",
    title: "AI Automation for Contractors: From Missed Call to Estimate",
    description: "A practical automation blueprint for contractors covering after-hours lead capture, job intake, estimate preparation, scheduling, follow-up, and review requests.",
    summary: "The strongest contractor workflow captures complete job details quickly and gets them to the right person without promising a price or schedule the system cannot confirm.",
    sections: [
      {
        title: "Capture the job correctly the first time",
        body: "Collect service type, property location, urgency, a plain-language description, contact preference, and photos when appropriate. Avoid asking homeowners to diagnose the technical problem.",
        points: [
          "Service category and property location",
          "Urgency and safety indicators",
          "Photos or documents when useful",
          "Clear consent for follow-up",
        ],
      },
      {
        title: "Route emergencies and high-value work",
        body: "Use explicit rules for gas smells, active flooding, electrical danger, or other urgent conditions. The agent should provide the approved safety message and escalate rather than improvising technical advice.",
        points: [
          "Approved emergency language",
          "On-call owner or dispatcher notification",
          "Service-area and job-fit check",
          "Complete intake summary in one place",
        ],
      },
      {
        title: "Prepare the estimate handoff",
        body: "Automation can organize measurements, photos, requested work, property details, and schedule preferences. A qualified person should confirm scope, price, availability, and any site-specific risks.",
        points: [
          "Structured estimate request",
          "Missing-information checklist",
          "CRM or job-management record",
          "Human confirmation before commitment",
        ],
      },
      {
        title: "Close the loop after the job",
        body: "Use job status to trigger appointment reminders, arrival updates, invoice follow-up, maintenance reminders, and review requests. Stop or adjust the sequence when there is an unresolved complaint.",
        points: [
          "Appointment and arrival communication",
          "Invoice and quote reminders",
          "Review request after confirmed satisfaction",
          "Reactivation for seasonal services",
        ],
      },
    ],
    related: ["/guides/ai-lead-follow-up", "/use-cases", "/book-a-consultation"],
  },
  {
    path: "/templates/lead-follow-up-scripts",
    category: "Templates",
    title: "Customer Service and Lead Follow-Up Scripts",
    description: "Copy and customize consent-aware customer service and lead follow-up scripts for acknowledgment, qualification, quotes, missed calls, appointments, issues, and reactivation.",
    summary: "Good follow-up is specific, useful, easy to answer, and easy to stop. Replace every bracketed field and send only where you have a lawful, consent-aligned reason.",
    sections: [
      {
        title: "New inquiry acknowledgment",
        body: "Hi [first name]—thanks for contacting [business] about [service]. We received your request for [short request summary]. [owner or team] normally replies within [response window]. Is [phone/email/text] the best way to reach you?",
        points: [
          "Name the service and request",
          "Give a realistic response window",
          "Ask one easy next question",
          "Do not claim a person has reviewed it when they have not",
        ],
      },
      {
        title: "Missed-call follow-up",
        body: "Hi [first name], this is the automated assistant for [business]. We missed your call. What can we help with, and is this urgent? Reply STOP if you do not want messages from us.",
        points: [
          "Identify the business and automation",
          "Ask for the need and urgency",
          "Provide the approved opt-out language",
          "Escalate emergency language immediately",
        ],
      },
      {
        title: "Quote reminder",
        body: "Hi [first name]—checking whether you had questions about the [service] quote sent on [date]. The next step is [specific action]. Would [option A] or [option B] be more useful?",
        points: [
          "Reference the actual quote and date",
          "Give a specific next step",
          "Offer two relevant choices",
          "Stop the sequence when the lead responds",
        ],
      },
      {
        title: "Past-customer reactivation",
        body: "Hi [first name], [business] helped with [prior service] in [month/year]. We are scheduling [relevant seasonal or maintenance service]. Would you like details, or should we close the loop for now?",
        points: [
          "Use an accurate service history",
          "Make the timing relevant",
          "Avoid manufactured urgency",
          "Make declining easy",
        ],
      },
      {
        title: "Customer service issue follow-up",
        body: "Hi [first name]—following up on your [issue or request] from [date]. We have [confirmed action already taken] and the next update is due by [time or date]. Has anything changed that the team should know before then?",
        points: [
          "Name the real issue and date",
          "State only actions that are actually confirmed",
          "Give a specific next-update time",
          "Escalate unresolved safety, billing, or service failures",
        ],
      },
    ],
    related: ["/guides/ai-lead-follow-up", "/ai-agent-launch-kit", "/contact"],
  },
];

const AGENT_STAGE_LABELS = {
  purchase_received: "Purchase received",
  onboarding_needed: "Onboarding needed",
  blueprint_generated: "Agent blueprint generated",
  build_in_progress: "Build in progress",
  integration_setup: "Integration setup",
  testing: "Testing",
  client_review: "Client review",
  launch_ready: "Launch ready",
  live: "Live",
  optimization: "Optimization",
};

const CHAT_GREET = "Hi, I’m the GPTMarketPlus assistant. I can help you figure out what kind of AI agent would save your business the most time or help you capture more leads. What type of business do you run?";

const CHAT_OBJECTIONS = [
  {
    match: ["how much", "cost", "price"],
    reply:
      "Basic website agents start at $497. More advanced lead-capture and follow-up systems usually start around $1,497. Full business automation systems start around $3,500. The exact price depends on what you want connected and how much the agent needs to do.",
  },
  {
    match: ["need this", "not sure", "don't know", "dont know", "think about it"],
    reply:
      "That is normal. The easiest way to tell is to look at what you repeat every week. If you answer the same questions, miss leads, manually follow up, schedule by hand, or copy information between tools, an AI agent can probably save time or increase conversions.",
  },
  {
    match: ["replace employees", "replace staff"],
    reply:
      "It is better to think of it as support, not replacement. The agent handles repetitive intake, questions, routing, and follow-up so people can focus on higher-value work.",
  },
  {
    match: ["chatgpt", "chatbot", "just chat"],
    reply:
      "No. A basic chatbot only talks. A properly built AI agent follows a workflow, collects structured information, qualifies leads, triggers automations, sends summaries, and helps move the customer toward the next step.",
  },
  {
    match: ["think about", "later"],
    reply:
      "That makes sense. I can send you a simple AI automation checklist or help you book a free strategy call so you can see exactly what would make sense before spending anything.",
  },
];

function siteUrl(env) {
  return (env.SITE_URL || "https://gptmarketplus.com").replace(/\/+$/, "");
}

function isAgentIdSite(env) {
  return new URL(siteUrl(env)).hostname.replace(/^www\./, "").toLowerCase() === "agentid.services";
}

function campaignUrl(env, pathname, {
  source,
  medium,
  campaign = "agentid_growth",
  content = "",
  term = "",
} = {}) {
  const url = new URL(pathname || "/", `${siteUrl(env)}/`);
  if (source) url.searchParams.set("utm_source", cleanText(source, 80));
  if (medium) url.searchParams.set("utm_medium", cleanText(medium, 80));
  if (campaign) url.searchParams.set("utm_campaign", cleanText(campaign, 120));
  if (content) url.searchParams.set("utm_content", cleanText(content, 120));
  if (term) url.searchParams.set("utm_term", cleanText(term, 120));
  return url.toString();
}

function campaignLinkCatalog(env) {
  return {
    policy: "Use these tagged URLs in external emails, social bios, posts, PDFs, slide decks, and downloadable documents. Keep internal site navigation untagged so it does not overwrite the original session source.",
    email: {
      newsletter_home: campaignUrl(env, "/", {
        source: "newsletter",
        medium: "email",
        campaign: "agentid_newsletter",
        content: "home",
      }),
      newsletter_pricing: campaignUrl(env, "/pricing", {
        source: "newsletter",
        medium: "email",
        campaign: "agentid_newsletter",
        content: "pricing",
      }),
    },
    social_bios: {
      linkedin: campaignUrl(env, "/pricing", {
        source: "linkedin",
        medium: "social",
        campaign: "agentid_social_bio",
        content: "pricing",
      }),
      facebook: campaignUrl(env, "/pricing", {
        source: "facebook",
        medium: "social",
        campaign: "agentid_social_bio",
        content: "pricing",
      }),
      instagram: campaignUrl(env, "/pricing", {
        source: "instagram",
        medium: "social",
        campaign: "agentid_social_bio",
        content: "pricing",
      }),
      tiktok: campaignUrl(env, "/pricing", {
        source: "tiktok",
        medium: "social",
        campaign: "agentid_social_bio",
        content: "pricing",
      }),
      x: campaignUrl(env, "/pricing", {
        source: "x",
        medium: "social",
        campaign: "agentid_social_bio",
        content: "pricing",
      }),
    },
    documents: {
      proposal: campaignUrl(env, "/pricing", {
        source: "proposal",
        medium: "document",
        campaign: "agentid_sales_materials",
        content: "pricing",
      }),
      pdf_guide: campaignUrl(env, "/ai-agents", {
        source: "ai_agent_guide",
        medium: "document",
        campaign: "agentid_sales_materials",
        content: "agent_types",
      }),
      slide_deck: campaignUrl(env, "/book-a-consultation", {
        source: "sales_deck",
        medium: "document",
        campaign: "agentid_sales_materials",
        content: "consultation",
      }),
    },
  };
}

function brandName(env) {
  return env.BRAND_NAME || "GPTMarketPlus";
}

function supportEmail(env) {
  return String(env.SUPPORT_EMAIL || `hello@${new URL(siteUrl(env)).host}`).trim();
}

function contactEmail(env) {
  return String(env.CONTACT_EMAIL || supportEmail(env)).trim();
}

function ownerEmail(env) {
  return String(env.OWNER_EMAIL || contactEmail(env)).trim();
}

function bookingUrl(env) {
  return String(env.BOOKING_URL || "").trim();
}

function calendarEmbedUrl(env) {
  return String(env.CALENDAR_EMBED_URL || "").trim();
}

function adminTokenRequired(env) {
  return Boolean(String(env.ADMIN_TOKEN || "").trim());
}

function stripeReady(env) {
  return Boolean(String(env.STRIPE_SECRET_KEY || "").trim());
}

function fullCheckoutReady(env) {
  return String(env.STRIPE_CHECKOUT_ENABLED || "").trim().toLowerCase() === "true"
    && Boolean(String(env.STRIPE_SECRET_KEY || "").trim())
    && Boolean(String(env.STRIPE_WEBHOOK_SECRET || "").trim());
}

function paypalCheckoutReady(env) {
  return Boolean(
    String(env.PAYPAL_CLIENT_ID || "").trim()
    && String(env.PAYPAL_CLIENT_SECRET || "").trim()
  );
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  const clean = pathname.replace(/\/+$/, "");
  return clean || "/";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function escapeJs(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function escapeXml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function cleanText(value, maxLength = 5000) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 160) : "";
}

function cleanUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`);
    return url.toString().slice(0, 300);
  } catch {
    return "";
  }
}

function cleanPhone(value) {
  return String(value ?? "").replace(/[^0-9+(). -]/g, "").trim().slice(0, 40);
}

function agentIdGenAiConfig(env) {
  return {
    projectId: cleanText(env.GOOGLE_CLOUD_PROJECT || "", 120),
    location: cleanText(env.GOOGLE_CLOUD_LOCATION || "global", 40) || "global",
    engineId: cleanText(env.GOOGLE_DISCOVERY_ENGINE_ID || "", 120),
    configured: Boolean(
      String(env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim()
      && String(env.GOOGLE_CLOUD_PROJECT || "").trim()
      && String(env.GOOGLE_DISCOVERY_ENGINE_ID || "").trim()
    ),
  };
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function textToBase64(value) {
  return bytesToBase64(new TextEncoder().encode(String(value || "")));
}

function textToBase64Url(value) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function pemPrivateKeyBytes(pem) {
  const encoded = String(pem || "")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function googleServiceAccountAccessToken(env) {
  if (googleAccessTokenCache.token && googleAccessTokenCache.expiresAt > Date.now() + 60_000) {
    return googleAccessTokenCache.token;
  }

  let credentials = null;
  try {
    credentials = JSON.parse(String(env.GOOGLE_SERVICE_ACCOUNT_JSON || ""));
  } catch {
    return "";
  }
  if (!credentials?.client_email || !credentials?.private_key) return "";

  const now = Math.floor(Date.now() / 1000);
  const header = textToBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = textToBase64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsignedJwt = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemPrivateKeyBytes(credentials.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(unsignedJwt),
  );
  const assertion = `${unsignedJwt}.${bytesToBase64Url(new Uint8Array(signature))}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || !result?.access_token) return "";

  googleAccessTokenCache = {
    token: result.access_token,
    expiresAt: Date.now() + Math.max(300, Number(result.expires_in || 3600) - 120) * 1000,
  };
  return googleAccessTokenCache.token;
}

function shouldUseGroundedAgentIdAnswer(message) {
  const text = String(message || "").trim();
  if (text.length < 4 || text.length > 700) return false;
  if (detectContactDetails(text).email || detectContactDetails(text).phone) return false;
  return /\?$/.test(text)
    || /^(what|which|how|why|when|where|who|can|could|do|does|is|are|will|would|should)\b/i.test(text)
    || /\b(cost|price|pricing|package|service|agent|chatbot|automation|launch kit|deposit|support)\b/i.test(text);
}

function agentIdAnswerSources(env, answer) {
  const references = Array.isArray(answer?.references) ? answer.references : [];
  const sources = [];
  for (const reference of references) {
    const metadata = reference?.chunkInfo?.documentMetadata || reference?.unstructuredDocumentInfo?.documentMetadata || {};
    const uri = cleanUrl(metadata.uri || "");
    const title = cleanText(metadata.title || "", 140);
    if (!uri) continue;
    const parsed = new URL(uri);
    if (!["gptmarketplus.com", "www.gptmarketplus.com", "agentid.services", "www.agentid.services"].includes(parsed.hostname)) continue;
    const canonicalUri = new URL(`${parsed.pathname}${parsed.search}`, `${siteUrl(env)}/`).toString();
    if (sources.some((item) => item.uri === canonicalUri)) continue;
    sources.push({ title: title || parsed.pathname, uri: canonicalUri });
    if (sources.length >= 3) break;
  }
  return sources;
}

async function answerFromAgentIdKnowledge(env, message) {
  const config = agentIdGenAiConfig(env);
  if (!config.configured || !shouldUseGroundedAgentIdAnswer(message)) return null;
  const accessToken = await googleServiceAccountAccessToken(env);
  if (!accessToken) return null;

  const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/locations/${encodeURIComponent(config.location)}/collections/default_collection/engines/${encodeURIComponent(config.engineId)}/servingConfigs/default_search:answer`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "x-goog-user-project": config.projectId,
    },
    body: JSON.stringify({
      query: { text: cleanText(message, 700) },
      queryUnderstandingSpec: {
        queryRephraserSpec: { disable: false, maxRephraseSteps: 1 },
        queryClassificationSpec: {
          types: ["ADVERSARIAL_QUERY", "NON_ANSWER_SEEKING_QUERY"],
        },
      },
      answerGenerationSpec: {
        ignoreAdversarialQuery: true,
        ignoreNonAnswerSeekingQuery: true,
        ignoreJailBreakingQuery: true,
        ignoreLowRelevantContent: true,
        includeCitations: true,
        answerLanguageCode: "en",
        modelSpec: { modelVersion: "stable" },
        promptSpec: {
          preamble: "Answer only from GPTMarketPlus public content. Be concise, accurate, practical, and transparent about starting prices. Never promise revenue or performance. If the indexed content does not support an answer, say that and direct the visitor to the contact page.",
        },
      },
      groundingSpec: {
        includeGroundingSupports: true,
        filteringLevel: "FILTERING_LEVEL_HIGH",
      },
      relatedQuestionsSpec: { enable: true },
    }),
  });
  const result = await response.json().catch(() => null);
  const answer = result?.answer;
  const answerText = cleanText(answer?.answerText || "", 2200);
  if (!response.ok || answer?.state !== "SUCCEEDED" || !answerText) return null;
  const sources = agentIdAnswerSources(env, answer);
  if (!sources.length) return null;
  return {
    answer: answerText,
    sources,
    groundingScore: Number(answer?.groundingScore || 0),
    provider: "Google Cloud Agent Search",
    relatedQuestions: Array.isArray(answer?.relatedQuestions)
      ? answer.relatedQuestions.map((item) => cleanText(item, 160)).filter(Boolean).slice(0, 3)
      : [],
  };
}

function cloudflareAnswerSources(env, result) {
  const chunks = Array.isArray(result?.chunks) ? result.chunks : [];
  const sources = [];
  for (const chunk of chunks) {
    const uri = cleanUrl(chunk?.item?.key || "");
    if (!uri) continue;
    const parsed = new URL(uri);
    if (!["gptmarketplus.com", "www.gptmarketplus.com", "agentid.services", "www.agentid.services"].includes(parsed.hostname)) continue;
    const canonicalUri = new URL(`${parsed.pathname}${parsed.search}`, `${siteUrl(env)}/`).toString();
    if (sources.some((item) => item.uri === canonicalUri)) continue;
    sources.push({
      title: cleanText(chunk?.item?.metadata?.title || parsed.pathname || "GPTMarketPlus", 140),
      uri: canonicalUri,
    });
    if (sources.length >= 3) break;
  }
  return sources;
}

async function answerFromCloudflareKnowledge(env, message) {
  if (!env.AGENTID_AI_SEARCH || !shouldUseGroundedAgentIdAnswer(message)) return null;
  const result = await env.AGENTID_AI_SEARCH.chatCompletions({
    messages: [
      {
        role: "system",
        content: "Answer only from the retrieved GPTMarketPlus public pages. Be concise, accurate, and practical. Never promise revenue or performance. If the sources do not support an answer, say so and direct the visitor to the contact page.",
      },
      { role: "user", content: cleanText(message, 700) },
    ],
    ai_search_options: {
      retrieval: {
        retrieval_type: "hybrid",
        match_threshold: 0.4,
        max_num_results: 5,
        context_expansion: 1,
        return_on_failure: true,
      },
      reranking: {
        enabled: true,
        model: "@cf/baai/bge-reranker-base",
        match_threshold: 0.4,
      },
      cache: {
        enabled: true,
        cache_threshold: "close_enough",
      },
    },
  });
  const answerText = cleanText(result?.choices?.[0]?.message?.content || "", 2200);
  const sources = cloudflareAnswerSources(env, result);
  if (!answerText || !sources.length) return null;
  const scores = (Array.isArray(result?.chunks) ? result.chunks : [])
    .map((chunk) => Number(chunk?.score || 0))
    .filter(Number.isFinite);
  return {
    answer: answerText,
    sources,
    groundingScore: scores.length ? Math.max(...scores) : 0,
    provider: "Cloudflare AI Search",
    relatedQuestions: [],
  };
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

function htmlResponse(html, status = 200, headers = {}) {
  return new Response(html, {
    status,
    headers: { ...HTML_HEADERS, ...headers },
  });
}

function textResponse(text, status = 200, headers = {}) {
  return new Response(text, {
    status,
    headers: { ...TEXT_HEADERS, ...headers },
  });
}

function xmlResponse(xml, status = 200, headers = {}) {
  return new Response(xml, {
    status,
    headers: { ...XML_HEADERS, ...headers },
  });
}

function svgResponse(svg, status = 200, headers = {}) {
  return new Response(svg, {
    status,
    headers: { ...SVG_HEADERS, ...headers },
  });
}

async function readRequestText(request, maxBytes) {
  const contentLength = Number.parseInt(request.headers.get("content-length") || "", 10);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return BODY_TOO_LARGE;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel("Request body exceeds the configured limit.").catch(() => {});
      return BODY_TOO_LARGE;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function readJson(request) {
  const rawBody = await readRequestText(request, MAX_JSON_BODY_BYTES);
  if (rawBody === BODY_TOO_LARGE) return BODY_TOO_LARGE;
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function payloadTooLargeResponse(maxBytes = MAX_JSON_BODY_BYTES) {
  return jsonResponse({
    ok: false,
    error: "Request body is too large.",
    maxBytes,
  }, 413);
}

function toTitle(value) {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function money(value) {
  return `$${(Number(value || 0) / 100).toFixed(0)}`;
}

function moneyWithCents(value) {
  return `$${(Number(value || 0) / 100).toFixed(2)}`;
}

function businessTypeCatalog() {
  return [
    "Local service business",
    "Contractor",
    "Real estate agent",
    "Facility management company",
    "Medical or senior-care business",
    "Law office",
    "Consultant",
    "Agency",
    "E-commerce brand",
    "Internal operations team",
    "Other",
  ];
}

function leadTheme(text) {
  const haystack = String(text || "").toLowerCase();
  if (/book|schedule|calendar|appointment/.test(haystack)) return "scheduling";
  if (/support|questions|faq|response|reply/.test(haystack)) return "support";
  if (/follow|cold|lead|missed|convert/.test(haystack)) return "follow-up";
  if (/crm|pipeline|hubspot|salesforce|pipe|zap/.test(haystack)) return "crm";
  if (/task|workflow|operations|admin|internal|staff/.test(haystack)) return "operations";
  if (/email|sms|message|text/.test(haystack)) return "communication";
  if (/quote|estimate|bid|proposal/.test(haystack)) return "quote";
  if (/review|referral|testimonial/.test(haystack)) return "reviews";
  if (/document|pdf|policy|sop|manual/.test(haystack)) return "documents";
  return "lead capture";
}

function objectionTag(text) {
  const haystack = String(text || "").toLowerCase();
  if (/how much|cost|price/.test(haystack)) return "cost";
  if (/need this|not sure|don't know|dont know|think about it|later/.test(haystack)) return "uncertain";
  if (/replace employees|replace staff/.test(haystack)) return "replacement";
  if (/chatgpt|chatbot|just chat/.test(haystack)) return "chatbot";
  if (/secure|privacy|hipaa|legal|compliance/.test(haystack)) return "compliance";
  return "";
}

function scoreLead(input) {
  let score = 15;
  const text = `${input.painPoint || ""} ${input.desiredAutomation || ""} ${input.currentTools || ""} ${input.businessType || ""} ${input.budgetRange || ""} ${input.timeline || ""}`.toLowerCase();

  if (input.name) score += 10;
  if (input.email) score += 12;
  if (input.phone) score += 8;
  if (input.website) score += 5;
  if (input.businessName) score += 8;

  if (/immediately|this week|this month/.test((input.timeline || "").toLowerCase())) score += 18;
  if (/3,500|3500|\$3,500|above/.test((input.budgetRange || "").toLowerCase())) score += 20;
  else if (/1,500|1500|3,500|3500/.test((input.budgetRange || "").toLowerCase())) score += 15;
  else if (/500|1,500/.test((input.budgetRange || "").toLowerCase())) score += 10;

  if (/missed|lead|follow|book|schedule|quote|crm|support|operations|task|workflow/.test(text)) score += 20;
  if (/multiple|several|dashboard|report|staff|department/.test(text)) score += 10;
  if (/website|chat|assistant|automation/.test(text)) score += 10;

  return Math.max(0, Math.min(100, score));
}

function leadTagFromScore(score) {
  if (score >= 75) return "HOT";
  if (score >= 45) return "WARM";
  return "COLD";
}

function packageBySignals(input) {
  const text = `${input.businessType || ""} ${input.painPoint || ""} ${input.desiredAutomation || ""} ${input.currentTools || ""} ${input.timeline || ""}`.toLowerCase();
  const budget = String(input.budgetRange || "").toLowerCase();

  if (/multiple|dashboard|report|staff|department|operations|internal|more than one agent/.test(text)) {
    return "Business Automation Suite";
  }
  if (/missed|follow|book|schedule|quote|crm|lead|support|customer|intake/.test(text)) {
    return "Growth Agent System";
  }
  if (/budget.*under \$?500|under \$?500/.test(budget) || /just researching/.test(text)) {
    return "Starter Agent";
  }
  if (/\$3,500|\$3500|3,500|3500/.test(budget)) {
    return "Business Automation Suite";
  }
  if (/\$1,500|\$1500|1,500|1500/.test(budget)) {
    return "Growth Agent System";
  }
  return "Starter Agent";
}

function recommendedAgentForBusinessType(businessType) {
  const normalized = String(businessType || "").toLowerCase();
  const match = BUSINESS_RECOMMENDATIONS.find((item) => normalized.includes(item.match));
  if (match) return match;
  if (/multiple departments|staff workflow|operations/.test(normalized)) {
    return { agentType: "Operations Assistant Agent", package: "Business Automation Suite" };
  }
  return {
    agentType: "Website Sales Agent",
    package: packageBySignals({ businessType }),
  };
}

function packagePriceLabel(name) {
  if (name === "Starter Agent") return "Starting at $497 setup";
  if (name === "Growth Agent System") return "Starting at $1,497 setup";
  if (name === "Business Automation Suite") return "Starting at $3,500 setup";
  return name;
}

function packagePriceCents(name) {
  if (name === "Starter Agent") return 49700;
  if (name === "Growth Agent System") return 149700;
  if (name === "Business Automation Suite") return 350000;
  return 0;
}

function buildLeadSummary(lead) {
  const pieces = [];
  if (lead.leadTag) pieces.push(`${lead.leadTag} LEAD`);
  if (lead.businessType) pieces.push(lead.businessType);
  if (lead.recommendedPackage) pieces.push(`recommended ${lead.recommendedPackage}`);
  if (lead.painPoint) pieces.push(`needs ${lead.painPoint}`);
  if (lead.budgetRange) pieces.push(`budget ${lead.budgetRange}`);
  if (lead.timeline) pieces.push(`timeline ${lead.timeline}`);
  return pieces.join(" | ");
}

function generateFollowUpSequence(lead, env = null) {
  const packageName = lead.recommendedPackage || "the right package";
  const emailLink = (pathname, content) => env
    ? campaignUrl(env, pathname, {
      source: "lead_followup",
      medium: "email",
      campaign: "agentid_lead_nurture",
      content,
    })
    : pathname;
  return [
    {
      step: 1,
      subject: "We received your AI agent request",
      body: `Thanks for checking out GPTMarketPlus. Based on what you told us, your business may benefit from ${packageName}. Review plans and pricing: ${emailLink("/pricing", "step_1_pricing")}`,
    },
    {
      step: 2,
      subject: "What a custom AI agent can do for your business",
      body: `A custom AI agent can respond faster, capture more leads, and route requests before your team has to do the manual work. Compare agent types: ${emailLink("/ai-agents", "step_2_agent_types")}`,
    },
    {
      step: 3,
      subject: "Where most businesses lose leads",
      body: `Most businesses lose leads because follow-up is too slow. A custom AI agent can help collect, qualify, and route leads instantly. See practical use cases: ${emailLink("/use-cases", "step_3_use_cases")}`,
    },
    {
      step: 4,
      subject: "Want us to map your first AI workflow?",
      body: `We can map the first workflow that will save the most time or capture the most revenue. Request your plan: ${emailLink("/contact", "step_4_contact")}`,
    },
    {
      step: 5,
      subject: "Should we close your AI agent request?",
      body: `When you are ready, book a strategy call so we can confirm scope and pricing: ${emailLink("/book-a-consultation", "step_5_consultation")}`,
    },
  ];
}

function stageLabel(stage) {
  return AGENT_STAGE_LABELS[stage] || toTitle(stage || "");
}

function currentStageIndex(stage) {
  const index = BUILD_STAGES.indexOf(stage);
  return index >= 0 ? index : 0;
}

function buildProgressPercent(stage) {
  return Math.round(((currentStageIndex(stage) + 1) / BUILD_STAGES.length) * 100);
}

function defaultLeadStage(leadTag, purchaseStatus = "") {
  if (purchaseStatus === "paid") return "purchase_received";
  if (leadTag === "HOT") return "qualified";
  if (leadTag === "WARM") return "follow_up_needed";
  return "new_lead";
}

function renderLeadStageLabel(stage) {
  return stageLabel(stage);
}

async function ensureAgentIdSchema(env) {
  // Schema ownership belongs to migrations. Keeping a D1 promise in module
  // scope can retain request-bound I/O across reused Worker isolates.
  return Boolean(env.GMP_DB);
}

async function dbGetLeadByConversation(env, conversationId) {
  if (!env.GMP_DB || !conversationId) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_leads WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1")
    .bind(conversationId)
    .first();
}

async function dbGetLeadByToken(env, token) {
  if (!env.GMP_DB || !token) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_leads WHERE dashboard_token = ? ORDER BY created_at DESC LIMIT 1")
    .bind(token)
    .first();
}

async function dbGetLeadById(env, id) {
  if (!env.GMP_DB || !id) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_leads WHERE id = ? LIMIT 1")
    .bind(id)
    .first();
}

async function dbListLeads(env, limit = 50) {
  if (!env.GMP_DB) return [];
  await ensureAgentIdSchema(env);
  const result = await env.GMP_DB.prepare(
    "SELECT * FROM agentid_leads ORDER BY datetime(created_at) DESC LIMIT ?"
  ).bind(limit).all();
  return result.results || [];
}

async function dbListPurchases(env, limit = 50) {
  if (!env.GMP_DB) return [];
  await ensureAgentIdSchema(env);
  const result = await env.GMP_DB.prepare(
    "SELECT * FROM agentid_purchases ORDER BY datetime(created_at) DESC LIMIT ?"
  ).bind(limit).all();
  return result.results || [];
}

async function dbListOnboarding(env, limit = 25) {
  if (!env.GMP_DB) return [];
  await ensureAgentIdSchema(env);
  const result = await env.GMP_DB.prepare(
    "SELECT * FROM agentid_onboarding ORDER BY datetime(created_at) DESC LIMIT ?"
  ).bind(limit).all();
  return result.results || [];
}

async function dbListEvents(env, limit = 100) {
  if (!env.GMP_DB) return [];
  await ensureAgentIdSchema(env);
  const result = await env.GMP_DB.prepare(
    "SELECT * FROM agentid_events ORDER BY datetime(created_at) DESC LIMIT ?"
  ).bind(limit).all();
  return result.results || [];
}

async function dbUpsertLead(env, lead) {
  if (!env.GMP_DB) return lead;
  await ensureAgentIdSchema(env);
  const now = new Date().toISOString();
  const payload = {
    id: lead.id || crypto.randomUUID(),
    created_at: lead.created_at || now,
    updated_at: now,
    source_page: cleanText(lead.source_page || "/", 200),
    conversation_id: cleanText(lead.conversation_id || "", 120),
    crm_stage: cleanText(lead.crm_stage || defaultLeadStage(lead.lead_status || lead.leadTag || "COLD", lead.purchaseStatus), 80),
    lead_status: cleanText(lead.lead_status || "COLD", 20).toUpperCase(),
    lead_score: Number(lead.lead_score || 0),
    name: cleanText(lead.name || "", 120),
    email: cleanEmail(lead.email || ""),
    phone: cleanPhone(lead.phone || ""),
    business_name: cleanText(lead.business_name || "", 160),
    website: cleanUrl(lead.website || ""),
    business_type: cleanText(lead.business_type || "", 120),
    pain_point: cleanText(lead.pain_point || "", 300),
    desired_automation: cleanText(lead.desired_automation || "", 300),
    automation_theme: cleanText(lead.automation_theme || leadTheme(lead.desired_automation || lead.pain_point || ""), 80),
    current_tools: cleanText(lead.current_tools || "", 300),
    common_objection: cleanText(lead.common_objection || "", 80),
    recommended_agent_type: cleanText(lead.recommended_agent_type || "", 120),
    recommended_package: cleanText(lead.recommended_package || "", 120),
    budget_range: cleanText(lead.budget_range || "", 80),
    timeline: cleanText(lead.timeline || "", 80),
    preferred_contact_method: cleanText(lead.preferred_contact_method || "", 80),
    best_time_to_contact: cleanText(lead.best_time_to_contact || "", 80),
    transcript_summary: cleanText(lead.transcript_summary || "", 1000),
    full_transcript: cleanText(lead.full_transcript || "", 12000),
    next_action: cleanText(lead.next_action || "", 300),
    assigned_to: cleanText(lead.assigned_to || "owner", 80),
    follow_up_status: cleanText(lead.follow_up_status || "queued", 40),
    contact_consent: lead.contact_consent ? 1 : 0,
    marketing_consent: lead.marketing_consent ? 1 : 0,
    booked_call: lead.booked_call ? 1 : 0,
    quote_requested: lead.quote_requested ? 1 : 0,
    purchase_intent: cleanText(lead.purchase_intent || "", 80),
    purchase_id: cleanText(lead.purchase_id || "", 120),
    onboarding_id: cleanText(lead.onboarding_id || "", 120),
    dashboard_token: cleanText(lead.dashboard_token || "", 120),
    notes: cleanText(lead.notes || "", 1200),
  };

  await env.GMP_DB.prepare(
    `INSERT INTO agentid_leads (
      id, created_at, updated_at, source_page, conversation_id, crm_stage, lead_status, lead_score,
      name, email, phone, business_name, website, business_type, pain_point, desired_automation,
      automation_theme, current_tools, common_objection, recommended_agent_type, recommended_package,
      budget_range, timeline, preferred_contact_method, best_time_to_contact, transcript_summary,
      full_transcript, next_action, assigned_to, follow_up_status, contact_consent, marketing_consent,
      booked_call, quote_requested, purchase_intent, purchase_id, onboarding_id, dashboard_token, notes
    ) VALUES (
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?
    )
    ON CONFLICT(id) DO UPDATE SET
      updated_at=excluded.updated_at,
      source_page=excluded.source_page,
      conversation_id=excluded.conversation_id,
      crm_stage=excluded.crm_stage,
      lead_status=excluded.lead_status,
      lead_score=excluded.lead_score,
      name=excluded.name,
      email=excluded.email,
      phone=excluded.phone,
      business_name=excluded.business_name,
      website=excluded.website,
      business_type=excluded.business_type,
      pain_point=excluded.pain_point,
      desired_automation=excluded.desired_automation,
      automation_theme=excluded.automation_theme,
      current_tools=excluded.current_tools,
      common_objection=excluded.common_objection,
      recommended_agent_type=excluded.recommended_agent_type,
      recommended_package=excluded.recommended_package,
      budget_range=excluded.budget_range,
      timeline=excluded.timeline,
      preferred_contact_method=excluded.preferred_contact_method,
      best_time_to_contact=excluded.best_time_to_contact,
      transcript_summary=excluded.transcript_summary,
      full_transcript=excluded.full_transcript,
      next_action=excluded.next_action,
      assigned_to=excluded.assigned_to,
      follow_up_status=excluded.follow_up_status,
      contact_consent=excluded.contact_consent,
      marketing_consent=excluded.marketing_consent,
      booked_call=excluded.booked_call,
      quote_requested=excluded.quote_requested,
      purchase_intent=excluded.purchase_intent,
      purchase_id=excluded.purchase_id,
      onboarding_id=excluded.onboarding_id,
      dashboard_token=excluded.dashboard_token,
      notes=excluded.notes
    `
  ).bind(
    payload.id,
    payload.created_at,
    payload.updated_at,
    payload.source_page,
    payload.conversation_id || null,
    payload.crm_stage,
    payload.lead_status,
    payload.lead_score,
    payload.name || null,
    payload.email || null,
    payload.phone || null,
    payload.business_name || null,
    payload.website || null,
    payload.business_type || null,
    payload.pain_point || null,
    payload.desired_automation || null,
    payload.automation_theme || null,
    payload.current_tools || null,
    payload.common_objection || null,
    payload.recommended_agent_type || null,
    payload.recommended_package || null,
    payload.budget_range || null,
    payload.timeline || null,
    payload.preferred_contact_method || null,
    payload.best_time_to_contact || null,
    payload.transcript_summary || null,
    payload.full_transcript || null,
    payload.next_action || null,
    payload.assigned_to || null,
    payload.follow_up_status || null,
    payload.contact_consent,
    payload.marketing_consent,
    payload.booked_call,
    payload.quote_requested,
    payload.purchase_intent || null,
    payload.purchase_id || null,
    payload.onboarding_id || null,
    payload.dashboard_token || null,
    payload.notes || null,
  ).run();

  return { ...lead, ...payload };
}

async function dbUpsertPurchase(env, purchase) {
  if (!env.GMP_DB) return purchase;
  await ensureAgentIdSchema(env);
  const now = new Date().toISOString();
  const payload = {
    id: purchase.id || crypto.randomUUID(),
    created_at: purchase.created_at || now,
    updated_at: now,
    stripe_session_id: cleanText(purchase.stripe_session_id || "", 160),
    stripe_payment_intent_id: cleanText(purchase.stripe_payment_intent_id || "", 160),
    package_id: cleanText(purchase.package_id || "", 120),
    package_name: cleanText(purchase.package_name || "", 160),
    package_tier: cleanText(purchase.package_tier || "", 120),
    checkout_type: cleanText(purchase.checkout_type || "setup", 80),
    amount_cents: Number(purchase.amount_cents || 0),
    currency: cleanText(purchase.currency || "usd", 12),
    customer_email: cleanEmail(purchase.customer_email || ""),
    source_page: cleanText(purchase.source_page || "/", 200),
    lead_id: cleanText(purchase.lead_id || "", 120),
    status: cleanText(purchase.status || "pending", 40),
    dashboard_token: cleanText(purchase.dashboard_token || "", 120),
    onboarding_url: cleanText(purchase.onboarding_url || "", 300),
    metadata_json: JSON.stringify(purchase.metadata_json || {}),
    consent_marketing: purchase.consent_marketing ? 1 : 0,
    fulfillment_status: cleanText(purchase.fulfillment_status || "purchase_received", 80),
    notes: cleanText(purchase.notes || "", 1200),
  };

  await env.GMP_DB.prepare(
    `INSERT INTO agentid_purchases (
      id, created_at, updated_at, stripe_session_id, stripe_payment_intent_id, package_id, package_name,
      package_tier, checkout_type, amount_cents, currency, customer_email, source_page, lead_id, status,
      dashboard_token, onboarding_url, metadata_json, consent_marketing, fulfillment_status, notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      updated_at=excluded.updated_at,
      stripe_session_id=excluded.stripe_session_id,
      stripe_payment_intent_id=excluded.stripe_payment_intent_id,
      package_id=excluded.package_id,
      package_name=excluded.package_name,
      package_tier=excluded.package_tier,
      checkout_type=excluded.checkout_type,
      amount_cents=excluded.amount_cents,
      currency=excluded.currency,
      customer_email=excluded.customer_email,
      source_page=excluded.source_page,
      lead_id=excluded.lead_id,
      status=excluded.status,
      dashboard_token=excluded.dashboard_token,
      onboarding_url=excluded.onboarding_url,
      metadata_json=excluded.metadata_json,
      consent_marketing=excluded.consent_marketing,
      fulfillment_status=excluded.fulfillment_status,
      notes=excluded.notes`
  ).bind(
    payload.id,
    payload.created_at,
    payload.updated_at,
    payload.stripe_session_id || null,
    payload.stripe_payment_intent_id || null,
    payload.package_id || null,
    payload.package_name || null,
    payload.package_tier || null,
    payload.checkout_type,
    payload.amount_cents,
    payload.currency,
    payload.customer_email || null,
    payload.source_page,
    payload.lead_id || null,
    payload.status,
    payload.dashboard_token || null,
    payload.onboarding_url || null,
    payload.metadata_json,
    payload.consent_marketing,
    payload.fulfillment_status,
    payload.notes || null,
  ).run();

  return { ...purchase, ...payload };
}

async function dbUpsertOnboarding(env, record) {
  if (!env.GMP_DB) return record;
  await ensureAgentIdSchema(env);
  const now = new Date().toISOString();
  const payload = {
    id: record.id || crypto.randomUUID(),
    created_at: record.created_at || now,
    updated_at: now,
    lead_id: cleanText(record.lead_id || "", 120),
    purchase_id: cleanText(record.purchase_id || "", 120),
    package_tier: cleanText(record.package_tier || "", 120),
    business_name: cleanText(record.business_name || "", 160),
    website_url: cleanUrl(record.website_url || ""),
    business_type: cleanText(record.business_type || "", 120),
    main_service: cleanText(record.main_service || "", 200),
    target_customers: cleanText(record.target_customers || "", 300),
    main_problem: cleanText(record.main_problem || "", 300),
    current_lead_process: cleanText(record.current_lead_process || "", 300),
    current_followup_process: cleanText(record.current_followup_process || "", 300),
    common_questions: cleanText(record.common_questions || "", 1000),
    services_offered: cleanText(record.services_offered || "", 1000),
    pricing_information: cleanText(record.pricing_information || "", 500),
    business_hours: cleanText(record.business_hours || "", 200),
    service_area: cleanText(record.service_area || "", 200),
    contact_methods: cleanText(record.contact_methods || "", 300),
    booking_process: cleanText(record.booking_process || "", 300),
    tools_used: cleanText(record.tools_used || "", 500),
    staff_alerts: cleanText(record.staff_alerts || "", 500),
    tone: cleanText(record.tone || "", 200),
    allowed_to_say: cleanText(record.allowed_to_say || "", 500),
    never_to_say: cleanText(record.never_to_say || "", 500),
    escalation_rules: cleanText(record.escalation_rules || "", 1000),
    compliance_concerns: cleanText(record.compliance_concerns || "", 1000),
    training_files: cleanText(record.training_files || "", 2000),
    desired_launch_date: cleanText(record.desired_launch_date || "", 80),
    build_status_stage: cleanText(record.build_status_stage || "onboarding_needed", 80),
    build_status_index: Number(record.build_status_index || 0),
    recommended_agent_name: cleanText(record.recommended_agent_name || "", 120),
    recommended_agent_type: cleanText(record.recommended_agent_type || "", 120),
    customer_blueprint_html: String(record.customer_blueprint_html || ""),
    internal_blueprint_json: JSON.stringify(record.internal_blueprint_json || {}),
    agent_blueprint_json: JSON.stringify(record.agent_blueprint_json || {}),
    system_prompt_text: String(record.system_prompt_text || ""),
    integration_plan_json: JSON.stringify(record.integration_plan_json || {}),
    dashboard_token: cleanText(record.dashboard_token || "", 120),
    launch_notes: cleanText(record.launch_notes || "", 1200),
  };

  await env.GMP_DB.prepare(
    `INSERT INTO agentid_onboarding (
      id, created_at, updated_at, lead_id, purchase_id, package_tier, business_name, website_url, business_type,
      main_service, target_customers, main_problem, current_lead_process, current_followup_process, common_questions,
      services_offered, pricing_information, business_hours, service_area, contact_methods, booking_process, tools_used,
      staff_alerts, tone, allowed_to_say, never_to_say, escalation_rules, compliance_concerns, training_files,
      desired_launch_date, build_status_stage, build_status_index, recommended_agent_name, recommended_agent_type,
      customer_blueprint_html, internal_blueprint_json, agent_blueprint_json, system_prompt_text, integration_plan_json,
      dashboard_token, launch_notes
    ) VALUES (
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,?,?,?,?,?,?,?,
      ?
    )
    ON CONFLICT(id) DO UPDATE SET
      updated_at=excluded.updated_at,
      lead_id=excluded.lead_id,
      purchase_id=excluded.purchase_id,
      package_tier=excluded.package_tier,
      business_name=excluded.business_name,
      website_url=excluded.website_url,
      business_type=excluded.business_type,
      main_service=excluded.main_service,
      target_customers=excluded.target_customers,
      main_problem=excluded.main_problem,
      current_lead_process=excluded.current_lead_process,
      current_followup_process=excluded.current_followup_process,
      common_questions=excluded.common_questions,
      services_offered=excluded.services_offered,
      pricing_information=excluded.pricing_information,
      business_hours=excluded.business_hours,
      service_area=excluded.service_area,
      contact_methods=excluded.contact_methods,
      booking_process=excluded.booking_process,
      tools_used=excluded.tools_used,
      staff_alerts=excluded.staff_alerts,
      tone=excluded.tone,
      allowed_to_say=excluded.allowed_to_say,
      never_to_say=excluded.never_to_say,
      escalation_rules=excluded.escalation_rules,
      compliance_concerns=excluded.compliance_concerns,
      training_files=excluded.training_files,
      desired_launch_date=excluded.desired_launch_date,
      build_status_stage=excluded.build_status_stage,
      build_status_index=excluded.build_status_index,
      recommended_agent_name=excluded.recommended_agent_name,
      recommended_agent_type=excluded.recommended_agent_type,
      customer_blueprint_html=excluded.customer_blueprint_html,
      internal_blueprint_json=excluded.internal_blueprint_json,
      agent_blueprint_json=excluded.agent_blueprint_json,
      system_prompt_text=excluded.system_prompt_text,
      integration_plan_json=excluded.integration_plan_json,
      dashboard_token=excluded.dashboard_token,
      launch_notes=excluded.launch_notes`
  ).bind(
    payload.id,
    payload.created_at,
    payload.updated_at,
    payload.lead_id || null,
    payload.purchase_id || null,
    payload.package_tier || null,
    payload.business_name || null,
    payload.website_url || null,
    payload.business_type || null,
    payload.main_service || null,
    payload.target_customers || null,
    payload.main_problem || null,
    payload.current_lead_process || null,
    payload.current_followup_process || null,
    payload.common_questions || null,
    payload.services_offered || null,
    payload.pricing_information || null,
    payload.business_hours || null,
    payload.service_area || null,
    payload.contact_methods || null,
    payload.booking_process || null,
    payload.tools_used || null,
    payload.staff_alerts || null,
    payload.tone || null,
    payload.allowed_to_say || null,
    payload.never_to_say || null,
    payload.escalation_rules || null,
    payload.compliance_concerns || null,
    payload.training_files || null,
    payload.desired_launch_date || null,
    payload.build_status_stage,
    payload.build_status_index,
    payload.recommended_agent_name || null,
    payload.recommended_agent_type || null,
    payload.customer_blueprint_html || null,
    payload.internal_blueprint_json,
    payload.agent_blueprint_json,
    payload.system_prompt_text || null,
    payload.integration_plan_json,
    payload.dashboard_token || null,
    payload.launch_notes || null,
  ).run();

  return { ...record, ...payload };
}

async function dbInsertFollowups(env, leadId, sequence) {
  if (!env.GMP_DB || !leadId || !Array.isArray(sequence) || !sequence.length) return;
  await ensureAgentIdSchema(env);
  const now = new Date().toISOString();
  for (const item of sequence) {
    await env.GMP_DB.prepare(
      `INSERT INTO agentid_followups (id, lead_id, step_number, subject, body, send_after_hours, consent_required, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         lead_id=excluded.lead_id,
         step_number=excluded.step_number,
         subject=excluded.subject,
         body=excluded.body,
         send_after_hours=excluded.send_after_hours,
         consent_required=excluded.consent_required,
         status=excluded.status,
         updated_at=excluded.updated_at`
    ).bind(
      `follow_${leadId}_${item.step}`,
      leadId,
      Number(item.step || 0),
      cleanText(item.subject || "", 160),
      cleanText(item.body || "", 1200),
      Number(item.send_after_hours || 0),
      item.consent_required === false ? 0 : 1,
      "queued",
      now,
      now,
    ).run();
  }
}

function writeAttributionAnalytics(env, payload, properties = {}) {
  if (!env.ANALYTICS_ENGINE || typeof env.ANALYTICS_ENGINE.writeDataPoint !== "function") return;
  const source = cleanText(properties.utm_source || properties.source || properties.traffic_source || "direct", 120);
  const medium = cleanText(properties.utm_medium || properties.medium || "none", 120);
  const campaign = cleanText(properties.utm_campaign || properties.campaign || "none", 160);
  const referrer = cleanText(properties.referrer_host || properties.referrer || "none", 200);
  const numericValue = Number(properties.value || properties.amount_cents || properties.scroll_percent || 0);
  env.ANALYTICS_ENGINE.writeDataPoint({
    blobs: [
      payload.event_name,
      payload.source_page,
      source,
      medium,
      campaign,
      referrer,
    ],
    doubles: [
      1,
      Number.isFinite(numericValue) ? numericValue : 0,
    ],
    indexes: [
      payload.session_id
        || payload.conversation_id
        || payload.lead_id
        || payload.id,
    ],
  });
}

async function dbInsertEvent(env, event) {
  const properties = event.properties_json && typeof event.properties_json === "object"
    ? event.properties_json
    : {};
  const payload = {
    id: event.id || crypto.randomUUID(),
    created_at: event.created_at || new Date().toISOString(),
    event_name: cleanText(event.event_name || "event", 120),
    source_page: cleanText(event.source_page || "/", 200),
    conversation_id: cleanText(event.conversation_id || "", 120),
    lead_id: cleanText(event.lead_id || "", 120),
    session_id: cleanText(event.session_id || "", 160),
    properties_json: JSON.stringify(properties),
    user_agent: cleanText(event.user_agent || "", 300),
  };
  writeAttributionAnalytics(env, payload, properties);
  if (!env.GMP_DB) return payload;
  await ensureAgentIdSchema(env);
  await env.GMP_DB.prepare(
    `INSERT INTO agentid_events (id, created_at, event_name, source_page, conversation_id, lead_id, session_id, properties_json, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       created_at=excluded.created_at,
       event_name=excluded.event_name,
       source_page=excluded.source_page,
       conversation_id=excluded.conversation_id,
       lead_id=excluded.lead_id,
       session_id=excluded.session_id,
       properties_json=excluded.properties_json,
       user_agent=excluded.user_agent`
  ).bind(
    payload.id,
    payload.created_at,
    payload.event_name,
    payload.source_page,
    payload.conversation_id || null,
    payload.lead_id || null,
    payload.session_id || null,
    payload.properties_json,
    payload.user_agent || null,
  ).run();
  return payload;
}

async function queryD1First(env, sql, bindings = []) {
  if (!env.GMP_DB) return null;
  await ensureAgentIdSchema(env);
  const statement = env.GMP_DB.prepare(sql);
  const bound = bindings.length ? statement.bind(...bindings) : statement;
  return bound.first();
}

async function queryD1All(env, sql, bindings = []) {
  if (!env.GMP_DB) return [];
  await ensureAgentIdSchema(env);
  const statement = env.GMP_DB.prepare(sql);
  const bound = bindings.length ? statement.bind(...bindings) : statement;
  const result = await bound.all();
  return result.results || [];
}

async function dbGetPurchaseBySession(env, sessionId) {
  if (!env.GMP_DB || !sessionId) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_purchases WHERE stripe_session_id = ? LIMIT 1")
    .bind(sessionId)
    .first();
}

async function dbGetPurchaseById(env, id) {
  if (!env.GMP_DB || !id) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_purchases WHERE id = ? LIMIT 1")
    .bind(id)
    .first();
}

async function dbGetPurchaseByToken(env, token) {
  if (!env.GMP_DB || !token) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_purchases WHERE dashboard_token = ? ORDER BY datetime(created_at) DESC LIMIT 1")
    .bind(token)
    .first();
}

async function dbGetOnboardingByToken(env, token) {
  if (!env.GMP_DB || !token) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_onboarding WHERE dashboard_token = ? ORDER BY datetime(created_at) DESC LIMIT 1")
    .bind(token)
    .first();
}

async function dbGetOnboardingByPurchase(env, purchaseId) {
  if (!env.GMP_DB || !purchaseId) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_onboarding WHERE purchase_id = ? ORDER BY datetime(created_at) DESC LIMIT 1")
    .bind(purchaseId)
    .first();
}

async function dbGetOnboardingByLead(env, leadId) {
  if (!env.GMP_DB || !leadId) return null;
  await ensureAgentIdSchema(env);
  return env.GMP_DB.prepare("SELECT * FROM agentid_onboarding WHERE lead_id = ? ORDER BY datetime(created_at) DESC LIMIT 1")
    .bind(leadId)
    .first();
}

async function rateLimit(env, request, scope = "form") {
  const kv = env.GMP_KV;
  const limits = scope === "event" ? EVENT_RATE_LIMIT : FORM_RATE_LIMIT;
  const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
  const nativeLimiter = scope === "event" ? env.EVENT_RATE_LIMITER : env.FORM_RATE_LIMITER;
  let nativeLimiterActive = false;
  if (nativeLimiter && typeof nativeLimiter.limit === "function") {
    try {
      const result = await nativeLimiter.limit({ key: `${scope}:${ip}` });
      nativeLimiterActive = true;
      if (!result.success) return { ok: false, retryAfter: limits.windowSeconds };
    } catch (error) {
      console.warn("native rate limiter unavailable; using KV fallback", error);
    }
  }
  if (!kv) return { ok: true };
  const day = new Date().toISOString().slice(0, 10);
  const base = `agentid:rl:${scope}:${ip}`;
  const windowKey = `${base}:window`;
  const dayKey = `${base}:${day}`;
  const [windowCountRaw, dayCountRaw] = await Promise.all([
    nativeLimiterActive ? Promise.resolve("0") : kv.get(windowKey),
    kv.get(dayKey),
  ]);
  const windowCount = Number(windowCountRaw || 0);
  const dayCount = Number(dayCountRaw || 0);
  if (!nativeLimiterActive && windowCount >= limits.maxPerWindow) {
    return { ok: false, retryAfter: limits.windowSeconds };
  }
  if (dayCount >= limits.maxPerDay) return { ok: false, retryAfter: 86400 };
  const updates = [kv.put(dayKey, String(dayCount + 1), { expirationTtl: 86400 })];
  if (!nativeLimiterActive) {
    updates.push(kv.put(windowKey, String(windowCount + 1), { expirationTtl: limits.windowSeconds }));
  }
  await Promise.all(updates);
  return { ok: true };
}

async function verifyTurnstile(body, request, env) {
  const secret = String(env.TURNSTILE_SECRET_KEY || "").trim();
  if (!secret) return true;
  const responseToken = cleanText(body["cf-turnstile-response"] || body.turnstileToken || "", 4096);
  if (!responseToken) return false;
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", responseToken);
  form.set("remoteip", request.headers.get("cf-connecting-ip") || "");
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const result = await verification.json().catch(() => null);
  return Boolean(result && result.success);
}

async function sendWebhook(env, type, payload) {
  const url = String(env.CRM_WEBHOOK_URL || env.LEAD_WEBHOOK_URL || "").trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
  } catch (error) {
    console.debug("agentid webhook failed", error);
  }
}

function emailDeliveryResult({ delivered = false, provider = "none", code, detail = "", attempts = [] }) {
  return {
    ok: delivered,
    delivered,
    provider,
    code,
    ...(detail ? { detail } : {}),
    ...(attempts.length ? { attempts } : {}),
  };
}

function emailFailureDetail(error) {
  return cleanText(error instanceof Error ? error.message : error, 240) || "Email provider request failed.";
}

async function sendCloudflareOwnerEmail(env, subject, text, html, replyTo = "") {
  const binding = env.TRANSACTIONAL_EMAIL;
  const recipient = cleanEmail(env.OWNER_NOTIFICATION_EMAIL || "");
  const sender = cleanEmail(supportEmail(env));
  if (!binding || typeof binding.send !== "function") {
    return emailDeliveryResult({ provider: "cloudflare_send_email", code: "provider_not_configured" });
  }
  if (!recipient || !sender) {
    return emailDeliveryResult({ provider: "cloudflare_send_email", code: "provider_misconfigured" });
  }

  const message = {
    from: { name: brandName(env), email: sender },
    to: recipient,
    subject: cleanText(subject, 300),
    text: String(text || ""),
    html: String(html || ""),
  };
  const replyAddress = cleanEmail(replyTo);
  if (replyAddress) message.replyTo = replyAddress;

  try {
    const result = await binding.send(message);
    return {
      ...emailDeliveryResult({ delivered: true, provider: "cloudflare_send_email", code: "accepted" }),
      ...(result?.messageId ? { messageId: cleanText(result.messageId, 200) } : {}),
    };
  } catch (error) {
    const detail = emailFailureDetail(error);
    console.warn("gptmarketplus owner email delivery failed", { provider: "cloudflare_send_email", detail });
    return emailDeliveryResult({ provider: "cloudflare_send_email", code: "provider_error", detail });
  }
}

function combineEmailDeliveryFailures(results) {
  const attempts = results.map((result) => ({ provider: result.provider, code: result.code }));
  const providerFailure = results.find((result) => result.code === "provider_error" || result.code === "provider_misconfigured");
  return emailDeliveryResult({
    provider: providerFailure?.provider || "none",
    code: providerFailure?.code || "provider_not_configured",
    detail: providerFailure?.detail || "",
    attempts,
  });
}

async function googleOAuthGmailConnection(env) {
  if (!env.GMP_KV || !env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET || !env.GOOGLE_OAUTH_TOKEN_KEY) {
    return null;
  }
  const connection = await env.GMP_KV.get("google-oauth:gmail-connection", "json");
  if (
    !connection?.ciphertext
    || !connection?.iv
    || !Array.isArray(connection.scopes)
    || !connection.scopes.includes("https://www.googleapis.com/auth/gmail.send")
  ) {
    return null;
  }
  return connection;
}

async function decryptGoogleOAuthRefreshToken(env, connection) {
  const rawKey = base64UrlToBytes(env.GOOGLE_OAUTH_TOKEN_KEY || "");
  const iv = base64UrlToBytes(connection.iv || "");
  if (rawKey.byteLength !== 32 || iv.byteLength !== 12) throw new Error("invalid_google_oauth_encryption_record");
  const key = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    base64UrlToBytes(connection.ciphertext || ""),
  );
  return new TextDecoder().decode(plaintext);
}

async function gmailOAuthAccessToken(env, connection) {
  const refreshToken = await decryptGoogleOAuthRefreshToken(env, connection);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(`Google OAuth token refresh returned HTTP ${response.status}`);
  return String(payload.access_token);
}

function gmailRawMessage(env, recipient, subject, text, html, replyTo = "") {
  const sender = cleanEmail(env.GMAIL_SENDER_EMAIL || env.OWNER_NOTIFICATION_EMAIL || "");
  if (!sender) throw new Error("gmail_sender_not_configured");
  const boundary = `gptmarketplus-${bytesToBase64Url(crypto.getRandomValues(new Uint8Array(18)))}`;
  const wrapBase64 = (value) => textToBase64(value).replace(/.{1,76}/g, "$&\r\n").trimEnd();
  const headers = [
    `From: =?UTF-8?B?${textToBase64(brandName(env))}?= <${sender}>`,
    `To: ${recipient}`,
    `Subject: =?UTF-8?B?${textToBase64(cleanText(subject, 300))}?=`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
  ];
  const replyAddress = cleanEmail(replyTo);
  if (replyAddress) headers.push(`Reply-To: ${replyAddress}`);
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  return [
    ...headers,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(text),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

async function sendGmailOAuthEmail(env, recipient, subject, text, html, replyTo = "") {
  const to = cleanEmail(recipient);
  if (!to) return emailDeliveryResult({ provider: "gmail_oauth", code: "invalid_recipient" });
  try {
    const connection = await googleOAuthGmailConnection(env);
    if (!connection) return emailDeliveryResult({ provider: "gmail_oauth", code: "provider_not_configured" });
    const accessToken = await gmailOAuthAccessToken(env, connection);
    const raw = bytesToBase64Url(new TextEncoder().encode(gmailRawMessage(env, to, subject, text, html, replyTo)));
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.id) throw new Error(`Gmail send returned HTTP ${response.status}`);
    return {
      ...emailDeliveryResult({ delivered: true, provider: "gmail_oauth", code: "delivered" }),
      messageId: cleanText(payload.id, 160),
    };
  } catch (error) {
    const detail = emailFailureDetail(error);
    console.warn("gptmarketplus email delivery failed", { provider: "gmail_oauth", detail });
    return emailDeliveryResult({ provider: "gmail_oauth", code: "provider_error", detail });
  }
}

export async function sendOwnerTransactionalEmail(env, subject, text, html, replyTo = "") {
  const cloudflareResult = await sendCloudflareOwnerEmail(env, subject, text, html, replyTo);
  if (cloudflareResult.delivered) return cloudflareResult;

  const gmailResult = await sendGmailOAuthEmail(
    env,
    cleanEmail(env.OWNER_NOTIFICATION_EMAIL || ownerEmail(env)),
    subject,
    text,
    html,
    replyTo,
  );
  if (gmailResult.delivered) return gmailResult;

  const resendResult = await sendResendEmail(env, [ownerEmail(env)], subject, text, html, replyTo);
  if (resendResult.delivered) return resendResult;
  return combineEmailDeliveryFailures([cloudflareResult, gmailResult, resendResult]);
}

export async function sendCustomerTransactionalEmail(env, to, subject, text, html) {
  const recipient = cleanEmail(to);
  if (!recipient) return emailDeliveryResult({ code: "invalid_recipient" });
  const gmailResult = await sendGmailOAuthEmail(env, recipient, subject, text, html, "");
  if (gmailResult.delivered) return gmailResult;
  const resendResult = await sendResendEmail(env, [recipient], subject, text, html, "");
  if (resendResult.delivered) return resendResult;
  return combineEmailDeliveryFailures([gmailResult, resendResult]);
}

async function maybeSendOwnerEmail(env, subject, text, html, replyTo = "") {
  return sendOwnerTransactionalEmail(env, subject, text, html, replyTo);
}

async function maybeSendCustomerEmail(env, to, subject, text, html) {
  const result = await sendCustomerTransactionalEmail(env, to, subject, text, html);
  if (!result.delivered) {
    console.warn("gptmarketplus customer email not delivered", {
      provider: result.provider,
      code: result.code,
      detail: result.detail || "",
    });
  }
  return result;
}

async function sendResendEmail(env, recipients, subject, text, html, replyTo = "") {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  if (!apiKey) return emailDeliveryResult({ provider: "resend", code: "provider_not_configured" });
  const validRecipients = Array.isArray(recipients) ? recipients.map(cleanEmail).filter(Boolean) : [];
  if (!validRecipients.length) return emailDeliveryResult({ provider: "resend", code: "invalid_recipient" });
  const from = String(env.EMAIL_FROM || `GPTMarketPlus <${supportEmail(env)}>`).trim();
  const payload = {
    from,
    to: validRecipients,
    subject: cleanText(subject, 300),
    text: String(text || ""),
    html: String(html || ""),
  };
  const replyAddress = cleanEmail(replyTo);
  if (replyAddress) payload.reply_to = replyAddress;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Resend returned HTTP ${response.status}`);
    }
    return emailDeliveryResult({ delivered: true, provider: "resend", code: "delivered" });
  } catch (error) {
    const detail = emailFailureDetail(error);
    console.warn("gptmarketplus email delivery failed", { provider: "resend", detail });
    return emailDeliveryResult({ provider: "resend", code: "provider_error", detail });
  }
}

function buildOwnerLeadEmail(lead) {
  const subject = `HOT AI Services Lead from GPTMarketPlus`;
  const text = [
    `Name: ${lead.name || ""}`,
    `Business: ${lead.business_name || ""}`,
    `Phone: ${lead.phone || ""}`,
    `Email: ${lead.email || ""}`,
    `Pain point: ${lead.pain_point || ""}`,
    `Budget: ${lead.budget_range || ""}`,
    `Timeline: ${lead.timeline || ""}`,
    `Recommended package: ${lead.recommended_package || ""}`,
    `Lead score: ${lead.lead_score || 0}`,
    `Conversation summary: ${lead.transcript_summary || ""}`,
    `Suggested follow-up message: ${lead.next_action || ""}`,
  ].join("\n");
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#e5eef8;background:#06111d;padding:24px;border-radius:16px">
      <h2 style="margin-top:0;color:#8fd3ff">HOT AI Services Lead from GPTMarketPlus</h2>
      <p><strong>Name:</strong> ${escapeHtml(lead.name || "")}</p>
      <p><strong>Business:</strong> ${escapeHtml(lead.business_name || "")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(lead.phone || "")}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email || "")}</p>
      <p><strong>Pain point:</strong> ${escapeHtml(lead.pain_point || "")}</p>
      <p><strong>Budget:</strong> ${escapeHtml(lead.budget_range || "")}</p>
      <p><strong>Timeline:</strong> ${escapeHtml(lead.timeline || "")}</p>
      <p><strong>Recommended package:</strong> ${escapeHtml(lead.recommended_package || "")}</p>
      <p><strong>Lead score:</strong> ${escapeHtml(String(lead.lead_score || 0))}</p>
      <p><strong>Conversation summary:</strong> ${escapeHtml(lead.transcript_summary || "")}</p>
      <p><strong>Suggested follow-up message:</strong> ${escapeHtml(lead.next_action || "")}</p>
    </div>`;
  return { subject, text, html };
}

function buildPostPurchaseEmail(env, purchase) {
  const isDigital = purchase?.checkout_type === "digital_product";
  const destination = `${siteUrl(env)}${purchase?.onboarding_url || "/onboarding"}`;
  const subject = isDigital ? "Your AI Agent Launch Kit Is Ready" : "Your GPTMarketPlus Build Has Started";
  const text = isDigital
    ? `Thank you for your purchase. Your AI Agent Launch Kit is ready to download: ${destination}`
    : [
      "Thank you for your purchase.",
      "Your AI agent build has officially started.",
      `Complete onboarding so we can design the right AI agent for your business: ${destination}`,
      "Once we receive your answers, we will create your AI Agent Build Plan, map the workflow, and prepare the agent instructions.",
    ].join(" ");
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#e5eef8;background:#06111d;padding:24px;border-radius:16px">
      <h2 style="margin-top:0;color:#8fd3ff">${escapeHtml(subject)}</h2>
      <p>Thank you for your purchase.</p>
      ${isDigital
        ? `<p>Your AI Agent Launch Kit is ready.</p><p><a style="color:#8fd3ff" href="${escapeHtml(destination)}">Open your secure download</a></p>`
        : `<p>Your AI agent build has officially started.</p><p><a style="color:#8fd3ff" href="${escapeHtml(destination)}">Complete your onboarding form</a> so we can design the right AI agent for your business.</p><p>Once we receive your answers, we will create your AI Agent Build Plan, map the workflow, and prepare the agent instructions.</p>`}
  </div>`;
  return { subject, text, html };
}

function buildCustomerFollowUpEmail(env, lead) {
  const sequence = generateFollowUpSequence(lead, env);
  const first = sequence[0] || {
    subject: "We received your AI agent request",
    body: "Thanks for checking out GPTMarketPlus. The next step is a quick strategy call so we can map the best workflow.",
  };
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#e5eef8;background:#06111d;padding:24px;border-radius:16px">
      <h2 style="margin-top:0;color:#8fd3ff">${escapeHtml(first.subject)}</h2>
      <p>${escapeHtml(first.body)}</p>
    </div>`;
  return { subject: first.subject, text: first.body, html };
}

function leadQualificationQuestions() {
  return [
    "What type of business do you run?",
    "What are you trying to fix first: missed leads, slow follow-up, too many repetitive questions, scheduling, customer support, internal tasks, or something else?",
    "How soon do you want this working?",
    "Do you have a rough budget range in mind?",
    "What name, email, and phone number should we use for the build?",
  ];
}

function parseLeadStageFromMessage(text) {
  const haystack = String(text || "").toLowerCase();
  if (/book|schedule|call|consult/.test(haystack)) return "strategy_call_booked";
  if (/quote|proposal|estimate/.test(haystack)) return "proposal_sent";
  if (/deposit|paid|checkout|purchase/.test(haystack)) return "deposit_paid";
  if (/onboarding/.test(haystack)) return "onboarding_started";
  return "";
}

function buildLeadFlowSummary(lead) {
  return buildLeadSummary(lead);
}

function normalizeChatState(state = {}) {
  return {
    step: Number(state.step || 0),
    businessType: cleanText(state.businessType || "", 120),
    painPoint: cleanText(state.painPoint || "", 300),
    urgency: cleanText(state.urgency || "", 80),
    budgetRange: cleanText(state.budgetRange || "", 80),
    name: cleanText(state.name || "", 120),
    email: cleanEmail(state.email || ""),
    phone: cleanPhone(state.phone || ""),
    businessName: cleanText(state.businessName || "", 160),
    website: cleanUrl(state.website || ""),
    currentTools: cleanText(state.currentTools || "", 300),
    preferredContactMethod: cleanText(state.preferredContactMethod || "", 80),
    bestTimeToContact: cleanText(state.bestTimeToContact || "", 80),
    desiredAutomation: cleanText(state.desiredAutomation || "", 300),
    leadTag: cleanText(state.leadTag || "", 20),
    leadScore: Number(state.leadScore || 0),
    recommendedPackage: cleanText(state.recommendedPackage || "", 120),
    recommendedAgentType: cleanText(state.recommendedAgentType || "", 120),
    transcriptSummary: cleanText(state.transcriptSummary || "", 1000),
    fullTranscript: cleanText(state.fullTranscript || "", 12000),
    nextAction: cleanText(state.nextAction || "", 300),
    contactConsent: Boolean(state.contactConsent),
    marketingConsent: Boolean(state.marketingConsent),
    conversationComplete: Boolean(state.conversationComplete),
    leadId: cleanText(state.leadId || "", 120),
    crmStage: cleanText(state.crmStage || "", 80),
    commonObjection: cleanText(state.commonObjection || "", 80),
    sourcePage: cleanText(state.sourcePage || "/", 200),
  };
}

function classifyUrgency(text) {
  const haystack = String(text || "").toLowerCase();
  if (/immediately|asap|right away|today/.test(haystack)) return "Immediately";
  if (/this week|week/.test(haystack)) return "This week";
  if (/this month|month/.test(haystack)) return "This month";
  return "Just researching";
}

function classifyBudget(text) {
  const haystack = String(text || "").toLowerCase();
  if (/under\s*\$?500|<\s*\$?500|budget.*500/.test(haystack)) return "Under $500";
  if (/500[-–]\s*1,?500|500\s*to\s*1,?500/.test(haystack)) return "$500-$1,500";
  if (/1,?500[-–]\s*3,?500|1,?500\s*to\s*3,?500/.test(haystack)) return "$1,500-$3,500";
  if (/3,?500\+|above\s*3,?500|over\s*3,?500/.test(haystack)) return "$3,500+";
  return "Not sure yet";
}

function detectContactDetails(text) {
  const body = String(text || "");
  const email = body.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/)?.[1] || "";
  const phone = body.match(/(\+?\d[\d(). -]{7,}\d)/)?.[1] || "";
  const website = body.match(/https?:\/\/[^\s]+|(?:www\.)[^\s]+/i)?.[0] || "";
  return {
    email: cleanEmail(email),
    phone: cleanPhone(phone),
    website: cleanUrl(website),
  };
}

function leadScoreLabel(score) {
  return leadTagFromScore(score);
}

function buildChatSummary(lead) {
  return [
    `${lead.leadTag || "COLD"} LEAD`,
    lead.businessType || "business type not provided",
    lead.painPoint || "pain point not provided",
    lead.budgetRange || "budget not provided",
    lead.timeline || "timeline not provided",
    `recommended ${lead.recommendedPackage || "Starter Agent"}`,
  ].join(" | ");
}

function chatQuickReplies(state) {
  const replies = [];
  if (!state.businessType) {
    replies.push({ label: "Local service business", value: "Local service business" });
    replies.push({ label: "Contractor", value: "Contractor" });
    replies.push({ label: "Agency", value: "Agency" });
  } else if (!state.painPoint) {
    replies.push({ label: "Missed leads", value: "missed leads" });
    replies.push({ label: "Too many questions", value: "too many repetitive questions" });
    replies.push({ label: "Scheduling", value: "scheduling" });
  } else if (!state.urgency) {
    replies.push({ label: "Immediately", value: "immediately" });
    replies.push({ label: "This week", value: "this week" });
    replies.push({ label: "This month", value: "this month" });
    replies.push({ label: "Just researching", value: "just researching" });
  } else if (!state.budgetRange) {
    replies.push({ label: "Under $500", value: "under $500" });
    replies.push({ label: "$500-$1,500", value: "$500-$1,500" });
    replies.push({ label: "$1,500-$3,500", value: "$1,500-$3,500" });
    replies.push({ label: "$3,500+", value: "$3,500+" });
  } else {
    replies.push({ label: "Book My Free AI Strategy Call", value: "book my free ai strategy call" });
    replies.push({ label: "Request a Custom Quote", value: "request a custom quote" });
    replies.push({ label: "Start With a Basic Website Agent", value: "start with a basic website agent" });
    replies.push({ label: "Build My Business Automation System", value: "build my business automation system" });
  }
  return replies;
}

function replyForObjection(message) {
  const haystack = String(message || "").toLowerCase();
  return CHAT_OBJECTIONS.find((item) => item.match.some((needle) => haystack.includes(needle))) || null;
}

function hotLeadMessage() {
  return "Based on your answers, you’re a strong fit for a custom AI agent system. The best next step is to book a free strategy call so we can map the exact workflow and quote it correctly.";
}

function warmLeadMessage(packageName) {
  return `You look like a strong fit for ${packageName}. I can send you the AI Automation Audit Checklist and a quote path, or you can book a free strategy call to go one level deeper.`;
}

function coldLeadMessage() {
  return "That’s fine. I can keep this practical and simply send the AI Automation Audit Checklist so you can see what might be worth automating first.";
}

async function handleChat(request, env, ctx) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const limit = await rateLimit(env, request, "chat");
  if (!limit.ok) {
    return jsonResponse({ ok: false, error: "Rate limited.", retryAfter: limit.retryAfter }, 429);
  }

  const conversationId = cleanText(body.conversationId || "", 120) || crypto.randomUUID();
  const sourcePage = cleanText(body.sourcePage || "/", 200) || "/";
  const message = cleanText(body.message || "", 2000);
  const incomingState = normalizeChatState(body.state || {});
  const transcript = Array.isArray(incomingState.messages)
    ? incomingState.messages.slice()
    : [];
  const currentLead = (await dbGetLeadByConversation(env, conversationId)) || {};
  const objection = replyForObjection(message);
  const contactDetails = detectContactDetails(message);

  const state = normalizeChatState({
    ...currentLead,
    ...incomingState,
    sourcePage,
    conversationId,
  });

  state.fullTranscript = [
    ...(state.fullTranscript ? [state.fullTranscript] : []),
    `Visitor: ${message}`,
  ].join("\n");

  const googleGroundedAnswer = await answerFromAgentIdKnowledge(env, message).catch(() => null);
  const groundedAnswer = googleGroundedAnswer
    || await answerFromCloudflareKnowledge(env, message).catch(() => null);
  if (groundedAnswer) {
    state.fullTranscript = [
      state.fullTranscript,
      `GPTMarketPlus grounded answer: ${groundedAnswer.answer}`,
    ].filter(Boolean).join("\n");
    const eventPromise = dbInsertEvent(env, {
      event_name: "genai_grounded_answer",
      source_page: sourcePage,
      conversation_id: conversationId,
      properties_json: {
        sourceCount: groundedAnswer.sources.length,
        groundingScore: groundedAnswer.groundingScore,
        provider: groundedAnswer.provider,
      },
      user_agent: request.headers.get("user-agent") || "",
    }).catch(() => null);
    if (ctx?.waitUntil) ctx.waitUntil(eventPromise);
    else await eventPromise;
    return jsonResponse({
      ok: true,
      conversationId,
      reply: groundedAnswer.answer,
      state,
      grounded: true,
      groundingProvider: groundedAnswer.provider,
      sources: groundedAnswer.sources,
      quickReplies: groundedAnswer.relatedQuestions.map((question) => ({
        label: question,
        value: question,
      })),
      cta: {
        label: "View GPTMarketPlus Pricing",
        href: "/pricing",
      },
    });
  }

  let reply = "";
  let quickReplies = [];
  let nextAction = "";
  let cta = {
    label: "Book My Free AI Strategy Call",
    href: "/book-a-consultation",
  };

  if (!state.businessType) {
    state.businessType = message;
    state.step = 1;
    reply = "What are you trying to fix first: missed leads, slow follow-up, too many repetitive questions, scheduling, customer support, internal tasks, or something else?";
  } else if (!state.painPoint) {
    state.painPoint = message;
    state.desiredAutomation = message;
    state.step = 2;
    reply = "How soon do you want this working?";
    quickReplies = [
      { label: "Immediately", value: "Immediately" },
      { label: "This week", value: "This week" },
      { label: "This month", value: "This month" },
      { label: "Just researching", value: "Just researching" },
    ];
  } else if (!state.urgency) {
    state.urgency = classifyUrgency(message);
    state.timeline = state.urgency;
    state.step = 3;
    reply = "Do you have a rough budget range in mind?";
    quickReplies = [
      { label: "Under $500", value: "Under $500" },
      { label: "$500-$1,500", value: "$500-$1,500" },
      { label: "$1,500-$3,500", value: "$1,500-$3,500" },
      { label: "$3,500+", value: "$3,500+" },
      { label: "Not sure yet", value: "Not sure yet" },
    ];
  } else if (!state.budgetRange) {
    state.budgetRange = classifyBudget(message);
    state.step = 4;
    reply = "What name, email, and phone number should we use for the build? If you have a website, include that too.";
    quickReplies = [];
  } else {
    const contact = detectContactDetails(message);
    state.name = state.name || cleanText(body.name || "", 120) || "";
    state.email = state.email || contact.email || cleanEmail(body.email || "");
    state.phone = state.phone || contact.phone || cleanPhone(body.phone || "");
    state.businessName = state.businessName || cleanText(body.businessName || "", 160);
    state.website = state.website || contact.website || cleanUrl(body.website || "");
    state.currentTools = state.currentTools || cleanText(body.currentTools || "", 300);
    state.preferredContactMethod = state.preferredContactMethod || cleanText(body.preferredContactMethod || "email", 80);
    state.bestTimeToContact = state.bestTimeToContact || cleanText(body.bestTimeToContact || "", 80);
    state.contactConsent = body.contactConsent === true || body.contactConsent === "1" || body.contactConsent === 1;
    state.marketingConsent = body.marketingConsent === true || body.marketingConsent === "1" || body.marketingConsent === 1;
    state.step = 5;

    const recommendedPackage = packageBySignals(state);
    const recommendedAgent = recommendedAgentForBusinessType(state.businessType);
    const score = scoreLead(state);
    const leadTag = leadScoreLabel(score);
    state.leadScore = score;
    state.leadTag = leadTag;
    state.recommendedPackage = recommendedPackage;
    state.recommendedAgentType = recommendedAgent.agentType || "Website Sales Agent";
    state.transcriptSummary = buildChatSummary({
      leadTag,
      businessType: state.businessType,
      painPoint: state.painPoint,
      budgetRange: state.budgetRange,
      timeline: state.timeline,
      recommendedPackage,
    });
    state.nextAction = leadTag === "HOT" ? hotLeadMessage() : leadTag === "WARM" ? warmLeadMessage(recommendedPackage) : coldLeadMessage();
    state.crmStage = leadTag === "HOT" ? "qualified" : leadTag === "WARM" ? "follow_up_needed" : "new_lead";

    reply = objection
      ? `${objection.reply} ${state.leadTag === "HOT" ? hotLeadMessage() : state.leadTag === "WARM" ? warmLeadMessage(recommendedPackage) : coldLeadMessage()}`
      : state.leadTag === "HOT"
        ? hotLeadMessage()
        : state.leadTag === "WARM"
          ? warmLeadMessage(recommendedPackage)
          : coldLeadMessage();

    const hasContact = Boolean(state.email || state.phone);
    const qualifiedLead = {
      conversation_id: conversationId,
      source_page: sourcePage,
      crm_stage: state.crmStage,
      lead_status: state.leadTag,
      lead_score: state.leadScore,
      name: state.name,
      email: state.email,
      phone: state.phone,
      business_name: state.businessName,
      website: state.website,
      business_type: state.businessType,
      pain_point: state.painPoint,
      desired_automation: state.desiredAutomation,
      automation_theme: leadTheme(state.desiredAutomation || state.painPoint),
      current_tools: state.currentTools,
      common_objection: objectionTag(message) || state.commonObjection || "",
      recommended_agent_type: state.recommendedAgentType,
      recommended_package: state.recommendedPackage,
      budget_range: state.budgetRange,
      timeline: state.timeline,
      preferred_contact_method: state.preferredContactMethod,
      best_time_to_contact: state.bestTimeToContact,
      transcript_summary: state.transcriptSummary,
      full_transcript: state.fullTranscript,
      next_action: state.nextAction,
      follow_up_status: "queued",
      contact_consent: hasContact,
      marketing_consent: state.marketingConsent,
      booked_call: /book/.test((message || "").toLowerCase()) ? 1 : 0,
      quote_requested: /quote|estimate|proposal/.test((message || "").toLowerCase()) ? 1 : 0,
      purchase_intent: /deposit|purchase|buy/.test((message || "").toLowerCase()) ? "purchase" : "",
      dashboard_token: currentLead.dashboard_token || crypto.randomUUID().replace(/-/g, ""),
      id: currentLead.id || crypto.randomUUID(),
      notes: objection ? objection.reply : "",
    };

    const savedLead = await dbUpsertLead(env, qualifiedLead);
    state.leadId = savedLead.id;
    state.dashboardToken = savedLead.dashboard_token || state.dashboardToken || crypto.randomUUID().replace(/-/g, "");
    if (leadTag === "HOT") {
      cta = { label: "Book My Free AI Strategy Call", href: "/book-a-consultation" };
    } else if (leadTag === "WARM") {
      cta = { label: "Get My AI Agent Recommendation", href: "/contact" };
    } else {
      cta = { label: "Get the Free Checklist", href: "/free-ai-automation-audit-checklist" };
    }

    const followUps = generateFollowUpSequence({
      ...savedLead,
      recommendedPackage,
      leadTag,
    }, env);
    await dbInsertFollowups(env, savedLead.id, followUps);

    if (leadTag === "HOT") {
      const alert = buildOwnerLeadEmail(savedLead);
      ctx && ctx.waitUntil && ctx.waitUntil(sendWebhook(env, "hot_lead", { ...savedLead, summary: state.transcriptSummary }));
      ctx && ctx.waitUntil && ctx.waitUntil(maybeSendOwnerEmail(env, alert.subject, alert.text, alert.html, savedLead.email || ""));
    } else if (savedLead.email && state.marketingConsent) {
      const template = buildCustomerFollowUpEmail(env, savedLead);
      ctx && ctx.waitUntil && ctx.waitUntil(maybeSendCustomerEmail(env, savedLead.email, template.subject, template.text, template.html));
    }

    await dbInsertEvent(env, {
      event_name: "chat_complete",
      source_page: sourcePage,
      conversation_id: conversationId,
      lead_id: savedLead.id,
      properties_json: {
        leadTag,
        recommendedPackage,
        recommendedAgentType: state.recommendedAgentType,
      },
      user_agent: request.headers.get("user-agent") || "",
    });

    quickReplies = chatQuickReplies(state);
    if (leadTag === "HOT") {
      nextAction = "The best next step is to book a free strategy call.";
    } else if (leadTag === "WARM") {
      nextAction = "You can request a quote or grab the AI Automation Audit Checklist.";
    } else {
      nextAction = "Start with the checklist and see which workflow is worth automating first.";
    }
    state.nextAction = nextAction;
    state.conversationComplete = true;
    reply = `${reply} ${nextAction}`;

    return jsonResponse({
      ok: true,
      conversationId,
      reply,
      state,
      leadCaptured: Boolean(state.email || state.phone),
      leadTag,
      leadScore: score,
      recommendedPackage,
      recommendedAgentType: state.recommendedAgentType,
      summary: state.transcriptSummary,
      cta,
      quickReplies,
      nextAction,
    });
  }

  state.leadScore = scoreLead(state);
  state.leadTag = leadScoreLabel(state.leadScore);
  state.recommendedPackage = packageBySignals(state);
  state.recommendedAgentType = recommendedAgentForBusinessType(state.businessType).agentType;
  state.desiredAutomation = state.desiredAutomation || state.painPoint || "";
  state.transcriptSummary = buildChatSummary({
    leadTag: state.leadTag,
    businessType: state.businessType,
    painPoint: state.painPoint,
    budgetRange: state.budgetRange,
    timeline: state.timeline,
    recommendedPackage: state.recommendedPackage,
  });
  quickReplies = chatQuickReplies(state);
  const partialLead = {
    id: currentLead.id || state.leadId || crypto.randomUUID(),
    conversation_id: conversationId,
    source_page: sourcePage,
    crm_stage: state.crmStage || defaultLeadStage(state.leadTag),
    lead_status: state.leadTag,
    lead_score: state.leadScore,
    name: state.name || "",
    email: state.email || "",
    phone: state.phone || "",
    business_name: state.businessName || "",
    website: state.website || "",
    business_type: state.businessType || "",
    pain_point: state.painPoint || "",
    desired_automation: state.desiredAutomation || state.painPoint || "",
    automation_theme: leadTheme(state.desiredAutomation || state.painPoint || ""),
    current_tools: state.currentTools || "",
    common_objection: state.commonObjection || "",
    recommended_agent_type: state.recommendedAgentType || "",
    recommended_package: state.recommendedPackage || "",
    budget_range: state.budgetRange || "",
    timeline: state.timeline || "",
    preferred_contact_method: state.preferredContactMethod || "",
    best_time_to_contact: state.bestTimeToContact || "",
    transcript_summary: state.transcriptSummary || "",
    full_transcript: state.fullTranscript || "",
    next_action: state.nextAction || "",
    follow_up_status: "queued",
    contact_consent: Boolean(state.email || state.phone),
    marketing_consent: state.marketingConsent,
    booked_call: 0,
    quote_requested: 0,
    purchase_intent: "",
    dashboard_token: currentLead.dashboard_token || state.dashboardToken || crypto.randomUUID().replace(/-/g, ""),
    notes: state.nextAction || "",
  };
  const savedLead = await dbUpsertLead(env, partialLead);
  state.leadId = savedLead.id;
  state.dashboardToken = savedLead.dashboard_token;

  return jsonResponse({
    ok: true,
    conversationId,
    reply,
    state,
    leadCaptured: Boolean(state.email || state.phone),
    leadTag: state.leadTag,
    leadScore: state.leadScore,
    recommendedPackage: state.recommendedPackage,
    recommendedAgentType: state.recommendedAgentType,
    summary: state.transcriptSummary,
    cta,
    quickReplies,
    nextAction,
  });
}

function renderHomePage(env, state) {
  const body = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">GPTMarketPlus</p>
        <h1>Custom AI Agents That Help Your Business Sell, Respond, and Operate Faster</h1>
        <p class="hero-lede">Turn missed leads, slow follow-up, repetitive customer questions, and manual admin into one AI workflow your business can use every day.</p>
        <div class="cta-row">
          <a class="button-primary" href="/book-a-consultation" data-track-event="cta_click" data-track-label="Book a Free AI Strategy Call">Book a Free AI Strategy Call</a>
          <a class="button-secondary" href="/pricing" data-track-event="cta_click" data-track-label="See Plans and Pricing">See Plans &amp; Pricing</a>
        </div>
        <p class="trust-line">Plans start at $497. Built for small businesses, service companies, agencies, and operations teams that need practical AI systems - not confusing tech.</p>
        <ul class="benefit-list">
          <li>Capture leads 24/7</li>
          <li>Automate follow-up</li>
          <li>Answer customer questions</li>
          <li>Route requests to the right person</li>
          <li>Organize tasks and workflows</li>
          <li>Reduce repetitive admin work</li>
        </ul>
      </div>
      ${renderHeroVisual()}
    </section>

    <div class="ownership-strip" aria-label="GPTMarketPlus platform advantages">
      <span>First-party sales tool</span>
      <span>No platform lock-in</span>
      <span>Secure checkout</span>
      <span>Automated delivery</span>
    </div>

    ${renderOpportunityScannerBootstrap()}

    <section class="section split-section">
      <div>
        ${renderSectionTitle("The problem", "Your business is losing time and leads to manual work", "Most businesses do not need more apps. They need systems that respond, organize, follow up, and move work forward automatically.")}
      </div>
      <div class="copy-stack">
        <p>Missed calls and slow replies. Leads that never get followed up. Repetitive questions from customers. Manual scheduling. Disorganized work requests. Staff wasting time on repeat admin tasks. No clear sales funnel from website visitors. No automation between forms, emails, CRM, calendar, and staff tasks.</p>
      </div>
    </section>

    <section class="section split-section">
      <div>
        ${renderSectionTitle("The solution", "GPTMarketPlus builds AI agents that work inside your business", "AI agents can answer common questions, qualify leads, collect customer details, send summaries to staff, create tasks, draft replies, follow up automatically, and connect with your existing tools.")}
      </div>
      <div class="feature-rack">
        <article class="feature-card"><strong>Answer</strong><span>Common customer questions quickly.</span></article>
        <article class="feature-card"><strong>Qualify</strong><span>Collect the details that matter.</span></article>
        <article class="feature-card"><strong>Schedule</strong><span>Move leads toward a booking.</span></article>
        <article class="feature-card"><strong>Follow Up</strong><span>Keep the lead from going cold.</span></article>
        <article class="feature-card"><strong>Organize</strong><span>Structure internal tasks and updates.</span></article>
        <article class="feature-card"><strong>Report</strong><span>Summaries for the owner or team.</span></article>
        <article class="feature-card"><strong>Sell</strong><span>Recommend the next step ethically.</span></article>
        <article class="feature-card"><strong>Support</strong><span>Reduce repetitive admin work.</span></article>
      </div>
    </section>

    <section class="section split-section">
      <div>
        ${renderSectionTitle("How it works", "A simple delivery process that keeps the build real", "")}
      </div>
      <div class="timeline">
        <div><strong>1. Audit your workflow</strong><span>We map the business problem first.</span></div>
        <div><strong>2. Design your AI agent</strong><span>We choose the right workflow and package.</span></div>
        <div><strong>3. Build and connect it</strong><span>We wire the site, forms, and tools.</span></div>
        <div><strong>4. Test and train it</strong><span>We verify the logic and handoff rules.</span></div>
        <div><strong>5. Launch and improve it</strong><span>We ship, monitor, and refine the system.</span></div>
      </div>
    </section>

    <section class="section">
      ${renderSectionTitle("Built for real business workflows", "Websites, forms, email, calendars, CRMs, spreadsheets, task boards, internal documents, and customer service scripts", "")}
      ${renderCardGrid([
        { kicker: "Front-end", title: "Website and landing pages", description: "Capture visitors with a clear call to action and a trained agent." },
        { kicker: "Communication", title: "Email and follow-up", description: "Keep leads moving without manual chasing." },
        { kicker: "Operations", title: "Calendars and task boards", description: "Turn requests into scheduled work and trackable tasks." },
        { kicker: "Data", title: "CRMs and spreadsheets", description: "Structured summaries and clean handoff data." },
      ])}
    </section>

    <section class="section">
      ${renderSectionTitle("Why businesses choose GPTMarketPlus", "Practical implementation. Clear pricing. Custom workflows.", "")}
      ${renderCardGrid([
        { title: "Practical implementation", description: "We build for the real workflow, not a demo.", kicker: "" },
        { title: "Clear pricing", description: "Starting prices are visible and easy to understand.", kicker: "" },
        { title: "Custom workflows", description: "The agent matches the business and the customer journey.", kicker: "" },
        { title: "Sales-focused design", description: "Every page and chat flow moves toward a next action.", kicker: "" },
        { title: "Ongoing support", description: "Managed plans are available when the build needs maintenance.", kicker: "" },
        { title: "Built for small business owners", description: "Simple language, useful prompts, and clear handoff steps.", kicker: "" },
      ])}
    </section>

    <section class="section">
      ${renderSectionTitle("Plan before you automate", "Free tools and practical AI agent guides", "Use the calculator, buyer guides, and templates to choose a workflow with a real owner, measurable value, and a safe human handoff.")}
      ${renderCardGrid([
        { kicker: "Free tool", title: "AI Automation ROI Calculator", description: "Estimate time savings, recovered contribution, cost, payback, and first-year ROI without treating gross sales as profit.", href: "/tools/ai-automation-roi-calculator" },
        { kicker: "Buyer guide", title: "AI Agents for Small Business", description: "Choose the right first workflow and avoid paying for a demo that never becomes useful.", href: "/guides/ai-agent-for-small-business" },
        { kicker: "Comparison", title: "AI Agent vs. Chatbot", description: "Understand when a chatbot is enough and when tool-connected action is worth the added complexity.", href: "/compare/ai-agent-vs-chatbot" },
        { kicker: "$29 download", title: "AI Agent Launch Kit", description: "Get the planning workbook, prompt pack, intake templates, launch checklist, and 30-day scorecard.", href: "/ai-agent-launch-kit" },
      ], "Open resource")}
    </section>

    <section class="section split-section final-cta">
      <div>
        ${renderSectionTitle("Ready to build your first AI agent?", "Book your free strategy call", "We’ll look at your business, identify what can be automated, and recommend the best AI agent setup.")}
      </div>
      <div class="cta-box">
        <a class="button-primary" href="/book-a-consultation" data-track-event="cta_click" data-track-label="Book Your Free Strategy Call">Book Your Free Strategy Call</a>
      </div>
    </section>
  `;

  return renderShell(env, {
    path: "/",
    title: "Custom AI Agents Built to Help Your Business Sell, Respond, and Operate Faster",
    description: "GPTMarketPlus builds AI-powered assistants, automation systems, and lead-capture tools that handle repetitive work, improve response time, and help businesses turn more visitors into customers.",
    body,
    schema: [
      organizationSchema(env),
      professionalServiceSchema(env, "AI agent services"),
      contactPointSchema(env),
    ],
    bodyClass: "page-home",
  });
}

function renderServicesPage(env) {
  const body = `
    <section class="page-hero">
      ${renderPageTitle("Services", "AI services that solve real business work", "Custom agent builds, automation setup, website AI assistants, and ongoing management.")}
    </section>
    <section class="section">
      ${renderCardGrid(SERVICE_CARDS.map((item) => ({
        kicker: "Service",
        title: item.title,
        description: item.description,
        href: "/contact",
      })), "Request this service")}
    </section>
  `;
  return renderShell(env, {
    path: "/services",
    title: "Services",
    description: "Custom AI agent services, workflow automation, and AI website buildout.",
    body,
    schema: [organizationSchema(env), serviceSchema(env, "AI agent services", "Custom AI agent services, workflow automation, and AI website buildout.", "/services")],
    bodyClass: "page-services",
  });
}

function renderAgentsPage(env) {
  const body = `
    <section class="page-hero">
      ${renderPageTitle("AI Agents", "Choose the bottleneck you want an AI agent to remove", "Start with missed leads, slow follow-up, scheduling, customer questions, CRM handoff, or repetitive operations work.")}
      <div class="cta-row">
        <a class="button-primary" href="/pricing" data-track-event="cta_click" data-track-label="Compare AI Agent Plans">Compare plans &amp; pricing</a>
        <button class="button-secondary" type="button" data-open-agent-chat>Ask which agent fits</button>
      </div>
      <div class="selector-card">
        <label><span>Business type</span>
          <select id="business-type-select">
            ${businessTypeCatalog().map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
          </select>
        </label>
        <div class="selector-result" id="agent-recommendation">
          <strong>Recommended agent</strong>
          <p>Choose a business type to see the best fit.</p>
        </div>
      </div>
    </section>
    <section class="section">
      ${renderCardGrid(AGENT_TYPES.map((agent) => ({
        kicker: "Agent type",
        title: agent.title,
        description: `${agent.whatItDoes} ${agent.whoItIsFor} ${agent.benefit}`,
        href: `/contact?agent=${encodeURIComponent(agent.slug)}`,
      })), "Request this agent")}
    </section>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const select = document.getElementById("business-type-select");
        const target = document.getElementById("agent-recommendation");
        function update() {
          const value = String(select.value || "").toLowerCase();
          const mapping = ${JSON.stringify(BUSINESS_RECOMMENDATIONS)};
          const match = mapping.find((item) => value.includes(item.match));
          const agentType = match ? match.agentType : "Website Sales Agent";
          const packageName = match ? match.package : "Starter Agent";
          target.innerHTML = "<strong>Recommended agent</strong><p>" + agentType + " with the " + packageName + " package.</p>";
          if (window.agentidTrackEvent) {
            window.agentidTrackEvent("package_recommendation", { businessType: select.value, agentType, packageName });
          }
        }
        select.addEventListener("change", update);
        update();
      });
    </script>
  `;
  return renderShell(env, {
    path: "/ai-agents",
    title: "AI Agents",
    description: "The agent types GPTMarketPlus can build for your business.",
    body,
    schema: [organizationSchema(env), serviceSchema(env, "AI agent builds", "The agent types GPTMarketPlus can build for your business.", "/ai-agents")],
    bodyClass: "page-agents",
  });
}

function renderPricingPage(env) {
  const checkoutReady = fullCheckoutReady(env);
  const paypalReady = paypalCheckoutReady(env);
  const makeCheckoutForm = (product) => `
    <form class="checkout-form" data-agentid-form="1" data-endpoint="/api/checkout">
      <input type="hidden" name="productId" value="${escapeHtml(product.id)}">
      <input type="hidden" name="sourcePage" value="/pricing">
      <button class="button-primary" type="submit">${escapeHtml(product.cta || "Start now")}</button>
      <p class="form-status"></p>
    </form>`;
  const makePayPalOrderForm = (product, cta = "Pay with PayPal") => `
    <form class="checkout-form paypal-checkout-form" data-agentid-form="1" data-endpoint="/api/paypal/orders/create">
      <input type="hidden" name="productId" value="${escapeHtml(product.id)}">
      <input type="hidden" name="sourcePage" value="/pricing">
      <button class="button-secondary" type="submit">${escapeHtml(cta)}</button>
      <p class="form-status"></p>
    </form>`;
  const makePayPalForm = (product) => `
    <form class="checkout-form paypal-checkout-form" data-agentid-form="1" data-endpoint="/api/paypal/subscriptions/create">
      <input type="hidden" name="packageId" value="${escapeHtml(product.id)}">
      <input type="hidden" name="sourcePage" value="/pricing">
      <button class="button-secondary" type="submit">Subscribe with PayPal</button>
      <p class="form-status"></p>
    </form>`;

  const body = `
    <section class="page-hero">
      ${renderPageTitle("Pricing", "Choose the AI agent system that matches your next bottleneck", "Start with lead capture, add follow-up and integrations, or automate work across multiple teams.")}
      <p class="pricing-note">Final pricing depends on complexity, integrations, data sources, and compliance requirements.</p>
      <div class="cta-row">
        <button class="button-primary" type="button" data-open-agent-chat data-track-event="pricing_assistant_click" data-track-label="Ask the Pricing Assistant">Not sure? Ask the pricing assistant</button>
        <a class="button-secondary" href="/book-a-consultation" data-track-event="cta_click" data-track-label="Book a Free Strategy Call">Book a free strategy call</a>
      </div>
    </section>
    <section class="section pricing-grid">
      ${PRICING_TIERS.map((tier) => `
        <article class="price-card">
          <p class="card-kicker">${escapeHtml(tier.name)}</p>
          <strong>${escapeHtml(packagePriceLabel(tier.name))}</strong>
          <p>${escapeHtml(tier.summary)}</p>
          <ul>${tier.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <div class="checkout-stack">
            <a class="button-secondary" href="/contact?package=${encodeURIComponent(tier.id)}">Request a scoped quote</a>
          </div>
        </article>
      `).join("")}
    </section>
    <section class="section support-grid">
      ${MONTHLY_SUPPORT.map((plan) => `
        <article class="support-card">
          <p class="card-kicker">Support plan</p>
          <strong>Starting at ${moneyWithCents(plan.price)}</strong>
          <p>${escapeHtml(plan.name)}</p>
          <span>${escapeHtml(plan.summary)}</span>
          <a class="button-secondary" href="/contact">Discuss support</a>
        </article>
      `).join("")}
    </section>
    <section class="section">
      ${renderSectionTitle(
        "Advertise with GPTMarketPlus",
        "Apply for reviewed 30-day sponsor inventory",
        "Reach visitors researching AI agents, automation, business software, and implementation services. Sponsor applications are reviewed before billing or placement."
      )}
      <div class="support-grid sponsor-pricing-grid">
        ${SPONSOR_SUBSCRIPTIONS.map((plan) => `
          <article class="support-card sponsor-price-card">
            <p class="card-kicker">${escapeHtml(plan.placement)}</p>
            <strong>${moneyWithCents(plan.price)} / 30 days</strong>
            <p>${escapeHtml(plan.name)}</p>
            <span>${escapeHtml(plan.summary)}</span>
            <div class="checkout-stack">
              <a class="button-secondary" href="/advertise?package=${encodeURIComponent(plan.id)}">Apply for placement</a>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="cta-row">
        <a class="button-secondary" href="/advertise" data-track-event="advertiser_interest" data-track-label="View Advertising Details">View advertising details</a>
        <a class="button-secondary" href="/ad-network" data-track-event="advertiser_interest" data-track-label="View Ad Inventory">View all ad inventory</a>
      </div>
    </section>
    <section class="section deposit-grid">
      ${DEPOSITS.map((deposit) => `
        <article class="support-card">
          <p class="card-kicker">${escapeHtml(deposit.name)}</p>
          <strong>${moneyWithCents(deposit.price)}</strong>
          <span>Secure your build slot with a deposit. Final scope and pricing will be confirmed after your strategy call.</span>
          <div class="checkout-stack">
            <a class="button-secondary" href="/book-a-consultation">Confirm scope before paying</a>
          </div>
        </article>
      `).join("")}
    </section>
    <section class="section split-section product-offer">
      <div>
        ${renderSectionTitle("Start smaller", "Get the AI Agent Launch Kit for $29", "Plan the workflow, guardrails, knowledge intake, follow-up, testing, and first 30 days before you commit to a custom build.")}
        <ul class="benefit-list compact">
          ${DIGITAL_PRODUCTS[0].includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <div class="cta-box">
        <strong>${moneyWithCents(DIGITAL_PRODUCTS[0].price)} one-time</strong>
        <p>Secure download after payment confirmation.</p>
        <div class="checkout-stack">
          ${paypalReady ? makePayPalOrderForm(DIGITAL_PRODUCTS[0], "Buy with PayPal") : ""}
          ${checkoutReady ? makeCheckoutForm({ id: DIGITAL_PRODUCTS[0].id, cta: "Buy with card" }) : ""}
          ${!paypalReady && !checkoutReady ? `<a class="button-primary" href="/contact">Request the launch kit</a>` : ""}
        </div>
        <a class="button-secondary" href="/ai-agent-launch-kit">See everything included</a>
      </div>
    </section>
  `;

  return renderShell(env, {
    path: "/pricing",
    title: "Pricing",
    description: "Starter, Growth, and Business Automation pricing tiers with deposit options.",
    body,
    schema: [organizationSchema(env), serviceSchema(env, "AI agent pricing", "Starter, Growth, and Business Automation pricing tiers with deposit options.", "/pricing")],
    bodyClass: "page-pricing",
  });
}

function renderUseCasesPage(env) {
  const body = `
    <section class="page-hero">
      ${renderPageTitle("Use Cases", "Realistic AI workflows for common business problems", "No fake case studies. Just realistic ways the system can work.")}
    </section>
    <section class="section">
      ${renderCardGrid(USE_CASES.map((item) => ({
        kicker: "Use case",
        title: item.title,
        description: item.description,
      })))}
    </section>
  `;
  return renderShell(env, {
    path: "/use-cases",
    title: "Use Cases",
    description: "Realistic use cases for contractors, real estate, facilities, medical offices, and agencies.",
    body,
    schema: [organizationSchema(env), serviceSchema(env, "AI agent use cases", "Realistic use cases for contractors, real estate, facilities, medical offices, and agencies.", "/use-cases")],
    bodyClass: "page-use-cases",
  });
}

function resourceLinkTitle(path) {
  if (path === "/pricing") return "Pricing";
  if (path === "/contact") return "Request an AI Agent Plan";
  if (path === "/book-a-consultation") return "Book a Free Strategy Call";
  if (path === "/ai-agents") return "Explore AI Agent Types";
  if (path === "/use-cases") return "AI Agent Use Cases";
  if (path === "/tools/ai-automation-roi-calculator") return "AI Automation ROI Calculator";
  if (path === "/ai-agent-launch-kit") return "AI Agent Launch Kit";
  if (path === "/small-business-crm-automation") return "Small Business CRM Automation";
  if (path === "/ai-receptionist-software") return "AI Receptionist Software Comparison";
  if (path === "/ai-marketing-automation") return "AI Marketing Automation for Small Business";
  if (path === "/ai-sales-funnel") return "AI Sales Funnel Automation";
  return RESOURCE_PAGES.find((page) => page.path === path)?.title || toTitle(path.split("/").filter(Boolean).pop() || path);
}

function renderResourcesPage(env) {
  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("Resource center", "Make a better AI automation decision", "Use original guides, practical templates, and a client-side ROI calculator to choose a narrow workflow, set safe boundaries, and measure whether it works.")}
        <div class="cta-row">
          <a class="button-primary" href="/tools/ai-automation-roi-calculator" data-track-event="resource_click" data-track-label="Open ROI Calculator">Calculate potential value</a>
          <a class="button-secondary" href="/ai-agent-launch-kit" data-track-event="product_view" data-track-label="View Launch Kit">Get the $29 launch kit</a>
        </div>
      </div>
      <div class="side-note">
        <p class="card-kicker">Start here</p>
        <strong>Pick one workflow with a clear owner and outcome.</strong>
        <p>Useful automation begins with the work, not the model. Map the request, rules, tools, human handoff, and success metric before buying software.</p>
      </div>
    </section>
    <section class="section">
      ${renderSectionTitle("Guides and templates", "Practical answers for buyers and operators", "Each resource is written for a decision someone needs to make, not to manufacture another keyword page.")}
      ${renderCardGrid(RESOURCE_PAGES.map((page) => ({
        kicker: page.category,
        title: page.title,
        description: page.description,
        href: page.path,
      })), "Read resource")}
    </section>
    <section class="section">
      ${renderSectionTitle("Popular topic hubs", "Continue into the workflows Google users are already researching", "These pages connect pricing, software selection, marketing automation, and funnel design to the detailed guides above.")}
      ${renderCardGrid([
        {
          kicker: "2026 comparison",
          title: "AI Receptionist Software Comparison",
          description: "Compare voice, WhatsApp, booking, human handoff, compliance, agency resale, and current pricing.",
          href: "/ai-receptionist-software",
        },
        {
          kicker: "Implementation system",
          title: "AI Marketing Automation for Small Business",
          description: "Connect demand, capture, qualification, follow-up, human decisions, and revenue attribution.",
          href: "/ai-marketing-automation",
        },
        {
          kicker: "Seven-stage playbook",
          title: "AI Sales Funnel Automation",
          description: "Map a measured sales funnel from search demand through qualification, payment, and verified profit.",
          href: "/ai-sales-funnel",
        },
      ], "Open topic")}
    </section>
    <section class="section split-section product-offer">
      <div>
        ${renderSectionTitle("Downloadable toolkit", "Turn the guidance into a working plan", DIGITAL_PRODUCTS[0].summary)}
        <ul class="benefit-list compact">
          ${DIGITAL_PRODUCTS[0].includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <div class="cta-box">
        <strong>${moneyWithCents(DIGITAL_PRODUCTS[0].price)} one-time</strong>
        <a class="button-primary" href="/ai-agent-launch-kit">View the AI Agent Launch Kit</a>
      </div>
    </section>`;

  return renderShell(env, {
    path: "/resources",
    title: "AI Agent Resources",
    description: "Practical guides, templates, comparisons, and tools for planning useful business AI agents.",
    body,
    schema: [
      organizationSchema(env),
      collectionPageSchema(env),
      breadcrumbSchema(env, [
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
      ]),
    ],
    bodyClass: "page-resources",
  });
}

function renderResourceEvidenceSection(page) {
  const pricing = Array.isArray(page.pricingSnapshot) ? page.pricingSnapshot : [];
  const faqs = Array.isArray(page.faqs) ? page.faqs : [];
  if (!pricing.length && !faqs.length) return "";

  return `
    ${pricing.length ? `<section class="section resource-evidence">
      ${renderSectionTitle("Published pricing snapshot", "What AI receptionist plans cost in August 2026", "This is a dated comparison of public vendor pages, not a universal market average or a paid ranking. Prices and allowances can change; verify the linked source before buying.")}
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Provider</th><th>Published price</th><th>Included usage or billing model</th></tr></thead>
          <tbody>
            ${pricing.map((item) => `<tr>
              <td><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener nofollow">${escapeHtml(item.provider)}</a></td>
              <td>${escapeHtml(item.publishedPrice)}</td>
              <td>${escapeHtml(item.usageModel)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="trust-line">Sources checked ${escapeHtml(page.updatedLabel || "August 7, 2026")}. GPTMarketPlus did not receive payment for inclusion. Compare total cost at your expected volume, not only the lowest advertised base price.</p>
    </section>` : ""}
    ${faqs.length ? `<section class="section resource-faq">
      ${renderSectionTitle(page.faqKicker || "Pricing questions", page.faqTitle || "AI receptionist cost FAQ", page.faqDescription || "Use these answers to turn a headline price into a realistic monthly budget.")}
      <div class="feature-rack">
        ${faqs.map((item) => `<article class="feature-card"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></article>`).join("")}
      </div>
    </section>` : ""}`;
}

function renderResourceArticlePage(env, page) {
  const body = `
    <article class="resource-article">
      <header class="page-hero resource-hero">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden="true">/</span><a href="/resources">Resources</a><span aria-hidden="true">/</span><span>${escapeHtml(page.category)}</span>
        </nav>
        <p class="eyebrow">${escapeHtml(page.category)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="hero-lede">${escapeHtml(page.description)}</p>
        <p class="trust-line">Written by the <a href="/about">GPTMarketPlus editorial team</a> · Updated ${escapeHtml(page.updatedLabel || "July 30, 2026")}</p>
        <div class="resource-summary">
          <p class="card-kicker">Bottom line</p>
          <strong>${escapeHtml(page.summary)}</strong>
        </div>
      </header>
      ${renderResourceEvidenceSection(page)}
      <div class="resource-layout">
        <div class="resource-content">
          ${page.sections.map((section, index) => `
            <section class="resource-section" id="section-${index + 1}">
              <p class="card-kicker">Step ${index + 1}</p>
              <h2>${escapeHtml(section.title)}</h2>
              <p>${escapeHtml(section.body)}</p>
              <ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
            </section>`).join("")}
        </div>
        <aside class="resource-sidebar">
          <div class="side-note">
            <p class="card-kicker">Use this guide</p>
            <p>Write down the workflow owner, baseline, target, approval boundary, and next action. Those five items turn a good idea into a testable project.</p>
            <a class="button-primary" href="/tools/ai-automation-roi-calculator">Estimate the ROI</a>
          </div>
          <div class="side-note">
            <p class="card-kicker">Need the templates?</p>
            <p>The $29 launch kit includes the planning workbook, intake templates, guardrail worksheet, launch QA, and scorecard.</p>
            <a class="button-secondary" href="/ai-agent-launch-kit">View the launch kit</a>
          </div>
        </aside>
      </div>
      <section class="section related-resources">
        ${renderSectionTitle("Keep planning", "Related resources and next steps", "")}
        ${renderCardGrid(page.related.map((path) => ({
          kicker: path.startsWith("/guides") ? "Guide" : path.startsWith("/tools") ? "Tool" : "Next step",
          title: resourceLinkTitle(path),
          description: AGENTID_PUBLIC_PAGES.find((entry) => entry.path === path)?.description || "Continue from this guide with a practical next step.",
          href: path,
        })), "Open")}
      </section>
    </article>`;

  return renderShell(env, {
    path: page.path,
    title: page.title,
    description: page.description,
    body,
    schema: [
      organizationSchema(env),
      articleSchema(env, page),
      breadcrumbSchema(env, [
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
        { name: page.title, path: page.path },
      ]),
    ],
    bodyClass: "page-resource-article",
  });
}

function renderRoiCalculatorPage(env) {
  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("Free calculator", "AI Automation ROI Calculator: Estimate Payback and Savings", "Estimate monthly time savings, recovered contribution value, operating cost, payback period, and first-year ROI for one proposed workflow. All calculations run in your browser; the values are not submitted.")}
        <p class="trust-line">Use conservative inputs and compare the estimate with a measured baseline. This is a planning model, not a revenue guarantee.</p>
      </div>
      <div class="side-note">
        <p class="card-kicker">Best result</p>
        <strong>Calculate one workflow at a time.</strong>
        <p>Examples: missed-call follow-up, estimate intake, FAQ handling, appointment qualification, or CRM data entry.</p>
      </div>
    </section>
    <section class="section calculator-layout">
      <form class="roi-calculator" id="roi-calculator">
        <fieldset>
          <legend>Time currently spent</legend>
          <label class="field"><span>Tasks per week</span><input name="tasksPerWeek" type="number" min="0" step="1" value="40"></label>
          <label class="field"><span>Minutes per task</span><input name="minutesPerTask" type="number" min="0" step="1" value="8"></label>
          <label class="field"><span>Hourly value of that time ($)</span><input name="hourlyValue" type="number" min="0" step="1" value="45"></label>
          <label class="field"><span>Share the workflow can safely automate (%)</span><input name="automationPercent" type="number" min="0" max="100" step="1" value="70"></label>
        </fieldset>
        <fieldset>
          <legend>Opportunity recovery</legend>
          <label class="field"><span>Missed or delayed opportunities per month</span><input name="missedOpportunities" type="number" min="0" step="1" value="5"></label>
          <label class="field"><span>Average gross value per converted opportunity ($)</span><input name="opportunityValue" type="number" min="0" step="1" value="450"></label>
          <label class="field"><span>Conservative recovery rate (%)</span><input name="recoveryPercent" type="number" min="0" max="100" step="1" value="20"></label>
          <label class="field"><span>Contribution margin after direct costs (%)</span><input name="contributionMarginPercent" type="number" min="0" max="100" step="1" value="50"></label>
        </fieldset>
        <fieldset>
          <legend>Proposed cost</legend>
          <label class="field"><span>One-time setup cost ($)</span><input name="setupCost" type="number" min="0" step="1" value="1497"></label>
          <label class="field"><span>Monthly software and support cost ($)</span><input name="monthlyCost" type="number" min="0" step="1" value="99"></label>
        </fieldset>
        <button class="button-primary" type="submit">Calculate estimated return</button>
      </form>
      <section class="roi-results" id="roi-results" aria-live="polite">
        <p class="card-kicker">Planning estimate</p>
        <div class="result-grid">
          <article><span>Monthly time value</span><strong data-result="time">$0</strong></article>
          <article><span>Recovered contribution value</span><strong data-result="opportunity">$0</strong></article>
          <article><span>Net monthly value</span><strong data-result="net">$0</strong></article>
          <article><span>Estimated payback</span><strong data-result="payback">—</strong></article>
          <article><span>First-year net value</span><strong data-result="yearOne">$0</strong></article>
          <article><span>First-year ROI</span><strong data-result="roi">—</strong></article>
        </div>
        <div class="recommendation" data-result="recommendation">Enter conservative inputs and calculate the workflow.</div>
        <p class="form-note">The recovery estimate applies your contribution margin so gross sales are not treated as profit. It still excludes taxes, financing, implementation delay, risk, refunds, and benefits or costs not entered above. Validate with actual operational data.</p>
        <div class="cta-row">
          <a class="button-primary" href="/book-a-consultation" data-track-event="calculator_cta" data-track-label="Review My Estimate">Review my estimate</a>
          <a class="button-secondary" href="/ai-agent-launch-kit" data-track-event="product_view" data-track-label="Plan It Myself">Plan it myself for $29</a>
        </div>
      </section>
    </section>
    <section class="section">
      ${renderSectionTitle("Use the result responsibly", "Turn an estimate into a measurable pilot", "Record the current response time, labor time, qualified opportunities, and completed outcomes before launch. Recalculate after 30 days with real data.")}
      ${renderCardGrid([
        { kicker: "Baseline", title: "Measure the current workflow", description: "Use a representative sample instead of guessing from the busiest or quietest day." },
        { kicker: "Boundary", title: "Automate only the safe share", description: "Keep approval and human judgment where a mistake has a high customer, legal, or financial consequence." },
        { kicker: "Pilot", title: "Start with one channel", description: "Prove the workflow on one source before connecting every inbox, phone number, and system." },
        { kicker: "Review", title: "Compare after 30 days", description: "Use actual time saved, outcomes recovered, errors, opt-outs, and operating cost." },
      ])}
    </section>
    <section class="section split-section">
      <div>
        ${renderSectionTitle("Calculation method", "How the AI automation ROI estimate works", "The calculator keeps time value, recovered contribution, setup cost, and recurring cost separate so the assumptions can be challenged individually.")}
        <ol class="benefit-list compact">
          <li><strong>Monthly time value:</strong> weekly tasks × minutes per task × 4.33 weeks × hourly value × safe automation share.</li>
          <li><strong>Recovered contribution:</strong> missed opportunities × average gross value × recovery rate × contribution margin.</li>
          <li><strong>Net monthly value:</strong> time value + recovered contribution − monthly software and support cost.</li>
          <li><strong>First-year ROI:</strong> first-year net value ÷ setup and 12 months of recurring cost.</li>
        </ol>
      </div>
      <div class="side-note">
        <p class="card-kicker">Interpretation</p>
        <strong>A high estimate is a hypothesis, not proof.</strong>
        <p>Test the most uncertain input first. For lead workflows, that is often recovery rate or contribution margin. For administrative workflows, it is often the share of time that can be automated safely.</p>
        <p><a href="/guides/ai-agent-for-small-business">Use the 30-day small-business AI-agent plan</a> or map the response sequence with the <a href="/guides/ai-lead-follow-up">AI lead follow-up workflow</a>.</p>
      </div>
    </section>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("roi-calculator");
        const results = document.getElementById("roi-results");
        const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        const value = function (name) {
          const input = form.elements.namedItem(name);
          return Math.max(0, Number(input && input.value || 0));
        };
        const render = function () {
          const monthlyHours = value("tasksPerWeek") * value("minutesPerTask") / 60 * 4.33;
          const monthlyTimeValue = monthlyHours * value("hourlyValue") * Math.min(100, value("automationPercent")) / 100;
          const opportunityValue = value("missedOpportunities") * value("opportunityValue") * Math.min(100, value("recoveryPercent")) / 100 * Math.min(100, value("contributionMarginPercent")) / 100;
          const monthlyBenefit = monthlyTimeValue + opportunityValue;
          const monthlyNet = monthlyBenefit - value("monthlyCost");
          const annualInvestment = value("setupCost") + value("monthlyCost") * 12;
          const yearOneNet = monthlyBenefit * 12 - annualInvestment;
          const roi = annualInvestment > 0 ? yearOneNet / annualInvestment * 100 : null;
          const payback = monthlyNet > 0 ? value("setupCost") / monthlyNet : null;
          results.querySelector('[data-result="time"]').textContent = money.format(monthlyTimeValue);
          results.querySelector('[data-result="opportunity"]').textContent = money.format(opportunityValue);
          results.querySelector('[data-result="net"]').textContent = money.format(monthlyNet);
          results.querySelector('[data-result="payback"]').textContent = payback === null ? "No payback" : payback < 1 ? "Under 1 month" : payback.toFixed(1) + " months";
          results.querySelector('[data-result="yearOne"]').textContent = money.format(yearOneNet);
          results.querySelector('[data-result="roi"]').textContent = roi === null ? "—" : roi.toFixed(0) + "%";
          results.querySelector('[data-result="recommendation"]').textContent = monthlyNet <= 0
            ? "This estimate does not cover the proposed monthly cost. Reduce scope or cost, or choose a workflow with clearer value."
            : payback !== null && payback <= 6
              ? "This workflow may justify a measured pilot. Confirm the baseline and test the assumptions before expanding."
              : "The workflow may create value, but the payback is longer. Tighten the scope and validate the highest-impact assumption first.";
          window.agentidTrackEvent && window.agentidTrackEvent("roi_calculation", {
            monthly_value: Math.round(monthlyBenefit),
            monthly_net: Math.round(monthlyNet),
            payback_months: payback === null ? 0 : Math.round(payback * 10) / 10,
          });
        };
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          render();
          results.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        render();
      });
    </script>`;

  return renderShell(env, {
    path: "/tools/ai-automation-roi-calculator",
    title: "AI Automation ROI Calculator: Estimate Payback and Savings",
    description: "Estimate monthly time savings, recovered contribution value, operating cost, payback period, and first-year ROI for a proposed AI automation workflow.",
    body,
    schema: [
      organizationSchema(env),
      softwareApplicationSchema(env),
      breadcrumbSchema(env, [
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
        { name: "AI Automation ROI Calculator", path: "/tools/ai-automation-roi-calculator" },
      ]),
    ],
    bodyClass: "page-roi-calculator",
  });
}

function renderLaunchKitPage(env) {
  const product = DIGITAL_PRODUCTS[0];
  const checkoutReady = fullCheckoutReady(env);
  const paypalReady = paypalCheckoutReady(env);
  const checkout = `
    <div class="checkout-stack">
      ${paypalReady ? `
        <form class="checkout-form paypal-checkout-form product-checkout-form" data-agentid-form="1" data-endpoint="/api/paypal/orders/create">
          <input type="hidden" name="productId" value="${escapeHtml(product.id)}">
          <input type="hidden" name="sourcePage" value="/ai-agent-launch-kit">
          <button class="button-primary" type="submit">Buy with PayPal for ${moneyWithCents(product.price)}</button>
          <p class="form-status"></p>
        </form>` : ""}
      ${checkoutReady ? `
        <form class="checkout-form product-checkout-form" data-agentid-form="1" data-endpoint="/api/checkout">
          <input type="hidden" name="productId" value="${escapeHtml(product.id)}">
          <input type="hidden" name="sourcePage" value="/ai-agent-launch-kit">
          <button class="button-secondary" type="submit">Pay by card for ${moneyWithCents(product.price)}</button>
          <p class="form-status"></p>
        </form>` : ""}
      ${!paypalReady && !checkoutReady ? `<a class="button-primary" href="/contact">Request the launch kit</a>` : ""}
    </div>`;
  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("Downloadable toolkit", "Plan an AI agent your business can actually launch", product.summary)}
        <div class="cta-row">${checkout}<a class="button-secondary" href="/resources">Read the free guides first</a></div>
        <p class="trust-line">One-time payment. Secure download appears only after PayPal or the card processor confirms payment. No revenue or performance guarantees.</p>
      </div>
      <div class="kit-preview">
        <p class="card-kicker">AI Agent Launch Kit</p>
        <strong>6 practical planning assets</strong>
        <ol>
          ${product.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
        <span class="price-badge">${moneyWithCents(product.price)} one-time</span>
      </div>
    </section>
    <section class="section">
      ${renderSectionTitle("What is inside", "From vague idea to a testable workflow", "The kit is delivered as an editable Markdown workbook that can be opened in any text editor, document app, or knowledge workspace.")}
      ${renderCardGrid([
        { kicker: "Scorecard", title: "Opportunity ranking", description: "Rank candidate workflows by frequency, time, revenue impact, risk, data readiness, and ownership." },
        { kicker: "Intake", title: "Knowledge collection", description: "Collect approved FAQs, services, policies, escalation contacts, hours, service area, and handoff rules." },
        { kicker: "Guardrails", title: "Action and escalation map", description: "Define what the agent may answer, collect, change, send, approve, and escalate." },
        { kicker: "Templates", title: "Lead follow-up pack", description: "Customize acknowledgment, missed-call, quote reminder, appointment, and reactivation messages." },
        { kicker: "QA", title: "Launch test checklist", description: "Test normal requests, unclear language, missing information, sensitive topics, failures, and human takeover." },
        { kicker: "Measurement", title: "30-day scorecard", description: "Track response time, completion, handoff, errors, opt-outs, operating cost, and measurable outcomes." },
      ])}
    </section>
    <section class="section split-section">
      <div>
        ${renderSectionTitle("Who it is for", "Owners and operators planning a first workflow", "Use it yourself, with your team, or as the preparation package before a custom GPTMarketPlus build.")}
      </div>
      <div class="cta-box">
        <strong>Ready to plan it?</strong>
        ${checkout}
        <a class="button-secondary" href="/book-a-consultation">Have GPTMarketPlus build it with you</a>
      </div>
    </section>`;

  return renderShell(env, {
    path: "/ai-agent-launch-kit",
    title: "AI Agent Launch Kit",
    description: "A downloadable workbook, prompt pack, intake template, launch checklist, and 30-day scorecard for your first business AI agent.",
    body,
    schema: [
      organizationSchema(env),
      productSchema(env, product),
      breadcrumbSchema(env, [
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
        { name: product.name, path: "/ai-agent-launch-kit" },
      ]),
    ],
    bodyClass: "page-launch-kit",
  });
}

async function verifyDigitalProductSession(env, sessionId, expectedProductId) {
  const cleanSessionId = cleanText(sessionId || "", 180);
  if (!cleanSessionId) return { ok: false, status: 400, error: "A Checkout session is required." };
  const session = await retrieveStripeSession(env, cleanSessionId);
  if (!session) return { ok: false, status: 404, error: "The Checkout session could not be verified." };
  const paid = session.payment_status === "paid" && session.status === "complete";
  if (!paid) return { ok: false, status: 402, error: "Payment has not been confirmed." };
  if (cleanText(session.metadata?.product_id || "", 120) !== expectedProductId) {
    return { ok: false, status: 403, error: "This purchase does not include the requested download." };
  }
  return { ok: true, status: 200, session };
}

async function renderLaunchKitDownloadPage(env, sessionId) {
  const access = await verifyDigitalProductSession(env, sessionId, DIGITAL_PRODUCTS[0].id);
  const body = access.ok ? `
    <section class="page-hero split-section">
      <div>
        ${renderSectionTitle("Payment confirmed", "Your AI Agent Launch Kit is ready", "Download the editable Markdown workbook and save a copy with your project files.")}
        <div class="cta-row">
          <a class="button-primary" href="/api/digital-products/ai-agent-launch-kit?session_id=${encodeURIComponent(sessionId)}" data-track-event="digital_download" data-track-label="Download AI Agent Launch Kit">Download the launch kit</a>
          <a class="button-secondary" href="/book-a-consultation">Book implementation help</a>
        </div>
      </div>
      <div class="side-note">
        <p class="card-kicker">Delivery</p>
        <strong>AI-Agent-Launch-Kit.md</strong>
        <p>The file includes the opportunity scorecard, workflow brief, source intake, guardrails, follow-up templates, launch QA, and 30-day scorecard.</p>
      </div>
    </section>` : `
    <section class="page-hero split-section">
      <div>
        ${renderSectionTitle("Download access", "We could not verify this purchase", access.error)}
        <div class="cta-row">
          <a class="button-primary" href="/ai-agent-launch-kit">Return to the launch kit</a>
          <a class="button-secondary" href="/contact">Contact support</a>
        </div>
      </div>
    </section>`;

  return renderShell(env, {
    path: "/downloads/ai-agent-launch-kit",
    title: access.ok ? "Download Your AI Agent Launch Kit" : "Launch Kit Download Access",
    description: "Secure delivery for the AI Agent Launch Kit.",
    body,
    robots: "noindex,nofollow,noarchive",
    bodyClass: "page-digital-download",
  });
}

export function renderLaunchKitMarkdown() {
  return `# AI Agent Launch Kit

Copyright ${new Date().getFullYear()} GPTMarketPlus. Licensed to the purchaser for use within one business. Do not resell or redistribute this file.

## 1. Workflow opportunity scorecard

Score each candidate from 1 (low) to 5 (high).

| Candidate workflow | Frequency | Time consumed | Revenue impact | Data readiness | Clear owner | Risk if wrong | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| Example: missed-call follow-up | 5 | 3 | 5 | 4 | 5 | 2 | |
| | | | | | | | |
| | | | | | | | |

Choose one workflow with high frequency, clear ownership, usable source data, and a safe boundary.

## 2. One-page workflow brief

- Business outcome:
- Workflow owner:
- Trigger:
- Information received:
- Approved information sources:
- Questions the agent may ask:
- Action the agent may take:
- Action requiring human approval:
- Escalation conditions:
- Human handoff destination:
- Completion definition:
- Baseline metric:
- 30-day target:

## 3. Knowledge and business intake

- Business name and public description:
- Services or products:
- Service area:
- Business hours:
- Contact methods:
- Booking process:
- Pricing the agent may disclose:
- Common customer questions and approved answers:
- Policies and limitations:
- Topics the agent must not answer:
- Emergency or sensitive-topic language:
- Escalation contacts:
- Systems to update:

## 4. Guardrail and escalation worksheet

| Situation | Agent may answer? | Agent may collect data? | Agent may take action? | Human approval needed? | Escalation owner |
|---|---|---|---|---|---|
| Normal service inquiry | | | | | |
| Price question | | | | | |
| Complaint | | | | | |
| Sensitive or regulated data | | | | | |
| Emergency language | | | | | |
| Refund, legal, or financial commitment | | | | | |

Rules:

1. The agent identifies itself as automated.
2. It answers only from approved sources.
3. It does not invent price, availability, policy, or outcomes.
4. It asks only for information required for the next step.
5. It respects consent and opt-out requests.
6. It escalates uncertainty and high-consequence actions.

## 5. Lead follow-up templates

### New inquiry acknowledgment

Hi [first name]—thanks for contacting [business] about [service]. We received your request for [summary]. [owner/team] normally replies within [response window]. Is [channel] the best way to reach you?

### Missed-call follow-up

Hi [first name], this is the automated assistant for [business]. We missed your call. What can we help with, and is this urgent? [Insert approved opt-out language for your channel and jurisdiction.]

### Quote reminder

Hi [first name]—checking whether you had questions about the [service] quote sent on [date]. The next step is [specific action]. Would [option A] or [option B] be more useful?

### Appointment reminder

Hi [first name]—this is a reminder for [service/appointment] on [date] at [time]. Reply [confirmation instruction] to confirm or [reschedule instruction] if the time no longer works.

### Past-customer reactivation

Hi [first name], [business] helped with [prior service] in [month/year]. We are scheduling [relevant service]. Would you like details, or should we close the loop for now?

## 6. Launch QA checklist

- [ ] Every answer source is current and approved.
- [ ] The agent clearly identifies itself as automated.
- [ ] Normal inquiries reach the correct outcome.
- [ ] Missing and contradictory information is handled.
- [ ] Unknown questions trigger a safe fallback.
- [ ] Sensitive topics use approved language.
- [ ] High-consequence actions require approval.
- [ ] Human takeover works on mobile and desktop.
- [ ] CRM, calendar, email, and task writes are validated.
- [ ] Duplicate submissions do not create duplicate actions.
- [ ] Consent and opt-out paths work.
- [ ] Logs exclude secrets and unnecessary sensitive data.
- [ ] The owner receives the right summary and next action.
- [ ] Analytics records starts, completions, handoffs, and failures.

## 7. Thirty-day scorecard

| Metric | Baseline | Week 1 | Week 2 | Week 3 | Week 4 | Target |
|---|---:|---:|---:|---:|---:|---:|
| Median time to first useful response | | | | | | |
| Workflow starts | | | | | | |
| Completed workflows | | | | | | |
| Qualified handoffs | | | | | | |
| Bookings or quotes created | | | | | | |
| Human escalations | | | | | | |
| Wrong answers or routes | | | | | | |
| Opt-outs or complaints | | | | | | |
| Estimated staff hours saved | | | | | | |
| Monthly operating cost | | | | | | |

At day 30, decide to keep, adjust, expand, or stop. Expansion is earned by reliable outcomes, not message volume.

## Implementation help

GPTMarketPlus can turn this plan into a custom workflow:

- https://gptmarketplus.com/book-a-consultation
- https://gptmarketplus.com/pricing
- https://gptmarketplus.com/resources
`;
}

function renderAboutPage(env) {
  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("About", "Practical AI implementation for real businesses", "We build AI systems that make businesses faster, more organized, and easier to operate.")}
        <p>GPTMarketPlus was created to help businesses use AI in a practical way - with systems that answer, organize, follow up, and support daily operations.</p>
      </div>
      <div class="about-panel">
        <p class="card-kicker">Founder-led trust</p>
        <strong>Built to solve work, not chase hype</strong>
        <p>We focus on practical outcomes: save time, capture leads, respond faster, reduce missed calls, automate follow-up, improve booking rates, organize operations, and reduce repetitive admin work.</p>
      </div>
    </section>
  `;
  return renderShell(env, {
    path: "/about",
    title: "About",
    description: "Practical AI implementation for real businesses.",
    body,
    schema: [organizationSchema(env), professionalServiceSchema(env, "AI agent services")],
    bodyClass: "page-about",
  });
}

function renderFaqPage(env) {
  const body = `
    <section class="page-hero">
      ${renderPageTitle("FAQ", "Practical answers to common questions", "No fake guarantees. No unnecessary jargon.")}
    </section>
    <section class="section faq-list">
      ${FAQ_ITEMS.map((item) => `
        <details data-track-faq>
          <summary>${escapeHtml(item.question)} <span>+</span></summary>
          <div class="faq-answer">${escapeHtml(item.answer)}</div>
        </details>
      `).join("")}
    </section>
  `;
  return renderShell(env, {
    path: "/faq",
    title: "FAQ",
    description: "Practical answers about AI agents, pricing, security, and setup time.",
    body,
    schema: [organizationSchema(env), faqSchema(env)],
    bodyClass: "page-faq",
  });
}

function renderPrivacyPage(env) {
  const body = `
    <section class="page-hero">
      ${renderPageTitle("Privacy Policy", "How we handle information", "We keep the policy practical and aligned with the data we actually collect.")}
    </section>
    <section class="section legal-copy">
      <p>We collect contact information, business information, form responses, chat transcripts, and onboarding details that you submit to design and deliver your AI agent system.</p>
      <p>We use the information to respond to inquiries, create proposals, build workflows, provide support, and improve the service experience.</p>
      <p>We do not promise HIPAA, legal, financial, or regulatory compliance unless the system is actually implemented for that purpose.</p>
      <p>You should not submit protected health information, sensitive legal information, or regulated data unless the final system is designed for that purpose and the compliance setup is in place.</p>
      <p>We may use analytics, server logs, and form events to measure performance and improve the website. We do not sell your data.</p>
      <p>When advertising is enabled, third-party vendors including Google may use cookies or similar technologies to serve and measure ads based on visits to this and other websites. Google provides controls for <a href="https://myadcenter.google.com/" rel="noopener">personalized advertising</a>.</p>
      <p>Advertising links are not endorsements. Do not click advertisements to support this site; use them only when they are genuinely relevant to you.</p>
    </section>
  `;
  return renderShell(env, {
    path: "/privacy",
    title: "Privacy Policy",
    description: "Privacy, data usage, and consent terms.",
    body,
    schema: [organizationSchema(env), contactPointSchema(env)],
    bodyClass: "page-legal",
  });
}

function renderTermsPage(env) {
  const body = `
    <section class="page-hero">
      ${renderPageTitle("Terms of Service", "Clear terms without filler", "Use this site and service only within the agreed scope.")}
    </section>
    <section class="section legal-copy">
      <p>The website and services are provided as-is within the agreed project scope, package, and implementation plan.</p>
      <p>We do not guarantee revenue, search rankings, response rates, or business outcomes.</p>
      <p>You are responsible for the accuracy of the information you provide, the legality of the data you submit, and the permissions required for any integrations.</p>
      <p>Payments and deposits are processed by secure third-party processors when configured. Final scope and delivery details are confirmed after the strategy call and onboarding process.</p>
      <p>If a workflow involves regulated data or compliance obligations, those requirements must be explicitly documented and implemented before launch.</p>
    </section>
  `;
  return renderShell(env, {
    path: "/terms",
    title: "Terms of Service",
    description: `Terms and use conditions for ${brandName(env)}.`,
    body,
    schema: [organizationSchema(env)],
    bodyClass: "page-legal",
  });
}

function renderRefundPolicyPage(env) {
  const support = contactEmail(env);
  const body = `
    <section class="page-hero">
      ${renderPageTitle("Refund Policy", "Clear rules for digital products and project work", "Review these terms before purchasing or approving a proposal.")}
    </section>
    <section class="section legal-copy">
      <h2>AI Agent Launch Kit</h2>
      <p>The Launch Kit is delivered as a digital download after payment. If you cannot access the files or the files are materially incomplete, contact <a href="mailto:${escapeHtml(support)}">${escapeHtml(support)}</a> within 14 days so we can restore access, replace the files, or issue an appropriate refund.</p>
      <p>Because downloadable materials can be copied immediately, change-of-mind refunds are not guaranteed after successful access. This does not limit rights that cannot legally be waived.</p>
      <h2>Custom services and sponsorships</h2>
      <p>Custom implementation and sponsorship placements are not sold automatically on this site. Scope, deliverables, timing, payment terms, cancellation rights, and any refund terms must be stated in a written proposal or order before payment is requested.</p>
      <h2>Payment questions</h2>
      <p>Include the purchaser email and PayPal order ID when contacting support. Do not email payment-card details or passwords.</p>
    </section>
  `;
  return renderShell(env, {
    path: "/refund-policy",
    title: "Refund Policy",
    description: "Refund, replacement, and cancellation terms for GPTMarketPlus products and services.",
    body,
    schema: [organizationSchema(env), contactPointSchema(env)],
    bodyClass: "page-legal",
  });
}

function renderContactPage(env, requestUrl = null) {
  const intent = cleanText(requestUrl?.searchParams?.get("intent") || "", 40).toLowerCase();
  const requestedPackageId = cleanText(requestUrl?.searchParams?.get("package") || "", 80);
  const requestedSponsorPlan = intent === "sponsor"
    ? SPONSOR_SUBSCRIPTIONS.find((plan) => plan.id === requestedPackageId) || SPONSOR_SUBSCRIPTIONS[0]
    : null;
  const isSponsorApplication = Boolean(requestedSponsorPlan);
  const requestDescription = isSponsorApplication
    ? `Sponsor application for ${requestedSponsorPlan.name} (${moneyWithCents(requestedSponsorPlan.price)} / 30 days). Product or service to review: `
    : "";
  const fields = isSponsorApplication
    ? [
        { name: "applicationType", type: "hidden", value: "sponsor" },
        { name: "name", label: "Your name", placeholder: "Your name", required: true },
        { name: "email", label: "Work email", type: "email", placeholder: "you@company.com", required: true },
        { name: "businessName", label: "Company or product", placeholder: "Company or product name", required: true },
        { name: "website", label: "Product website", type: "url", placeholder: "https://yourproduct.com", required: true },
        {
          name: "whatDoYouWantToAutomate",
          label: "Product, audience fit, and preferred dates",
          type: "textarea",
          rows: 4,
          placeholder: "Describe the product, target audience, destination URL, and preferred campaign dates.",
          value: requestDescription,
          required: true,
        },
        { name: "contactConsent", label: "I agree to be contacted about this sponsor application.", type: "checkbox", required: true },
      ]
    : [
        { name: "name", label: "Name", placeholder: "Your name", required: true },
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
        { name: "phone", label: "Phone", placeholder: "(555) 555-5555", required: true },
        { name: "businessName", label: "Business name", placeholder: "Company or brand name", required: true },
        { name: "website", label: "Website", type: "url", placeholder: "https://yourbusiness.com", required: true },
        { name: "businessType", label: "Business type", type: "select", required: true, options: businessTypeCatalog() },
        {
          name: "whatDoYouWantToAutomate",
          label: "What do you want to automate?",
          type: "textarea",
          rows: 4,
          placeholder: "Tell us what work you want the agent to handle.",
          required: true,
        },
        { name: "budgetRange", label: "Budget range", type: "select", required: true, options: ["Under $500", "$500-$1,500", "$1,500-$3,500", "$3,500+", "Not sure yet"] },
        { name: "timeline", label: "Timeline", type: "select", required: true, options: ["Immediately", "This week", "This month", "Just researching"] },
        { name: "preferredContactMethod", label: "Preferred contact method", type: "select", required: true, options: ["Email", "Phone", "Text"] },
        { name: "bestTimeToContact", label: "Best time to contact", placeholder: "Morning, afternoon, or evening", required: false },
        { name: "contactConsent", label: "I agree to be contacted about my request.", type: "checkbox", required: true },
      ];
  const form = renderLeadForm({
    action: "/api/contact",
    formId: "contact-form",
    cta: isSponsorApplication ? "Submit Sponsor Application" : "Request My AI Agent Plan",
    note: isSponsorApplication
      ? "Submitting does not create a charge or guarantee placement. We review relevance, inventory, and fulfillment first; approved placements receive a PayPal invoice only after written terms are accepted."
      : "By submitting, you agree we can contact you about your request. Add only the information you want us to use for this project.",
    turnstileHtml: renderTurnstileWidget(env),
    fields,
  });

  const body = `
    <section class="page-hero split-section">
      <div>
        ${isSponsorApplication
          ? renderPageTitle("Sponsor application", `Apply for ${requestedSponsorPlan.name}`, "A reviewed application with no charge until relevance, inventory, placement, and fulfillment terms are confirmed.")
          : renderPageTitle("Contact", "Request your AI Agent Plan", "Validated lead capture, CRM-ready structure, and a conversion-focused next step.")}
        <p>${isSponsorApplication
          ? `The requested placement is ${escapeHtml(requestedSponsorPlan.placement)} at ${moneyWithCents(requestedSponsorPlan.price)} / 30 days. Describe the product and audience fit so we can review it.`
          : "Tell us what you want to automate. We’ll validate the request, generate a lead summary, and prepare the next step."}</p>
      </div>
      <div class="hero-side">
        <article class="info-card">
          <p class="card-kicker">What happens on submit</p>
          <ul>${isSponsorApplication
          ? "<li>Review product and audience relevance</li><li>Confirm available placement and dates</li><li>Agree on creative, labeling, and destination URL</li><li>Confirm reporting and fulfillment terms</li><li>Send a PayPal invoice only after written approval</li>"
            : "<li>Validate required fields</li><li>Save or route the lead</li><li>Trigger analytics events</li><li>Prepare for CRM integration</li><li>Generate a lead summary when enough detail is provided</li>"}</ul>
        </article>
      </div>
    </section>
    <section class="section split-section">
      <div>${form}</div>
      <div class="side-note">
          <p class="card-kicker">${isSponsorApplication ? "Sponsor review" : "Internal notification"}</p>
          <strong>${isSponsorApplication ? "Applications are reviewed before billing." : "New GPTMarketPlus lead received."}</strong>
          <p>${isSponsorApplication
            ? "No performance guarantee is made. Approved placements remain clearly labeled and separate from editorial content."
            : "Review business type, automation request, budget, and timeline. Respond within 15 minutes if possible."}</p>
      </div>
    </section>
  `;

  return renderShell(env, {
    path: "/contact",
    title: "Contact",
    description: "Request your AI agent plan with a validated lead form.",
    body,
    schema: [organizationSchema(env), contactPointSchema(env), serviceSchema(env, "AI agent lead capture", "Request your AI agent plan with a validated lead form.", "/contact")],
    bodyClass: "page-contact",
  });
}

function renderBookingPage(env) {
  const bookingEmbed = calendarEmbedUrl(env)
    ? `<iframe class="calendar-embed" src="${escapeHtml(calendarEmbedUrl(env))}" title="Booking calendar" loading="lazy"></iframe>`
    : `
      <div class="calendar-placeholder">
        <p class="card-kicker">Flexible scheduling</p>
        <strong>Tell us about the workflow you want to improve.</strong>
        <p>Submit the short form and we’ll follow up to confirm a call time that works for you.</p>
        ${bookingUrl(env) ? `<a class="button-primary" href="${escapeHtml(bookingUrl(env))}" target="_blank" rel="noopener">See available times</a>` : `<a class="button-secondary" href="/contact">Request a written AI agent plan instead</a>`}
      </div>`;

  const form = renderLeadForm({
    action: "/api/book-consultation",
    formId: "booking-form",
    cta: "Book My Free AI Strategy Call",
    note: "We’ll look at your business, identify what can be automated, and recommend the best AI agent setup.",
    turnstileHtml: renderTurnstileWidget(env),
    fields: [
      { name: "name", label: "Name", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
      { name: "businessName", label: "Business name", placeholder: "Company or brand name", required: true },
      { name: "businessType", label: "Business type", type: "select", required: true, options: businessTypeCatalog() },
      { name: "whatDoYouWantToAutomate", label: "What do you want to fix first?", type: "textarea", rows: 4, placeholder: "Tell us what you want the call to focus on.", required: true },
      { name: "budgetRange", label: "Budget range", type: "select", required: true, options: ["Under $500", "$500-$1,500", "$1,500-$3,500", "$3,500+", "Not sure yet"] },
      { name: "timeline", label: "Timeline", type: "select", required: true, options: ["Immediately", "This week", "This month", "Just researching"] },
      { name: "preferredContactMethod", label: "Preferred contact method", type: "select", required: true, options: ["Email", "Phone", "Text"] },
      { name: "contactConsent", label: "I agree to be contacted about this strategy call.", type: "checkbox", required: true },
    ],
  });

  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("Book a Consultation", "Book a Free AI Strategy Call", "We’ll look at your business, identify what can be automated, and recommend the best AI agent setup.")}
        <ul class="benefit-list compact">
          ${BOOKING_COVERS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <div>${bookingEmbed}</div>
    </section>
    <section class="section split-section">
      <div>${form}</div>
      <div class="side-note">
        <p class="card-kicker">Good fit for</p>
        <p>Businesses that want a practical AI workflow, a clear recommendation, and a next step that does not waste time.</p>
      </div>
    </section>
  `;

  return renderShell(env, {
    path: "/book-a-consultation",
    title: "Book a Consultation",
    description: "Book a free AI strategy call.",
    body,
    schema: [organizationSchema(env), serviceSchema(env, "AI strategy call", "Book a free AI strategy call.", "/book-a-consultation")],
    bodyClass: "page-booking",
  });
}

function renderLeadMagnetPage(env) {
  const form = renderLeadForm({
    action: "/api/lead-magnet",
    formId: "lead-magnet-form",
    cta: "Get the Free Checklist",
    note: "Free AI Automation Audit Checklist. Find 10 tasks your business can automate this month.",
    turnstileHtml: renderTurnstileWidget(env),
    fields: [
      { name: "name", label: "Name", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
      { name: "phone", label: "Phone", placeholder: "(555) 555-5555", required: true },
      { name: "businessType", label: "Business type", type: "select", required: true, options: businessTypeCatalog() },
      { name: "website", label: "Website", type: "url", placeholder: "https://yourbusiness.com", required: true },
      { name: "contactConsent", label: "I agree to be contacted about my request.", type: "checkbox", required: true },
    ],
  });

  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("Lead Magnet", "Free AI Automation Audit Checklist", "Find 10 tasks your business can automate this month.")}
        <p>Use this checklist to identify the fastest, most practical place to start with AI automation.</p>
      </div>
      <div class="side-note">
        <ol class="checklist">
          ${LEAD_MAGNET_CHECKLIST.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>
    </section>
    <section class="section split-section">
      <div>${form}</div>
      <div class="side-note">
        <p class="card-kicker">After submit</p>
        <p>We’ll capture your details, show a thank-you message, recommend a strategy call, and prepare follow-up workflow routing.</p>
      </div>
    </section>
  `;

  return renderShell(env, {
    path: "/free-ai-automation-audit-checklist",
    title: "Free AI Automation Audit Checklist",
    description: "Find 10 tasks your business can automate this month.",
    body,
    schema: [organizationSchema(env), serviceSchema(env, "AI automation audit checklist", "Find 10 tasks your business can automate this month.", "/free-ai-automation-audit-checklist")],
    bodyClass: "page-lead-magnet",
  });
}



function validateRequiredFields(body, fields) {
  const missing = [];
  for (const field of fields) {
    if (typeof body[field] === "undefined" || String(body[field] || "").trim() === "") {
      missing.push(field);
    }
  }
  return missing;
}

function buildLeadResponse(savedLead, options = {}) {
  const followUpSequence = generateFollowUpSequence({
    ...savedLead,
    recommendedPackage: savedLead.recommended_package,
    leadTag: savedLead.lead_status,
  }, options.env || null);
  const dashboardUrl = savedLead.dashboard_token
    ? `/customer-dashboard?token=${encodeURIComponent(savedLead.dashboard_token)}`
    : `/customer-dashboard?lead=${encodeURIComponent(savedLead.id)}`;
  return {
    ok: true,
    message: options.message || "Received. We’ll follow up with the next step.",
    leadId: savedLead.id,
    leadTag: savedLead.lead_status,
    leadScore: savedLead.lead_score,
    recommendedPackage: savedLead.recommended_package,
    recommendedAgentType: savedLead.recommended_agent_type,
    summary: savedLead.transcript_summary || buildLeadSummary(savedLead),
    nextAction: savedLead.next_action,
    dashboardUrl,
    followUpSequence,
    customerBlueprintHtml: options.customerBlueprintHtml || "",
    internalBlueprintJson: options.internalBlueprintJson || null,
    trackEvent: options.trackEvent || "lead_captured",
  };
}

async function captureLead(env, ctx, body, options = {}) {
  const sourcePage = cleanText(body.sourcePage || options.sourcePage || "/", 200) || "/";
  const submissionType = cleanText(options.submissionType || body.submissionType || "lead", 80);
  const required = options.requiredFields || [];
  const missing = validateRequiredFields(body, required);
  if (missing.length) {
    return { ok: false, status: 400, error: `Missing required fields: ${missing.join(", ")}` };
  }

  const rate = await rateLimit(env, options.request || new Request("https://example.com"), submissionType);
  if (!rate.ok) {
    return { ok: false, status: 429, error: "Rate limited.", retryAfter: rate.retryAfter };
  }

  if (!(await verifyTurnstile(body, options.request || new Request("https://example.com"), env))) {
    return { ok: false, status: 403, error: "Turnstile verification failed." };
  }

  const businessType = cleanText(body.businessType || body.business_type || "", 120);
  const painPoint = cleanText(body.whatDoYouWantToAutomate || body.painPoint || body.mainProblem || "", 300);
  const desiredAutomation = cleanText(body.whatDoYouWantToAutomate || body.desiredAutomation || painPoint, 300);
  const packageName = packageBySignals({
    businessType,
    painPoint,
    desiredAutomation,
    currentTools: cleanText(body.currentTools || "", 300),
    budgetRange: cleanText(body.budgetRange || "", 80),
    timeline: cleanText(body.timeline || "", 80),
  });
  const agentRecommendation = recommendedAgentForBusinessType(businessType);
  const leadScore = scoreLead({
    name: cleanText(body.name || "", 120),
    email: cleanEmail(body.email || ""),
    phone: cleanPhone(body.phone || ""),
    website: cleanUrl(body.website || ""),
    businessName: cleanText(body.businessName || body.business_name || "", 160),
    businessType,
    painPoint,
    desiredAutomation,
    budgetRange: cleanText(body.budgetRange || "", 80),
    timeline: cleanText(body.timeline || "", 80),
  });
  const leadTag = leadScoreLabel(leadScore);
  const lead = {
    id: cleanText(body.leadId || body.id || "", 120) || crypto.randomUUID(),
    source_page: sourcePage,
    conversation_id: cleanText(body.conversationId || "", 120),
    crm_stage: options.crmStage || defaultLeadStage(leadTag),
    lead_status: leadTag,
    lead_score: leadScore,
    name: cleanText(body.name || "", 120),
    email: cleanEmail(body.email || ""),
    phone: cleanPhone(body.phone || ""),
    business_name: cleanText(body.businessName || body.business_name || "", 160),
    website: cleanUrl(body.website || ""),
    business_type: businessType,
    pain_point: painPoint,
    desired_automation: desiredAutomation,
    automation_theme: leadTheme(desiredAutomation || painPoint),
    current_tools: cleanText(body.currentTools || "", 300),
    common_objection: cleanText(body.commonObjection || "", 80),
    recommended_agent_type: agentRecommendation.agentType,
    recommended_package: packageName,
    budget_range: cleanText(body.budgetRange || "", 80),
    timeline: cleanText(body.timeline || "", 80),
    preferred_contact_method: cleanText(body.preferredContactMethod || "email", 80),
    best_time_to_contact: cleanText(body.bestTimeToContact || "", 80),
    transcript_summary: buildLeadSummary({
      leadTag,
      businessType,
      recommendedPackage: packageName,
      painPoint,
      budgetRange: cleanText(body.budgetRange || "", 80),
      timeline: cleanText(body.timeline || "", 80),
    }),
    full_transcript: cleanText(body.fullTranscript || body.transcript || "", 12000),
    next_action: leadTag === "HOT"
      ? hotLeadMessage()
      : leadTag === "WARM"
        ? warmLeadMessage(packageName)
        : coldLeadMessage(),
    follow_up_status: "queued",
    contact_consent: body.contactConsent === true || body.contactConsent === "1" || body.contactConsent === 1,
    marketing_consent: body.marketingConsent === true || body.marketingConsent === "1" || body.marketingConsent === 1,
    booked_call: options.bookedCall ? 1 : 0,
    quote_requested: options.quoteRequested ? 1 : 0,
    purchase_intent: cleanText(body.purchaseIntent || "", 80),
    dashboard_token: cleanText(body.dashboardToken || "", 120) || crypto.randomUUID().replace(/-/g, ""),
    notes: cleanText(body.notes || "", 1200),
  };
  const saved = await dbUpsertLead(env, lead);
  await dbInsertFollowups(env, saved.id, generateFollowUpSequence(saved, env));
  await dbInsertEvent(env, {
    event_name: `${submissionType}_submit`,
    source_page: sourcePage,
    lead_id: saved.id,
    conversation_id: saved.conversation_id,
    properties_json: {
      leadTag,
      packageName,
      agentType: agentRecommendation.agentType,
      submissionType,
    },
    user_agent: options.request?.headers?.get?.("user-agent") || "",
  });

  if (leadTag === "HOT") {
    const alert = buildOwnerLeadEmail(saved);
    ctx && ctx.waitUntil && ctx.waitUntil(sendWebhook(env, "hot_lead", { ...saved, summary: saved.transcript_summary }));
    ctx && ctx.waitUntil && ctx.waitUntil(maybeSendOwnerEmail(env, alert.subject, alert.text, alert.html, saved.email || ""));
  }

  const response = buildLeadResponse(saved, {
    env,
    message: options.message || "Received. We’ll follow up with the next step.",
    trackEvent: options.trackEvent || "lead_captured",
    customerBlueprintHtml: options.customerBlueprintHtml || "",
    internalBlueprintJson: options.internalBlueprintJson || null,
  });

  return { ok: true, status: 200, response };
}

function getCheckoutProduct(productId) {
  return CHECKOUT_PRODUCTS.find((item) => item.id === productId) || null;
}

async function createStripeCheckout(env, request, productId, opts = {}) {
  const product = getCheckoutProduct(productId);
  if (!product) return { ok: false, status: 400, error: "Unknown checkout product." };
  if (!fullCheckoutReady(env)) return { ok: false, status: 503, error: "Card checkout is temporarily unavailable." };

  const body = opts.body || {};
  const successPath = product.checkoutType === "digital_product"
    ? "/downloads/ai-agent-launch-kit"
    : "/onboarding";
  const successBase = `${siteUrl(env)}${successPath}`;
  const params = new URLSearchParams();
  params.set("mode", product.mode);
  params.set("success_url", `${successBase}?checkout=success&product=${encodeURIComponent(product.id)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${siteUrl(env)}${opts.cancelPath || "/pricing"}?checkout=cancel`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(product.price));
  params.set("line_items[0][price_data][product_data][name]", product.name);
  params.set("line_items[0][price_data][product_data][description]", product.description || product.name);
  params.set("metadata[product_id]", product.id);
  params.set("metadata[package_tier]", product.packageTier || product.id);
  params.set("metadata[checkout_type]", product.checkoutType || "setup");
  params.set("metadata[source_page]", cleanText(body.sourcePage || request.url || "", 200));
  if (body.email) {
    params.set("customer_email", cleanEmail(body.email));
  }
  if (product.mode === "subscription") {
    params.set("line_items[0][price_data][recurring][interval]", product.interval || "month");
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      error: result?.error?.message || "Stripe Checkout failed.",
    };
  }

  return {
    ok: true,
    status: 200,
    checkoutUrl: result.url,
    sessionId: result.id,
    product,
  };
}

async function retrieveStripeSession(env, sessionId) {
  if (!stripeReady(env) || !sessionId) return null;
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`, {
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) return null;
  return result;
}

async function storePurchaseFromSession(env, session, fallbackProduct = null) {
  if (!session) return null;
  if (session.payment_status !== "paid") return null;
  const productId = cleanText(session.metadata?.product_id || fallbackProduct?.id || "", 120);
  const product = fallbackProduct || getCheckoutProduct(productId);
  const existingPurchase = session.id ? await dbGetPurchaseBySession(env, session.id) : null;
  const lead = session.customer_details?.email
    ? await queryD1First(env, "SELECT * FROM agentid_leads WHERE email = ? ORDER BY datetime(created_at) DESC LIMIT 1", [cleanEmail(session.customer_details.email)])
    : null;
  const dashboardToken = existingPurchase?.dashboard_token || lead?.dashboard_token || crypto.randomUUID().replace(/-/g, "");
  const deliveryUrl = product?.checkoutType === "digital_product"
    ? `/downloads/ai-agent-launch-kit?checkout=success&product=${encodeURIComponent(product?.id || productId)}&session_id=${encodeURIComponent(session.id)}`
    : `/onboarding?checkout=success&product=${encodeURIComponent(product?.id || productId)}&session_id=${encodeURIComponent(session.id)}`;
  const purchase = await dbUpsertPurchase(env, {
    id: existingPurchase?.id,
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent || "",
    package_id: product?.packageTier || productId,
    package_name: product?.name || productId,
    package_tier: product?.packageTier || productId,
    checkout_type: product?.checkoutType || session.metadata?.checkout_type || "setup",
    amount_cents: Number(session.amount_total || 0),
    currency: cleanText(session.currency || "usd", 12),
    customer_email: session.customer_details?.email || session.customer_email || "",
    source_page: session.metadata?.source_page || "/pricing",
    lead_id: lead?.id || "",
    status: "paid",
    dashboard_token: dashboardToken,
    onboarding_url: deliveryUrl,
    metadata_json: session.metadata || {},
    consent_marketing: session.consent?.promotions || false,
    fulfillment_status: "purchase_received",
  });

  if (lead) {
    await dbUpsertLead(env, {
      ...lead,
      purchase_id: purchase.id,
      dashboard_token: dashboardToken,
      crm_stage: "purchase_received",
      lead_status: lead.lead_status || "WARM",
      follow_up_status: "queued",
    });
  }

  const email = buildPostPurchaseEmail(env, purchase);
  await maybeSendCustomerEmail(env, purchase.customer_email || "", email.subject, email.text, email.html);
  await sendWebhook(env, "purchase", purchase);
  return purchase;
}

async function handleCheckout(request, env) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }
  const rate = await rateLimit(env, request, "checkout");
  if (!rate.ok) {
    return jsonResponse({ ok: false, error: "Rate limited.", retryAfter: rate.retryAfter }, 429);
  }
  const productId = cleanText(body.productId || body.packageId || "", 120);
  const result = await createStripeCheckout(env, request, productId, { body });
  if (!result.ok) {
    return jsonResponse({ ok: false, error: result.error }, result.status || 500);
  }
  return jsonResponse({
    ok: true,
    checkoutUrl: result.checkoutUrl,
    sessionId: result.sessionId,
    product: result.product,
  });
}

async function handleStripeWebhook(request, env, ctx) {
  if (!stripeReady(env)) {
    return jsonResponse({ ok: false, error: "Stripe is not configured." }, 503);
  }
  const signature = request.headers.get("stripe-signature") || "";
  const rawBody = await readRequestText(request, MAX_STRIPE_WEBHOOK_BODY_BYTES);
  if (rawBody === BODY_TOO_LARGE) return payloadTooLargeResponse(MAX_STRIPE_WEBHOOK_BODY_BYTES);
  const secret = String(env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    return jsonResponse({ ok: false, error: "STRIPE_WEBHOOK_SECRET is not configured." }, 503);
  }
  const verified = await verifyStripeSignature(rawBody, signature, secret);
  if (!verified.ok) {
    return jsonResponse({ ok: false, error: verified.error }, 400);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON payload." }, 400);
  }
  if (event.type !== "checkout.session.completed") {
    return jsonResponse({ ok: true, ignored: true, type: event.type });
  }

  const session = event.data?.object || {};
  const purchase = await storePurchaseFromSession(env, session);
  if (purchase) {
    ctx && ctx.waitUntil && ctx.waitUntil(dbInsertEvent(env, {
      event_name: "deposit_paid",
      source_page: purchase.source_page || "/pricing",
      lead_id: purchase.lead_id || "",
      session_id: purchase.stripe_session_id || "",
      properties_json: {
        amount: purchase.amount_cents,
        packageName: purchase.package_name,
        checkoutType: purchase.checkout_type,
      },
      user_agent: request.headers.get("user-agent") || "",
    }));
  }

  return jsonResponse({ ok: true, purchaseId: purchase?.id || null });
}

function onboardingFieldDefinitions() {
  return [
    { name: "businessName", label: "Business name", placeholder: "Your business name", required: true },
    { name: "websiteUrl", label: "Website URL", type: "url", placeholder: "https://yourbusiness.com", required: true },
    { name: "businessType", label: "Business type", type: "select", options: businessTypeCatalog(), required: true },
    { name: "mainService", label: "Main service or product sold", placeholder: "What do you sell?", required: true },
    { name: "targetCustomers", label: "Target customers", placeholder: "Who do you serve?", required: true },
    { name: "mainProblem", label: "Main problem you want solved", type: "textarea", rows: 4, placeholder: "What should the agent fix first?", required: true },
    { name: "currentLeadProcess", label: "Current lead process", type: "textarea", rows: 4, placeholder: "How do leads come in today?", required: true },
    { name: "currentFollowupProcess", label: "Current follow-up process", type: "textarea", rows: 4, placeholder: "What happens after the lead arrives?", required: true },
    { name: "commonQuestions", label: "Common customer questions", type: "textarea", rows: 4, placeholder: "What do customers ask most often?", required: true },
    { name: "servicesOffered", label: "Services or packages offered", type: "textarea", rows: 4, placeholder: "List your services or packages.", required: true },
    { name: "pricingInformation", label: "Pricing information, if available", type: "textarea", rows: 3, placeholder: "Share the pricing details you want the agent to know.", required: false },
    { name: "businessHours", label: "Business hours", placeholder: "Mon-Fri 9am-5pm", required: true },
    { name: "serviceArea", label: "Service area", placeholder: "City, region, or national", required: true },
    { name: "contactMethods", label: "Contact methods", placeholder: "Email, phone, text, contact form", required: true },
    { name: "bookingProcess", label: "Booking process", type: "textarea", rows: 3, placeholder: "How do people book today?", required: true },
    { name: "toolsUsed", label: "CRM, calendar, email, or software used", type: "textarea", rows: 3, placeholder: "List the tools that need to connect.", required: true },
    { name: "staffAlerts", label: "Staff members who should receive alerts", placeholder: "Owner, office manager, dispatcher...", required: true },
    { name: "tone", label: "Tone the AI agent should use", placeholder: "Professional, direct, warm, etc.", required: true },
    { name: "allowedToSay", label: "What the agent is allowed to say", type: "textarea", rows: 3, placeholder: "Approved language or claims.", required: true },
    { name: "neverToSay", label: "What the agent must never say", type: "textarea", rows: 3, placeholder: "Unapproved claims, sensitive topics, etc.", required: true },
    { name: "escalationRules", label: "Escalation rules", type: "textarea", rows: 3, placeholder: "When should the agent hand off?", required: true },
    { name: "complianceConcerns", label: "Compliance or privacy concerns", type: "textarea", rows: 3, placeholder: "Note any rules we need to respect.", required: true },
    { name: "trainingFiles", label: "Files, FAQs, service lists, scripts, or documents to train the agent", type: "textarea", rows: 4, placeholder: "Paste file names, URLs, or doc titles.", required: true },
    { name: "desiredLaunchDate", label: "Desired launch date", type: "date", required: true },
  ];
}

function renderOnboardingPage(env, context = {}) {
  const checkoutSessionId = cleanText(context.sessionId || "", 160);
  const dashboardToken = cleanText(context.dashboardToken || "", 180);
  const paypalOrderId = cleanText(context.paypalOrderId || "", 80);
  const paypalAccessToken = cleanText(context.paypalAccessToken || "", 180);
  const packageName = cleanText(context.packageName || "", 120) || "Starter Agent";

  const form = renderLeadForm({
    action: "/api/onboarding",
    formId: "onboarding-form",
    cta: "Generate My AI Agent Build Plan",
    note: "Answer a few questions so we can design the exact AI agent your business needs.",
    turnstileHtml: renderTurnstileWidget(env),
    successId: "onboarding-status",
    dataAttrs: 'data-preview-target="#blueprint-preview"',
    fields: [
      ...onboardingFieldDefinitions(),
      { name: "packageTier", type: "hidden", value: packageName },
      { name: "sessionId", type: "hidden", value: checkoutSessionId },
      { name: "dashboardToken", type: "hidden", value: dashboardToken },
      { name: "paypalOrderId", type: "hidden", value: paypalOrderId },
      { name: "paypalAccessToken", type: "hidden", value: paypalAccessToken },
    ],
  });

  const confirmation = `
    <section class="hero compact">
      ${renderSectionTitle("Client Onboarding", "Let’s Build Your AI Agent", "Answer a few questions so we can design the exact AI agent your business needs.")}
      <p class="confirmation">Your AI agent setup has started. The next step is to complete your onboarding form so we can design the exact AI agent your business needs. Once submitted, we will generate your AI Agent Build Plan and begin preparing your agent workflow.</p>
      ${checkoutSessionId ? `<p class="status-pill">Checkout session: ${escapeHtml(checkoutSessionId)}</p>` : ""}
      <p class="status-pill">Verified purchase: ${escapeHtml(packageName)}</p>
    </section>
  `;

  const body = `
    ${confirmation}
    <section class="section split-section">
      <div>${form}</div>
      <div class="blueprint-preview" id="blueprint-preview">
        <p class="card-kicker">Preview</p>
        <strong>Your AI Agent Build Plan will appear here after submission.</strong>
        <p>This includes the customer-facing build plan, internal build plan, and the first workflow map.</p>
      </div>
    </section>
    <section class="section">
      ${renderSectionTitle("What the build plan includes", "Your deliverable starts immediately", "")}
      ${renderCardGrid([
        { title: "Customer-facing blueprint", description: "A clear summary of what we are building and what it will do." },
        { title: "Internal technical build plan", description: "Prompt instructions, workflow logic, automation rules, and integrations." },
        { title: "Lead capture structure", description: "Questions, qualification rules, and handoff paths." },
        { title: "Follow-up sequence", description: "A simple five-email follow-up sequence prepared for consented leads." },
      ])}
    </section>
  `;

  return renderShell(env, {
    path: "/onboarding",
    title: "Client Onboarding",
    description: "Collect the business details needed to design the exact AI agent workflow.",
    body,
    robots: "noindex,nofollow",
    bodyClass: "page-onboarding",
    privatePage: true,
  });
}

function renderOnboardingAccessRequiredPage(env) {
  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderPageTitle("Customer access", "A verified purchase is required", "Open the secure onboarding link returned after payment, or purchase an eligible package first.")}
        <div class="button-row">
          <a class="button-primary" href="/pricing">View verified offers</a>
          <a class="button-secondary" href="/contact">Contact support</a>
        </div>
      </div>
    </section>`;
  return renderShell(env, {
    path: "/onboarding",
    title: "Verified Purchase Required",
    description: "Secure customer onboarding requires a verified purchase.",
    body,
    robots: "noindex,nofollow,noarchive",
    bodyClass: "page-onboarding",
    privatePage: true,
  });
}

async function handleOnboarding(request, env, ctx) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const rate = await rateLimit(env, request, "onboarding");
  if (!rate.ok) {
    return jsonResponse({ ok: false, error: "Rate limited.", retryAfter: rate.retryAfter }, 429);
  }

  const access = await verifyOnboardingAccess(env, body);
  if (!access.ok) {
    return jsonResponse({ ok: false, error: "A verified paid purchase is required for onboarding." }, 403);
  }

  if (!(await verifyTurnstile(body, request, env))) {
    return jsonResponse({ ok: false, error: "Turnstile verification failed." }, 403);
  }

  const required = [
    "businessName",
    "websiteUrl",
    "businessType",
    "mainService",
    "targetCustomers",
    "mainProblem",
    "currentLeadProcess",
    "currentFollowupProcess",
    "commonQuestions",
    "servicesOffered",
    "businessHours",
    "serviceArea",
    "contactMethods",
    "bookingProcess",
    "toolsUsed",
    "staffAlerts",
    "tone",
    "allowedToSay",
    "neverToSay",
    "escalationRules",
    "complianceConcerns",
    "trainingFiles",
    "desiredLaunchDate",
    "packageTier",
  ];
  const missing = validateRequiredFields(body, required);
  if (missing.length) {
    return jsonResponse({ ok: false, error: `Missing required fields: ${missing.join(", ")}` }, 400);
  }

  const packageName = cleanText(access.packageName || "Starter Agent", 120);
  const businessType = cleanText(body.businessType || "", 120);
  const agentRecommendation = recommendedAgentForBusinessType(businessType);
  const artifacts = buildBlueprintArtifacts({
    businessName: cleanText(body.businessName || "", 160),
    businessType,
    packageName,
    mainProblem: cleanText(body.mainProblem || "", 300),
    desiredAutomation: cleanText(body.currentLeadProcess || body.mainProblem || "", 300),
    allowedToSay: cleanText(body.allowedToSay || "", 500),
    neverToSay: cleanText(body.neverToSay || "", 500),
    escalationRules: cleanText(body.escalationRules || "", 1000),
    tone: cleanText(body.tone || "", 200),
    complianceConcerns: cleanText(body.complianceConcerns || "", 1000),
    recommendedAgentType: agentRecommendation.agentType,
    agentName: agentRecommendation.agentType,
    toolsUsed: cleanText(body.toolsUsed || "", 500),
    dataFields: [
      "Business name",
      "Website URL",
      "Business type",
      "Main service",
      "Target customers",
      "Main problem",
      "Current lead process",
      "Current follow-up process",
      "Common questions",
    ],
    nextAction: "Review the build plan, confirm any missing integrations, and move into implementation.",
  });

  const leadId = cleanText(access.purchase?.lead_id || "", 120);
  const purchaseId = cleanText(access.purchaseId || "", 120);
  const dashboardToken = cleanText(access.dashboardToken || "", 180);
  const buildStatusStage = "blueprint_generated";
  const buildStatusIndex = BUILD_STAGES.indexOf(buildStatusStage);

  const onboarding = await dbUpsertOnboarding(env, {
    lead_id: leadId,
    purchase_id: purchaseId,
    package_tier: packageName,
    business_name: cleanText(body.businessName || "", 160),
    website_url: cleanUrl(body.websiteUrl || ""),
    business_type: businessType,
    main_service: cleanText(body.mainService || "", 200),
    target_customers: cleanText(body.targetCustomers || "", 300),
    main_problem: cleanText(body.mainProblem || "", 300),
    current_lead_process: cleanText(body.currentLeadProcess || "", 300),
    current_followup_process: cleanText(body.currentFollowupProcess || "", 300),
    common_questions: cleanText(body.commonQuestions || "", 1000),
    services_offered: cleanText(body.servicesOffered || "", 1000),
    pricing_information: cleanText(body.pricingInformation || "", 500),
    business_hours: cleanText(body.businessHours || "", 200),
    service_area: cleanText(body.serviceArea || "", 200),
    contact_methods: cleanText(body.contactMethods || "", 300),
    booking_process: cleanText(body.bookingProcess || "", 300),
    tools_used: cleanText(body.toolsUsed || "", 500),
    staff_alerts: cleanText(body.staffAlerts || "", 500),
    tone: cleanText(body.tone || "", 200),
    allowed_to_say: cleanText(body.allowedToSay || "", 500),
    never_to_say: cleanText(body.neverToSay || "", 500),
    escalation_rules: cleanText(body.escalationRules || "", 1000),
    compliance_concerns: cleanText(body.complianceConcerns || "", 1000),
    training_files: cleanText(body.trainingFiles || "", 2000),
    desired_launch_date: cleanText(body.desiredLaunchDate || "", 80),
    build_status_stage: buildStatusStage,
    build_status_index: buildStatusIndex,
    recommended_agent_name: artifacts.agentName,
    recommended_agent_type: artifacts.recommendedAgentType,
    customer_blueprint_html: artifacts.customerBlueprintHtml,
    internal_blueprint_json: artifacts.internalBlueprintJson,
    agent_blueprint_json: { packageName, agentType: artifacts.recommendedAgentType },
    system_prompt_text: artifacts.systemPrompt,
    integration_plan_json: {
      toolsUsed: cleanText(body.toolsUsed || "", 500),
      businessType,
      packageName,
    },
    dashboard_token: dashboardToken,
    launch_notes: "Customer completed onboarding and generated the first build plan.",
  });

  if (leadId) {
    await dbUpsertLead(env, {
      id: leadId,
      onboarding_id: onboarding.id,
      crm_stage: buildStatusStage,
      lead_status: "WARM",
      dashboard_token: dashboardToken,
      lead_score: 60,
      next_action: "Review the build plan and confirm integrations.",
      recommended_package: packageName,
      recommended_agent_type: artifacts.recommendedAgentType,
    });
  }

  if (purchaseId) {
    await env.GMP_DB.prepare(`UPDATE agentid_purchases
      SET fulfillment_status = ?, dashboard_token = ?, onboarding_url = ?, updated_at = datetime('now')
      WHERE id = ? AND status = 'paid'`)
      .bind(buildStatusStage, dashboardToken, `/customer-dashboard?token=${encodeURIComponent(dashboardToken)}`, purchaseId)
      .run();
  }

  await dbInsertEvent(env, {
    event_name: "onboarding_completed",
    source_page: "/onboarding",
    lead_id: leadId,
    properties_json: {
      packageName,
      buildStatusStage,
      recommendedAgentType: artifacts.recommendedAgentType,
    },
    user_agent: request.headers.get("user-agent") || "",
  });

  ctx && ctx.waitUntil && ctx.waitUntil(sendWebhook(env, "onboarding_completed", onboarding));

  const response = {
    ok: true,
    message: "Your AI Agent Build Plan is ready.",
    leadTag: "WARM",
    recommendedPackage: packageName,
    recommendedAgentType: artifacts.recommendedAgentType,
    summary: `${packageName} build plan generated for ${cleanText(body.businessName || "", 160)}.`,
    nextAction: "Review the build plan, confirm integrations, and move into implementation.",
    dashboardUrl: `/customer-dashboard?token=${encodeURIComponent(dashboardToken)}`,
    customerBlueprintHtml: artifacts.customerBlueprintHtml,
    internalBlueprintJson: artifacts.internalBlueprintJson,
    leadId,
    onboardingId: onboarding.id,
    packageTier: packageName,
    trackEvent: "agent_blueprint_generated",
  };

  return jsonResponse(response);
}

async function timingSafeStringEqual(candidate, expected) {
  if (!candidate || !expected) return false;
  const encoder = new TextEncoder();
  const [candidateDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const candidateBytes = new Uint8Array(candidateDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let diff = 0;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    diff |= candidateBytes[index] ^ expectedBytes[index];
  }
  return diff === 0;
}

async function hasAdminAccess(request, env) {
  const expected = String(env.ADMIN_TOKEN || "").trim();
  if (!expected) return false;
  const header = request.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  return timingSafeStringEqual(bearer, expected);
}

function renderLookupPanel({ action, name = "token", placeholder = "Enter your access token", button = "Open Dashboard", note = "" }) {
  return `
    <form class="lookup-form" method="GET" action="${escapeHtml(action)}">
      <input type="text" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" required>
      <button class="button-primary" type="submit">${escapeHtml(button)}</button>
      ${note ? `<p class="form-note">${escapeHtml(note)}</p>` : ""}
    </form>`;
}

function renderStageTimeline(stage) {
  const activeIndex = BUILD_STAGES.indexOf(stage);
  return `
    <div class="timeline-grid">
      ${BUILD_STAGES.map((item, index) => `
        <div class="timeline-step ${index <= activeIndex ? "active" : ""}">
          <strong>${escapeHtml(stageLabel(item))}</strong>
          <span>${index <= activeIndex ? "Complete or current" : "Upcoming"}</span>
        </div>
      `).join("")}
    </div>`;
}

function renderKeyValueList(items) {
  return `
    <div class="key-value-list">
      ${items.map((item) => `<div class="kv"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value || "Not provided")}</strong></div>`).join("")}
    </div>`;
}

function renderRows(rows, columns) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${columns.map((column) => `<td>${escapeHtml(String(column.value(row) ?? ""))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}



async function verifyStripeSignature(rawBody, signature, webhookSecret) {
  const parts = Object.fromEntries(signature.split(",").map((part) => {
    const [key, value] = part.split("=", 2);
    return [key, value];
  }));
  const timestamp = parts.t;
  const expectedSignature = parts.v1;
  if (!timestamp || !expectedSignature) {
    return { ok: false, error: "Missing Stripe signature fields." };
  }
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
    return { ok: false, error: "Stripe signature timestamp is outside tolerance." };
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${rawBody}`));
  const actualSignature = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return actualSignature === expectedSignature
    ? { ok: true }
    : { ok: false, error: "Invalid Stripe signature." };
}




function recommendedPackageAmount(packageName) {
  return packagePriceCents(packageName);
}

function recommendedAgentTypeForPackage(businessType, packageName, desiredAutomation) {
  const base = recommendedAgentForBusinessType(businessType);
  if (packageName === "Business Automation Suite") {
    if (/operations|internal|workflow|staff/.test(String(desiredAutomation || "").toLowerCase())) {
      return "Operations Assistant Agent";
    }
    return base.agentType.includes("Agent") ? base.agentType : "Operations Assistant Agent";
  }
  if (base.agentType) return base.agentType;
  return packageName === "Starter Agent" ? "Website Sales Agent" : "Lead Capture and Booking Agent";
}

function buildAgentPrompt({ businessName, businessType, packageName, mainProblem, desiredAutomation, allowedToSay, neverToSay, escalationRules, tone, complianceConcerns, recommendedAgentType }) {
  return [
    `You are the AI assistant for ${businessName || "the business"}.`,
    `Your job is to help visitors understand the business, answer approved questions, collect lead information, qualify the request, recommend the next step, and notify the business owner when a qualified lead is captured.`,
    `You must be professional, clear, helpful, and sales-focused.`,
    `You must not make unsupported claims, guarantee results, provide regulated advice, or pretend to be human.`,
    `Tone: ${tone || "professional, direct, modern, confident, practical, and sales-focused"}.`,
    `Business type: ${businessType || "not specified"}.`,
    `Primary problem to solve: ${mainProblem || "not specified"}.`,
    `Desired automation: ${desiredAutomation || "not specified"}.`,
    `Recommended agent type: ${recommendedAgentType || "Website Sales Agent"}.`,
    `Package focus: ${packageName || "Starter Agent"}.`,
    allowedToSay ? `You may say: ${allowedToSay}.` : "",
    neverToSay ? `You must never say: ${neverToSay}.` : "",
    escalationRules ? `Escalate when: ${escalationRules}.` : "",
    complianceConcerns ? `Compliance notes: ${complianceConcerns}.` : "",
    `Your main objective is to move the visitor toward booking, a quote request, a deposit, or the correct package.`,
    `If the visitor only wants a basic chatbot but mentions leads, follow-up, missed calls, scheduling, quote requests, CRM, sales problems, or customer intake, recommend the Growth Agent System.`,
    `If the visitor mentions multiple departments, staff workflows, reporting, dashboards, multiple tools, or several agents, recommend the Business Automation Suite.`,
    `Keep responses short, useful, and action-oriented.`,
    `When you have enough information, produce a structured summary of the lead and the next action.`,
  ].filter(Boolean).join("\n");
}

function buildCustomerBlueprint({ businessName, packageName, agentName, agentType, businessType, mainProblem, desiredAutomation, toolsUsed, dataFields, nextAction, complianceNotes }) {
  const sections = [
    {
      title: "1. What We Are Building",
      body: `${agentName} for ${businessName || "your business"}: ${agentType} designed to support ${businessType || "your workflow"} and solve ${mainProblem || "your current bottleneck"}.`,
    },
    {
      title: "2. What Your Agent Will Do",
      body: desiredAutomation || "Answer questions, capture lead details, and move the request forward.",
    },
    {
      title: "3. What Your Agent Will Ask Customers",
      body: "Name, email, phone, business need, timing, and any workflow-specific details required to qualify the request.",
    },
    {
      title: "4. How Leads Will Be Captured",
      body: "The agent will collect structured lead data, create a summary, and route it to your team or CRM.",
    },
    {
      title: "5. How Follow-Up Will Work",
      body: "The system will tag the lead, prepare the follow-up sequence, and surface the next action for the owner.",
    },
    {
      title: "6. What Happens When a Lead Is Hot",
      body: "Hot leads get a fast recommendation, immediate booking or quote guidance, and owner notification.",
    },
    {
      title: "7. What Information We Still Need",
      body: toolsUsed || "A few more integration details and your final workflow preferences if anything is still missing.",
    },
    {
      title: "8. What Tools Need To Be Connected",
      body: "Website forms, email, CRM, calendar, task board, and any other tools listed in onboarding.",
    },
    {
      title: "9. What You Will Receive",
      body: `${packageName || "Starter Agent"} deliverables, agent instructions, lead capture structure, follow-up sequence, and next-step instructions.`,
    },
    {
      title: "10. Next Steps",
      body: nextAction || "Review the build plan, confirm integrations, and move into implementation.",
    },
  ];

  return `
    <section class="blueprint">
      <header>
        <p class="eyebrow">Customer-Facing Blueprint</p>
        <h2>Your AI Agent Build Plan</h2>
        <p>${businessName || "Your business"} will receive a custom build plan designed around the workflow you described.</p>
      </header>
      <div class="blueprint-grid">
        ${sections.map((section) => `
          <article class="blueprint-card">
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.body)}</p>
          </article>
        `).join("")}
      </div>
      <div class="blueprint-footer">
        <div><strong>Agent name:</strong> ${escapeHtml(agentName || "AI Agent")}</div>
        <div><strong>Agent type:</strong> ${escapeHtml(agentType || "Website Sales Agent")}</div>
        <div><strong>Compliance notes:</strong> ${escapeHtml(complianceNotes || "No special compliance notes provided.")}</div>
      </div>
    </section>`;
}

function buildInternalBlueprint({ client, packageName, agentType, requiredFeatures, integrations, dataModel, prompt, workflowLogic, automationRules, escalationRules, testingRequirements, deliveryChecklist, supportPlan }) {
  const sections = [
    ["1. Client Details", client],
    ["2. Purchased Package", packageName],
    ["3. Agent Type", agentType],
    ["4. Required Features", requiredFeatures],
    ["5. Required Integrations", integrations],
    ["6. Data Model", dataModel],
    ["7. Prompt Instructions", prompt],
    ["8. Workflow Logic", workflowLogic],
    ["9. Automation Rules", automationRules],
    ["10. Escalation Rules", escalationRules],
    ["11. Testing Requirements", testingRequirements],
    ["12. Delivery Checklist", deliveryChecklist],
    ["13. Support Plan", supportPlan],
  ];

  return {
    generatedAt: new Date().toISOString(),
    sections: sections.map(([title, body]) => ({ title, body })),
  };
}

function buildBlueprintArtifacts(input) {
  const recommendedAgentType = input.recommendedAgentType || recommendedAgentTypeForPackage(input.businessType, input.packageName, input.desiredAutomation);
  const agentName = input.agentName || recommendedAgentType;
  const systemPrompt = buildAgentPrompt({
    businessName: input.businessName,
    businessType: input.businessType,
    packageName: input.packageName,
    mainProblem: input.mainProblem,
    desiredAutomation: input.desiredAutomation,
    allowedToSay: input.allowedToSay,
    neverToSay: input.neverToSay,
    escalationRules: input.escalationRules,
    tone: input.tone,
    complianceConcerns: input.complianceConcerns,
    recommendedAgentType,
  });

  const customerBlueprintHtml = buildCustomerBlueprint({
    businessName: input.businessName,
    packageName: input.packageName,
    agentName,
    agentType: recommendedAgentType,
    businessType: input.businessType,
    mainProblem: input.mainProblem,
    desiredAutomation: input.desiredAutomation,
    toolsUsed: input.toolsUsed,
    dataFields: input.dataFields,
    nextAction: input.nextAction,
    complianceNotes: input.complianceConcerns,
  });

  const internalBlueprintJson = buildInternalBlueprint({
    client: `${input.businessName || "Client"} · ${input.businessType || "Business"}`,
    packageName: input.packageName,
    agentType: recommendedAgentType,
    requiredFeatures: input.requiredFeatures || [
      "Lead capture",
      "Qualification flow",
      "Owner notifications",
      "Analytics events",
    ],
    integrations: input.integrations || [
      "Website",
      "Email",
      "CRM",
      "Calendar",
      "Task board",
    ],
    dataModel: input.dataModel || [
      "Lead record",
      "Onboarding record",
      "Purchase record",
      "Event log",
    ],
    prompt: systemPrompt,
    workflowLogic: input.workflowLogic || [
      "Greet the visitor",
      "Qualify the lead",
      "Recommend the best package",
      "Capture contact details",
      "Route to booking, quote, or deposit",
    ],
    automationRules: input.automationRules || [
      "Hot lead => owner alert",
      "Warm lead => follow-up sequence",
      "Cold lead => education and permission",
    ],
    escalationRules: input.escalationRules || [
      "Escalate sensitive or regulated questions to the owner",
      "Escalate ambiguous requests to a human review",
    ],
    testingRequirements: input.testingRequirements || [
      "Validate forms",
      "Check lead scoring",
      "Verify CTA routing",
      "Confirm analytics events",
    ],
    deliveryChecklist: input.deliveryChecklist || [
      "Customer-facing blueprint",
      "Internal build plan",
      "Agent prompt draft",
      "Follow-up sequence",
    ],
    supportPlan: input.supportPlan || "Launch support, optimization, and update cycles based on the selected package.",
  });

  return {
    packageName: input.packageName,
    agentName,
    recommendedAgentType,
    systemPrompt,
    customerBlueprintHtml,
    internalBlueprintJson,
  };
}

async function loadAgentIdStats(env) {
  if (!env.GMP_DB) {
    return {
      totalLeads: 0,
      hotLeads: 0,
      bookedCalls: 0,
      quoteRequests: 0,
      depositsReceived: 0,
      estimatedPipelineCents: 0,
      conversionRate: 0,
      mostRequestedAutomation: [],
      mostCommonObjections: [],
      activeBuilds: 0,
      awaitingOnboarding: 0,
      readyForReview: 0,
      latestLeads: [],
      latestPurchases: [],
      latestOnboarding: [],
      latestEvents: [],
    };
  }

  await ensureAgentIdSchema(env);
  const [
    totalLeadRow,
    hotLeadRow,
    bookedCallRow,
    quoteRequestRow,
    depositRow,
    awaitingOnboardingRow,
    pipelineRow,
    automationRows,
    objectionRows,
    activeBuildRow,
    reviewRow,
    leads,
    purchases,
    onboarding,
    events,
  ] = await Promise.all([
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_leads"),
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_leads WHERE lead_status = 'HOT'"),
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_leads WHERE booked_call = 1 OR crm_stage = 'strategy_call_booked'"),
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_leads WHERE quote_requested = 1 OR crm_stage = 'proposal_sent'"),
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_purchases WHERE status = 'paid' AND checkout_type = 'deposit'"),
    queryD1First(
      env,
      `SELECT COUNT(*) AS value
       FROM agentid_purchases
       WHERE status = 'paid'
         AND checkout_type = 'deposit'
         AND id NOT IN (
           SELECT purchase_id
           FROM agentid_onboarding
           WHERE purchase_id IS NOT NULL AND purchase_id != ''
         )`
    ),
    queryD1First(
      env,
      `SELECT SUM(
        CASE recommended_package
          WHEN 'Starter Agent' THEN 49700
          WHEN 'Growth Agent System' THEN 149700
          WHEN 'Business Automation Suite' THEN 350000
          ELSE 0
        END
      ) AS value
      FROM agentid_leads
      WHERE crm_stage NOT IN ('won', 'lost')`
    ),
    queryD1All(
      env,
      `SELECT automation_theme AS label, COUNT(*) AS value
       FROM agentid_leads
       WHERE automation_theme IS NOT NULL AND automation_theme != ''
       GROUP BY automation_theme
       ORDER BY value DESC
       LIMIT 5`
    ),
    queryD1All(
      env,
      `SELECT common_objection AS label, COUNT(*) AS value
       FROM agentid_leads
       WHERE common_objection IS NOT NULL AND common_objection != ''
       GROUP BY common_objection
       ORDER BY value DESC
       LIMIT 5`
    ),
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_onboarding WHERE build_status_stage NOT IN ('live', 'optimization')"),
    queryD1First(env, "SELECT COUNT(*) AS value FROM agentid_onboarding WHERE build_status_stage = 'client_review'"),
    dbListLeads(env, 12),
    dbListPurchases(env, 12),
    dbListOnboarding(env, 12),
    dbListEvents(env, 12),
  ]);

  const totalLeads = Number(totalLeadRow?.value || 0);
  const hotLeads = Number(hotLeadRow?.value || 0);
  const bookedCalls = Number(bookedCallRow?.value || 0);
  const quoteRequests = Number(quoteRequestRow?.value || 0);
  const depositsReceived = Number(depositRow?.value || 0);
  const awaitingOnboarding = Number(awaitingOnboardingRow?.value || 0);
  const estimatedPipelineCents = Number(pipelineRow?.value || 0);
  const conversionRate = totalLeads ? Math.round(((bookedCalls + depositsReceived) / totalLeads) * 100) / 100 : 0;

  return {
    totalLeads,
    hotLeads,
    bookedCalls,
    quoteRequests,
    depositsReceived,
    estimatedPipelineCents,
    conversionRate,
    mostRequestedAutomation: automationRows.map((row) => ({
      label: row.label || "lead capture",
      value: Number(row.value || 0),
    })),
    mostCommonObjections: objectionRows.map((row) => ({
      label: row.label || "unknown",
      value: Number(row.value || 0),
    })),
    activeBuilds: Number(activeBuildRow?.value || 0),
    awaitingOnboarding,
    readyForReview: Number(reviewRow?.value || 0),
    latestLeads: leads,
    latestPurchases: purchases,
    latestOnboarding: onboarding,
    latestEvents: events,
  };
}

async function loadAttributionHealth(env, requestedDays = 7) {
  const days = Math.max(1, Math.min(90, Math.round(Number(requestedDays) || 7)));
  const windowModifier = `-${days} days`;
  const empty = {
    ok: true,
    generatedAt: new Date().toISOString(),
    windowDays: days,
    status: "no_data",
    statusLabel: "No attribution data yet",
    summary: {
      totalEvents: 0,
      totalSessions: 0,
      taggedEvents: 0,
      taggedSessions: 0,
      referredEvents: 0,
      chatOpens: 0,
      chatPromptViews: 0,
      leadEvents: 0,
      taggedCoverageRate: 0,
      coverageBasis: "events",
      firstSeenAt: null,
      latestSeenAt: null,
    },
    channels: [],
    landingPages: [],
    events: [],
    daily: [],
    privacy: "Aggregate counts only. QA traffic, visitor identifiers, user agents, contact details, and raw event properties are excluded.",
  };
  if (!env.GMP_DB) return empty;

  const taggedPredicate = `(
    NULLIF(TRIM(json_extract(properties_json, '$.utm_source')), '') IS NOT NULL
    OR NULLIF(TRIM(json_extract(properties_json, '$.utm_medium')), '') IS NOT NULL
    OR NULLIF(TRIM(json_extract(properties_json, '$.utm_campaign')), '') IS NOT NULL
  )`;
  const productionPredicate = `COALESCE(LOWER(TRIM(json_extract(properties_json, '$.utm_medium'))), '') <> 'qa'`;
  const [
    summaryRow,
    channelRows,
    landingRows,
    eventRows,
    dailyRows,
  ] = await Promise.all([
    queryD1First(
      env,
      `SELECT
        COUNT(*) AS total_events,
        COUNT(DISTINCT NULLIF(session_id, '')) AS total_sessions,
        SUM(CASE WHEN ${taggedPredicate} THEN 1 ELSE 0 END) AS tagged_events,
        COUNT(DISTINCT CASE WHEN ${taggedPredicate} THEN NULLIF(session_id, '') END) AS tagged_sessions,
        SUM(CASE WHEN NULLIF(TRIM(json_extract(properties_json, '$.page_referrer')), '') IS NOT NULL THEN 1 ELSE 0 END) AS referred_events,
        SUM(CASE WHEN event_name = 'chat_open' THEN 1 ELSE 0 END) AS chat_opens,
        SUM(CASE WHEN event_name = 'chat_prompt_view' THEN 1 ELSE 0 END) AS chat_prompt_views,
        SUM(CASE WHEN event_name IN ('contact_submit', 'booking_submit', 'lead_magnet_submit', 'lead_captured', 'generate_lead') THEN 1 ELSE 0 END) AS lead_events,
        MIN(created_at) AS first_seen_at,
        MAX(created_at) AS latest_seen_at
       FROM agentid_events
       WHERE datetime(created_at) >= datetime('now', ?)
         AND ${productionPredicate}`,
      [windowModifier],
    ),
    queryD1All(
      env,
      `SELECT
        COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.utm_source')), ''), '(direct / untagged)') AS source,
        COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.utm_medium')), ''), '(none)') AS medium,
        COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.utm_campaign')), ''), '(none)') AS campaign,
        COUNT(*) AS events,
        COUNT(DISTINCT NULLIF(session_id, '')) AS sessions,
        SUM(CASE WHEN event_name = 'chat_open' THEN 1 ELSE 0 END) AS chat_opens,
        SUM(CASE WHEN event_name IN ('contact_submit', 'booking_submit', 'lead_magnet_submit', 'lead_captured', 'generate_lead') THEN 1 ELSE 0 END) AS lead_events,
        MAX(created_at) AS latest_seen_at
       FROM agentid_events
       WHERE datetime(created_at) >= datetime('now', ?)
         AND ${productionPredicate}
       GROUP BY source, medium, campaign
       ORDER BY events DESC, sessions DESC
       LIMIT 20`,
      [windowModifier],
    ),
    queryD1All(
      env,
      `SELECT
        CASE
          WHEN instr(COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.landing_page')), ''), source_page, '/'), '?') > 0
          THEN substr(
            COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.landing_page')), ''), source_page, '/'),
            1,
            instr(COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.landing_page')), ''), source_page, '/'), '?') - 1
          )
          ELSE COALESCE(NULLIF(TRIM(json_extract(properties_json, '$.landing_page')), ''), source_page, '/')
        END AS landing_page,
        COUNT(*) AS events,
        COUNT(DISTINCT NULLIF(session_id, '')) AS sessions,
        SUM(CASE WHEN event_name = 'chat_open' THEN 1 ELSE 0 END) AS chat_opens,
        MAX(created_at) AS latest_seen_at
       FROM agentid_events
       WHERE datetime(created_at) >= datetime('now', ?)
         AND ${productionPredicate}
       GROUP BY landing_page
       ORDER BY events DESC, sessions DESC
       LIMIT 20`,
      [windowModifier],
    ),
    queryD1All(
      env,
      `SELECT
        event_name,
        COUNT(*) AS events,
        COUNT(DISTINCT NULLIF(session_id, '')) AS sessions,
        SUM(CASE WHEN ${taggedPredicate} THEN 1 ELSE 0 END) AS tagged_events,
        MAX(created_at) AS latest_seen_at
       FROM agentid_events
       WHERE datetime(created_at) >= datetime('now', ?)
         AND ${productionPredicate}
       GROUP BY event_name
       ORDER BY events DESC
       LIMIT 30`,
      [windowModifier],
    ),
    queryD1All(
      env,
      `SELECT
        date(created_at) AS day,
        COUNT(*) AS events,
        COUNT(DISTINCT NULLIF(session_id, '')) AS sessions,
        SUM(CASE WHEN ${taggedPredicate} THEN 1 ELSE 0 END) AS tagged_events,
        SUM(CASE WHEN event_name = 'chat_open' THEN 1 ELSE 0 END) AS chat_opens
       FROM agentid_events
       WHERE datetime(created_at) >= datetime('now', ?)
         AND ${productionPredicate}
       GROUP BY day
       ORDER BY day DESC
       LIMIT 90`,
      [windowModifier],
    ),
  ]);

  const summary = {
    totalEvents: Number(summaryRow?.total_events || 0),
    totalSessions: Number(summaryRow?.total_sessions || 0),
    taggedEvents: Number(summaryRow?.tagged_events || 0),
    taggedSessions: Number(summaryRow?.tagged_sessions || 0),
    referredEvents: Number(summaryRow?.referred_events || 0),
    chatOpens: Number(summaryRow?.chat_opens || 0),
    chatPromptViews: Number(summaryRow?.chat_prompt_views || 0),
    leadEvents: Number(summaryRow?.lead_events || 0),
    taggedCoverageRate: 0,
    coverageBasis: Number(summaryRow?.total_sessions || 0) > 0 ? "sessions" : "events",
    firstSeenAt: summaryRow?.first_seen_at || null,
    latestSeenAt: summaryRow?.latest_seen_at || null,
  };
  const coverageTotal = summary.coverageBasis === "sessions" ? summary.totalSessions : summary.totalEvents;
  const coverageTagged = summary.coverageBasis === "sessions" ? summary.taggedSessions : summary.taggedEvents;
  summary.taggedCoverageRate = coverageTotal
    ? Math.round((coverageTagged / coverageTotal) * 1000) / 10
    : 0;

  let status = "collecting";
  let statusLabel = "Collecting a post-fix baseline";
  if (!summary.totalEvents) {
    status = "no_data";
    statusLabel = "No attribution data yet";
  } else if (summary.totalSessions < 5) {
    status = "collecting";
    statusLabel = "Collecting session-level attribution";
  } else if (summary.taggedCoverageRate >= 60) {
    status = "healthy";
    statusLabel = "Strong tagged attribution coverage";
  } else if (summary.taggedCoverageRate >= 20) {
    status = "mixed";
    statusLabel = "Mixed tagged and untagged traffic";
  } else {
    status = "mostly_untagged";
    statusLabel = "Most tracked sessions remain untagged";
  }

  const numericRow = (row, keys) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, keys.includes(key) ? Number(value || 0) : value])
  );

  return {
    ...empty,
    generatedAt: new Date().toISOString(),
    windowDays: days,
    status,
    statusLabel,
    summary,
    channels: channelRows.map((row) => numericRow(row, ["events", "sessions", "chat_opens", "lead_events"])),
    landingPages: landingRows.map((row) => numericRow(row, ["events", "sessions", "chat_opens"])),
    events: eventRows.map((row) => numericRow(row, ["events", "sessions", "tagged_events"])),
    daily: dailyRows.map((row) => numericRow(row, ["events", "sessions", "tagged_events", "chat_opens"])),
  };
}

async function publicAgentState(env) {
  const stats = await loadAgentIdStats(env);
  return {
    ok: true,
    stats,
    pages: AGENTID_PUBLIC_PAGES.map((page) => ({ ...page })),
    buildStages: BUILD_STAGES.map((stage) => ({ key: stage, label: stageLabel(stage) })),
  };
}

const AGENTID_PUBLIC_PAGES = [
  { path: "/", title: "Home", description: "Custom AI agents built to help your business sell, respond, and operate faster." },
  { path: "/services", title: "Services", description: "Custom AI agent services, workflow automation, and AI website buildout." },
  { path: "/ai-agents", title: "AI Agents", description: "The agent types GPTMarketPlus can build for your business." },
  { path: "/pricing", title: "Pricing", description: "Starter, Growth, and Business Automation pricing tiers with deposit options." },
  { path: "/use-cases", title: "Use Cases", description: "Realistic use cases for contractors, real estate, facilities, medical offices, and agencies." },
  { path: "/resources", title: "AI Agent Resources", description: "Practical guides, templates, comparisons, and tools for planning useful business AI agents." },
  ...RESOURCE_PAGES.map((page) => ({ path: page.path, title: page.title, description: page.description })),
  { path: "/tools/ai-automation-roi-calculator", title: "AI Automation ROI Calculator: Estimate Payback and Savings", description: "Estimate monthly time savings, recovered contribution value, operating cost, payback period, and first-year ROI for a proposed AI automation workflow." },
  { path: "/ai-agent-launch-kit", title: "AI Agent Launch Kit", description: "A downloadable workbook, prompt pack, intake template, launch checklist, and 30-day scorecard for your first business AI agent." },
  { path: "/about", title: "About", description: "Practical AI implementation for real businesses." },
  { path: "/contact", title: "Contact", description: "Request your AI agent plan with a validated lead form." },
  { path: "/book-a-consultation", title: "Book a Consultation", description: "Book a free AI strategy call." },
  { path: "/faq", title: "FAQ", description: "Practical answers about AI agents, pricing, security, and setup time." },
  { path: "/onboarding", title: "Client Onboarding", description: "Collect the business details needed to design the exact AI agent workflow." },
  { path: "/customer-dashboard", title: "Customer Dashboard", description: "Track onboarding, blueprint generation, and build progress." },
  { path: "/admin-dashboard", title: "Admin Dashboard", description: "Monitor leads, bookings, purchases, onboarding, and build status." },
  { path: "/privacy", title: "Privacy Policy", description: "Privacy, data usage, and consent terms." },
  { path: "/terms", title: "Terms of Service", description: "Terms and use conditions for GPTMarketPlus." },
  { path: "/refund-policy", title: "Refund Policy", description: "Refund, replacement, and cancellation terms for GPTMarketPlus products and services." },
  { path: "/free-ai-automation-audit-checklist", title: "Free AI Automation Audit Checklist", description: "A form-gated checklist that helps businesses find 10 automation opportunities this month." },
];

function renderNav(activePath) {
  const items = NAV_LINKS.map((item) => `
    <a class="${normalizePath(activePath) === item.path ? "active " : ""}${item.optional ? "nav-optional" : ""}" href="${item.path}">${escapeHtml(item.label)}</a>
  `).join("");

  return `
    <header class="site-nav">
      <div class="nav-brand">
        <a href="/" class="brand-mark" aria-label="${escapeHtml(brandName({}))}">${escapeHtml(brandName({}))}</a>
        <span class="brand-sub">Custom AI agents for business</span>
      </div>
      <nav class="nav-links">${items}</nav>
      <a class="nav-cta" href="/book-a-consultation">Book a Free AI Strategy Call</a>
    </header>`;
}

function renderFooter(env) {
  const currentYear = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div>
        <strong>${escapeHtml(brandName(env))}</strong>
        <p>Custom AI agents that answer, organize, sell, schedule, follow up, and automate work for your business.</p>
      </div>
      <div>
        <strong>Contact</strong>
        <p><a href="mailto:${escapeHtml(contactEmail(env))}">${escapeHtml(contactEmail(env))}</a></p>
        <p><a href="/contact">Request your AI agent plan</a></p>
      </div>
      <div>
        <strong>Resources</strong>
        <p><a href="/resources">Guides &amp; tools</a></p>
        <p><a href="/tools/ai-automation-roi-calculator">ROI calculator</a></p>
        <p><a href="/ai-agent-launch-kit">Launch kit</a></p>
      </div>
      <div>
        <strong>Company</strong>
        <p><a href="/privacy">Privacy Policy</a></p>
        <p><a href="/terms">Terms of Service</a></p>
        <p><a href="/refund-policy">Refund Policy</a></p>
      </div>
      <small>© ${currentYear} ${escapeHtml(brandName(env))}. All rights reserved.</small>
    </footer>`;
}

export function activeSponsorPlacement(env, now = Date.now()) {
  const id = cleanText(env.ACTIVE_SPONSOR_ID || "", 80);
  const name = cleanText(env.ACTIVE_SPONSOR_NAME || "", 120);
  const copy = cleanText(env.ACTIVE_SPONSOR_COPY || "", 240);
  const destinationUrl = cleanUrl(env.ACTIVE_SPONSOR_URL || "");
  if (!id || !name || !copy || !destinationUrl) return null;

  let parsedDestination;
  try {
    parsedDestination = new URL(destinationUrl);
  } catch {
    return null;
  }
  if (parsedDestination.protocol !== "https:") return null;

  const startsAt = Date.parse(String(env.ACTIVE_SPONSOR_START_AT || ""));
  const endsAt = Date.parse(String(env.ACTIVE_SPONSOR_END_AT || ""));
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || startsAt >= endsAt) return null;
  if (now < startsAt || now >= endsAt) return null;

  return {
    id,
    name,
    copy,
    destinationUrl: parsedDestination.toString(),
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
  };
}

function renderSponsorHouseAd(env, path) {
  if (isAgentIdSite(env)) return "";
  const excluded = new Set([
    "/pricing",
    "/contact",
    "/book-a-consultation",
    "/ai-agent-launch-kit",
    "/privacy",
    "/terms",
    "/onboarding",
    "/customer-dashboard",
    "/admin-dashboard",
  ]);
  if (excluded.has(path)) return "";
  const sponsor = activeSponsorPlacement(env);
  if (sponsor) {
    return `
      <aside class="sponsor-house-ad" aria-label="Sponsored placement" data-sponsor-placement="${escapeHtml(sponsor.id)}">
        <div>
          <p class="card-kicker">Sponsored</p>
          <strong>${escapeHtml(sponsor.name)}</strong>
          <span>${escapeHtml(sponsor.copy)}</span>
        </div>
        <a class="button-secondary" href="${escapeHtml(sponsor.destinationUrl)}" target="_blank" rel="sponsored nofollow noopener" data-track-event="sponsor_click" data-track-label="${escapeHtml(sponsor.id)}">Visit sponsor</a>
      </aside>`;
  }
  return `
    <aside class="sponsor-house-ad" aria-label="Advertising opportunity">
      <div>
        <p class="card-kicker">Sponsor placement available</p>
        <strong>Put your AI or business software in front of automation buyers.</strong>
        <span>Apply for a reviewed placement. Billing begins only after relevance, inventory, and fulfillment are confirmed.</span>
      </div>
      <a class="button-secondary" href="/advertise" data-track-event="advertiser_interest" data-track-label="Apply for Sponsor Placement">Apply for review</a>
    </aside>`;
}

function renderShell(env, { path, title, description, body, schema = [], extraHead = "", bodyClass = "", robots = "index,follow,max-image-preview:large", privatePage = false }) {
  const canonical = `${siteUrl(env)}${path}`;
  const ogTitle = `${title} | ${brandName(env)}`;
  const ogDescription = description;
  const ogImage = `${siteUrl(env)}/og-image.svg?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`;
  const schemas = schema.filter(Boolean).map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  ${privatePage ? "" : renderMeasurementHead(env)}
  ${privatePage ? "" : renderAdSenseHead(env, path)}
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${path === "/" ? `<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}">` : ""}
  <title>${escapeHtml(title)} | ${escapeHtml(brandName(env))}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${escapeHtml(robots)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(brandName(env))}">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="theme-color" content="#06111d">
  <meta name="application-name" content="${escapeHtml(brandName(env))}">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  ${schemas}
  ${extraHead}
</head>
<body class="${escapeHtml(bodyClass)}">
  ${privatePage ? "" : renderMeasurementBody(env)}
  ${renderNav(path)}
  <main>
    ${body}
    ${privatePage ? "" : renderAdSenseUnit(env, path)}
    ${renderSponsorHouseAd(env, path)}
  </main>
  ${renderFooter(env)}
  ${privatePage ? "" : renderAnalyticsBootstrap(env)}
  ${renderFormsBootstrap(env)}
  ${privatePage ? "" : renderChatBootstrap(env)}
</body>
</html>`;
}

function renderHeroVisual() {
  return `
    <div class="hero-visual opportunity-scanner" id="opportunity-scanner">
      <div class="scanner-heading">
        <div>
          <p class="visual-label">Free first-party tool</p>
          <h2>Find your best AI opportunity</h2>
        </div>
        <span class="scanner-badge">No signup</span>
      </div>

      <div class="scanner-fields">
        <label>
          <span>Business type</span>
          <select id="scanner-business-type">
            <option value="service">Local or home service</option>
            <option value="professional">Professional service</option>
            <option value="agency">Agency or consultancy</option>
            <option value="ecommerce">E-commerce or retail</option>
            <option value="operations">Operations team</option>
          </select>
        </label>
        <label>
          <span>Monthly inquiries</span>
          <input id="scanner-monthly-leads" type="number" min="0" max="100000" step="1" value="40" inputmode="numeric">
        </label>
        <label>
          <span>Average customer value</span>
          <span class="money-input"><span aria-hidden="true">$</span><input id="scanner-customer-value" type="number" min="0" max="10000000" step="25" value="750" inputmode="decimal"></span>
        </label>
        <label>
          <span>Repetitive admin hours / week</span>
          <input id="scanner-admin-hours" type="number" min="0" max="168" step="1" value="10" inputmode="decimal">
        </label>
      </div>

      <button class="scanner-submit" id="scanner-submit" type="button">Calculate my opportunity <span aria-hidden="true">→</span></button>

      <div class="scanner-results" id="scanner-results" aria-live="polite" hidden>
        <div class="scanner-result-card">
          <span>12% inquiry-value scenario</span>
          <strong id="scanner-opportunity-value">$0</strong>
        </div>
        <div class="scanner-result-card">
          <span>50% admin-time scenario</span>
          <strong id="scanner-hours-value">0 hours / month</strong>
        </div>
        <div class="scanner-recommendation">
          <span>Recommended first build</span>
          <strong id="scanner-agent-value">Lead Capture &amp; Follow-Up Agent</strong>
          <p id="scanner-agent-reason">Respond to inquiries, collect the right details, and keep follow-up moving.</p>
        </div>
        <p class="scanner-disclaimer">Planning scenarios only—not promised revenue, savings, or results. Your actual outcome depends on traffic, close rate, workflow quality, and adoption.</p>
        <div class="scanner-actions">
          <a class="button-primary" href="/book-a-consultation?source=opportunity-scanner" data-track-event="cta_click" data-track-label="Discuss Scanner Result">Discuss my result</a>
          <a class="button-secondary" href="/pricing" data-track-event="cta_click" data-track-label="Scanner View Pricing">View pricing</a>
        </div>
      </div>
    </div>`;
}

function renderOpportunityScannerBootstrap() {
  return `<script>
    (() => {
      const root = document.getElementById("opportunity-scanner");
      if (!root) return;

      const businessType = document.getElementById("scanner-business-type");
      const monthlyLeads = document.getElementById("scanner-monthly-leads");
      const customerValue = document.getElementById("scanner-customer-value");
      const adminHours = document.getElementById("scanner-admin-hours");
      const submit = document.getElementById("scanner-submit");
      const results = document.getElementById("scanner-results");
      const opportunityOutput = document.getElementById("scanner-opportunity-value");
      const hoursOutput = document.getElementById("scanner-hours-value");
      const agentOutput = document.getElementById("scanner-agent-value");
      const reasonOutput = document.getElementById("scanner-agent-reason");

      const clampNumber = (input, minimum, maximum) => {
        const parsed = Number(input.value);
        if (!Number.isFinite(parsed)) return minimum;
        return Math.min(maximum, Math.max(minimum, parsed));
      };

      const recommendationFor = (type, leads, hours) => {
        if (leads >= 80) return {
          name: "Lead Capture & Follow-Up Agent",
          reason: "Prioritize fast qualification, routing, and consistent follow-up across a higher inquiry volume."
        };
        if (hours >= 15 || type === "operations") return {
          name: "Operations Automation Agent",
          reason: "Start with repetitive internal work, structured handoffs, summaries, and task creation."
        };
        if (type === "ecommerce") return {
          name: "Customer Support & Sales Agent",
          reason: "Answer common product questions, guide buyers, and route exceptions to a person."
        };
        if (type === "professional" || type === "agency") return {
          name: "Client Intake & Scheduling Agent",
          reason: "Collect project details, qualify fit, and move good inquiries toward a scheduled call."
        };
        return {
          name: "Lead Capture & Follow-Up Agent",
          reason: "Respond to inquiries, collect the right details, and keep follow-up moving."
        };
      };

      submit.addEventListener("click", () => {
        const leads = clampNumber(monthlyLeads, 0, 100000);
        const value = clampNumber(customerValue, 0, 10000000);
        const hours = clampNumber(adminHours, 0, 168);
        const opportunityScenario = leads * 0.12 * value;
        const monthlyHoursScenario = hours * 4.33 * 0.5;
        const recommendation = recommendationFor(businessType.value, leads, hours);

        opportunityOutput.textContent = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(opportunityScenario) + " / month";
        hoursOutput.textContent = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(monthlyHoursScenario) + " hours / month";
        agentOutput.textContent = recommendation.name;
        reasonOutput.textContent = recommendation.reason;
        results.hidden = false;
        submit.textContent = "Recalculate opportunity";

        if (window.agentidTrackEvent) {
          window.agentidTrackEvent("opportunity_scan_completed", {
            businessType: businessType.value,
            monthlyLeadsBand: leads < 25 ? "under_25" : leads < 80 ? "25_79" : "80_plus",
            adminHoursBand: hours < 5 ? "under_5" : hours < 15 ? "5_14" : "15_plus",
            recommendedAgent: recommendation.name
          });
        }
      });
    })();
  </script>`;
}

function renderStatCards(stats) {
  const cards = [
    ["Total leads", stats.totalLeads],
    ["Hot leads", stats.hotLeads],
    ["Booked calls", stats.bookedCalls],
    ["Quote requests", stats.quoteRequests],
    ["Deposits received", stats.depositsReceived],
    ["Estimated pipeline", moneyWithCents(stats.estimatedPipelineCents)],
  ];
  return cards
    .map(([label, value]) => `
      <article class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
      </article>
    `)
    .join("");
}

function renderSectionTitle(eyebrow, title, description = "") {
  return `
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2>${escapeHtml(title)}</h2>
      ${description ? `<p>${escapeHtml(description)}</p>` : ""}
    </div>`;
}

function renderPageTitle(eyebrow, title, description = "") {
  return `
    <div class="section-heading page-heading">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      ${description ? `<p>${escapeHtml(description)}</p>` : ""}
    </div>`;
}

function renderCardGrid(items, ctaLabel = "") {
  return `
    <div class="card-grid">
      ${items.map((item) => `
        <article class="info-card">
          <p class="card-kicker">${escapeHtml(item.kicker || "")}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description || item.summary || "")}</p>
          ${item.points ? `<ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : ""}
          ${ctaLabel && item.href ? `<a class="card-link" href="${escapeHtml(item.href)}">${escapeHtml(ctaLabel)}</a>` : ""}
        </article>
      `).join("")}
    </div>`;
}

function renderTurnstileWidget(env) {
  const siteKey = String(env.TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) {
    return `<p class="form-note">Spam protection is enabled with rate limiting and honeypot validation.</p>`;
  }
  return `
    <div class="turnstile-slot">
      <div class="cf-turnstile" data-sitekey="${escapeHtml(siteKey)}"></div>
    </div>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`;
}

function renderLeadForm({ action, formId, fields, cta, note, turnstileHtml = "", successId = "form-status", dataAttrs = "" }) {
  const fieldMarkup = fields.map((field) => {
    if (field.type === "hidden") {
      return `<input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(field.value || "")}">`;
    }
    if (field.type === "select") {
      return `
        <label class="field">
          <span>${escapeHtml(field.label)}</span>
          <select name="${escapeHtml(field.name)}" ${field.required ? "required" : ""}>
            ${field.options.map((option) => `<option value="${escapeHtml(option)}" ${option === field.value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
          </select>
        </label>`;
    }
    if (field.type === "textarea") {
      return `
        <label class="field full">
          <span>${escapeHtml(field.label)}</span>
          <textarea name="${escapeHtml(field.name)}" rows="${field.rows || 4}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""}>${escapeHtml(field.value || "")}</textarea>
        </label>`;
    }
    if (field.type === "checkbox") {
      return `
        <label class="checkbox full">
          <input type="checkbox" name="${escapeHtml(field.name)}" value="1" ${field.required ? "required" : ""}>
          <span>${escapeHtml(field.label)}</span>
        </label>`;
    }
    return `
      <label class="field">
        <span>${escapeHtml(field.label)}</span>
        <input type="${escapeHtml(field.type || "text")}" name="${escapeHtml(field.name)}" value="${escapeHtml(field.value || "")}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""}>
      </label>`;
  }).join("");

  return `
    <form class="lead-form" id="${escapeHtml(formId)}" data-agentid-form="1" data-endpoint="${escapeHtml(action)}" data-success-target="#${escapeHtml(successId)}" ${dataAttrs}>
      <input type="hidden" name="sourcePage" value="">
      <input type="hidden" name="leadSource" value="">
      <input type="text" name="websiteCheck" tabindex="-1" autocomplete="off" class="honeypot" aria-hidden="true">
      ${fieldMarkup}
      ${turnstileHtml}
      <button class="button-primary" type="submit">${escapeHtml(cta)}</button>
      <p class="form-note">${escapeHtml(note || "")}</p>
      <p class="form-status" id="${escapeHtml(successId)}" aria-live="polite"></p>
    </form>`;
}

function renderMeasurementHead(env) {
  const gatewayPath = String(env.GOOGLE_TAG_GATEWAY_PATH || "/gtag").trim().replace(/\/+$/, "") || "/gtag";
  const tagManagerId = String(env.GOOGLE_TAG_ID || "").trim();
  const analyticsId = String(env.GOOGLE_ANALYTICS_ID || "").trim();
  const snippets = [];

  if (tagManagerId.startsWith("GTM-")) {
    snippets.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'${escapeJs(gatewayPath)}/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${escapeJs(tagManagerId)}');</script>`);
  } else if (analyticsId.startsWith("G-")) {
    snippets.push(`<script async src="${escapeHtml(gatewayPath)}/gtag/js?id=${encodeURIComponent(analyticsId)}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "${escapeJs(analyticsId)}");
</script>`);
  }

  return snippets.join("\n");
}

function renderMeasurementBody(env) {
  const tagManagerId = String(env.GOOGLE_TAG_ID || "").trim();
  if (!tagManagerId.startsWith("GTM-")) return "";
  const gatewayPath = String(env.GOOGLE_TAG_GATEWAY_PATH || "/gtag").trim().replace(/\/+$/, "") || "/gtag";
  return `<noscript><iframe src="${escapeHtml(gatewayPath)}/ns.html?id=${encodeURIComponent(tagManagerId)}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;
}

function adSenseClientId(env) {
  const raw = String(env.ADSENSE_CLIENT_ID || "").trim();
  if (/^ca-pub-\d{16}$/.test(raw)) return raw;
  if (/^pub-\d{16}$/.test(raw)) return `ca-${raw}`;
  return "";
}

function adSensePublisherId(env) {
  return adSenseClientId(env).replace(/^ca-/, "");
}

function adSenseAdSlot(env) {
  const raw = String(env.ADSENSE_AD_SLOT || "").trim();
  return /^\d{10}$/.test(raw) ? raw : "";
}

function adSenseEnabled(env) {
  return String(env.ADSENSE_ENABLED || "true").trim().toLowerCase() !== "false";
}

function adSenseAllowedPath(path) {
  const normalized = normalizePath(path);
  if (normalized.startsWith("/downloads/")) return false;
  return !new Set([
    "/pricing",
    "/contact",
    "/book-a-consultation",
    "/consultation",
    "/ai-agent-launch-kit",
    "/privacy",
    "/terms",
    "/onboarding",
    "/customer-dashboard",
    "/admin-dashboard",
  ]).has(normalized);
}

function adSenseStatus(env) {
  const clientId = adSenseClientId(env);
  const adSlot = adSenseAdSlot(env);
  const enabled = adSenseEnabled(env);
  return {
    ok: true,
    provider: "google-adsense",
    enabled,
    publisherConfigured: Boolean(clientId) && enabled,
    publisherId: enabled ? clientId || null : null,
    codeInstalled: Boolean(clientId) && enabled,
    adUnitConfigured: Boolean(clientId) && Boolean(adSlot) && enabled,
    adSlotId: adSlot || null,
    adsTxtConfigured: Boolean(clientId) && enabled,
    adsTxtUrl: `${siteUrl(env)}/ads.txt`,
    site: new URL(siteUrl(env)).hostname,
    earningStatus: clientId && enabled
      ? "Ad serving depends on Google site review, Auto ads settings, advertiser demand, and valid traffic."
      : enabled
        ? "Add the AdSense publisher ID after creating or selecting the publisher account."
        : "AdSense is intentionally disabled on this host.",
    policy: {
      selfClicksAllowed: false,
      incentivizedClicksAllowed: false,
      paidOrBotTrafficAllowed: false,
    },
  };
}

function renderAdSenseHead(env, path) {
  const clientId = adSenseClientId(env);
  if (!clientId || !adSenseEnabled(env) || !adSenseAllowedPath(path)) return "";
  return `<meta name="google-adsense-account" content="${escapeHtml(clientId)}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}" crossorigin="anonymous"></script>`;
}

function renderAdSenseUnit(env, path) {
  const clientId = adSenseClientId(env);
  const adSlot = adSenseAdSlot(env);
  if (!clientId || !adSlot || !adSenseEnabled(env) || !adSenseAllowedPath(path)) return "";
  return `<div class="publisher-ad" aria-label="Advertisement">
<p class="publisher-ad-label">Advertisement</p>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${escapeHtml(clientId)}"
     data-ad-slot="${escapeHtml(adSlot)}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
</div>`;
}

function renderAnalyticsBootstrap(env) {
  const legacyGoogleAdsConversionId = String(env.GOOGLE_ADS_CONVERSION_ID || "").trim();
  const legacyGoogleAdsConversionLabel = String(env.GOOGLE_ADS_CONVERSION_LABEL || "").trim();
  const googleAdsLeadConversionId = String(env.GOOGLE_ADS_LEAD_CONVERSION_ID || legacyGoogleAdsConversionId).trim();
  const googleAdsLeadConversionLabel = String(env.GOOGLE_ADS_LEAD_CONVERSION_LABEL || legacyGoogleAdsConversionLabel).trim();
  const googleAdsPurchaseConversionId = String(env.GOOGLE_ADS_PURCHASE_CONVERSION_ID || "").trim();
  const googleAdsPurchaseConversionLabel = String(env.GOOGLE_ADS_PURCHASE_CONVERSION_LABEL || "").trim();
  const config = {
    siteUrl: siteUrl(env),
    googleTagId: String(env.GOOGLE_TAG_ID || "").trim(),
    googleAnalyticsId: String(env.GOOGLE_ANALYTICS_ID || "").trim(),
    googleAdsConversionSendTo: {
      generate_lead: googleAdsLeadConversionId && googleAdsLeadConversionLabel
        ? `${googleAdsLeadConversionId}/${googleAdsLeadConversionLabel}`
        : "",
      purchase: googleAdsPurchaseConversionId && googleAdsPurchaseConversionLabel
        ? `${googleAdsPurchaseConversionId}/${googleAdsPurchaseConversionLabel}`
        : "",
    },
    metaPixelId: String(env.META_PIXEL_ID || "").trim(),
    linkedInInsightId: String(env.LINKEDIN_INSIGHT_ID || "").trim(),
    posthogKey: String(env.POSTHOG_API_KEY || "").trim(),
    posthogHost: String(env.POSTHOG_HOST || "").trim(),
  };

  return `
    <script>
      window.__agentidAnalyticsConfig = ${JSON.stringify(config)};
      window.__agentidSessionId = (function() {
        const sessionKey = "agentid.session.v1";
        try {
          let sessionId = sessionStorage.getItem(sessionKey) || "";
          if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem(sessionKey, sessionId);
          }
          return sessionId;
        } catch {
          return crypto.randomUUID();
        }
      })();
      window.__agentidAttribution = (function() {
        const storageKey = "agentid.attribution.v1";
        const search = new URLSearchParams(location.search);
        const incoming = {
          landing_page: location.pathname + location.search,
          page_referrer: document.referrer || "",
          utm_source: search.get("utm_source") || "",
          utm_medium: search.get("utm_medium") || "",
          utm_campaign: search.get("utm_campaign") || "",
          utm_content: search.get("utm_content") || "",
          utm_term: search.get("utm_term") || "",
        };
        const hasCampaign = Boolean(incoming.utm_source || incoming.utm_medium || incoming.utm_campaign);
        let stored = null;
        try {
          stored = JSON.parse(sessionStorage.getItem(storageKey) || "null");
          if (!stored || hasCampaign) {
            stored = incoming;
            sessionStorage.setItem(storageKey, JSON.stringify(stored));
          }
        } catch {
          stored = incoming;
        }
        return stored || incoming;
      })();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({
        event: "agentid_attribution_ready",
        agentid_session_id: window.__agentidSessionId,
      }, window.__agentidAttribution));
      window.__agentidGoogleAdsConversionKeys = new Set();
      window.agentidTrackGoogleAdsConversion = function(eventName, properties) {
        const sendTo = window.__agentidAnalyticsConfig.googleAdsConversionSendTo[eventName] || "";
        if (!sendTo || !["generate_lead", "purchase"].includes(eventName)) return false;
        const eventProperties = Object.assign({}, properties || {});
        const transactionId = String(eventProperties.transaction_id || eventProperties.lead_id || "").trim();
        const conversionKey = [sendTo, eventName, transactionId].join("|");
        if (transactionId && window.__agentidGoogleAdsConversionKeys.has(conversionKey)) return false;
        if (transactionId) window.__agentidGoogleAdsConversionKeys.add(conversionKey);
        const conversionProperties = Object.assign({
          send_to: sendTo,
          value: typeof eventProperties.value === "number" ? eventProperties.value : 1,
          currency: eventProperties.currency || "USD",
        }, eventProperties);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: "conversion" }, conversionProperties));
        if (!window.__agentidAnalyticsConfig.googleTagId.startsWith("GTM-")
            && typeof window.gtag === "function") {
          window.gtag("event", "conversion", conversionProperties);
        }
        return true;
      };
      window.agentidTrackEvent = async function(eventName, properties) {
        const eventProperties = Object.assign({
          agentid_session_id: window.__agentidSessionId,
        }, window.__agentidAttribution || {}, properties || {});
        const payload = {
          eventName,
          sourcePage: location.pathname + location.search,
          sessionId: window.__agentidSessionId,
          properties: eventProperties,
        };
        try {
          if (window.dataLayer) {
            window.dataLayer.push(Object.assign({ event: eventName }, eventProperties));
          }
          if (!window.__agentidAnalyticsConfig.googleTagId.startsWith("GTM-")
              && window.__agentidAnalyticsConfig.googleAnalyticsId
              && typeof window.gtag === "function") {
            window.gtag("event", eventName, eventProperties);
          }
          window.agentidTrackGoogleAdsConversion(eventName, eventProperties);
          await fetch("/api/events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            keepalive: true,
            body: JSON.stringify(payload),
          });
        } catch (error) {
          console.debug("agentid analytics", error);
        }
      };

      function trackScrollDepth() {
        const checkpoints = [25, 50, 75, 90];
        const seen = new Set();
        function evaluate() {
          const doc = document.documentElement;
          const max = Math.max(1, doc.scrollHeight - window.innerHeight);
          const depth = Math.round((window.scrollY / max) * 100);
          checkpoints.forEach((point) => {
            if (depth >= point && !seen.has(point)) {
              seen.add(point);
              window.agentidTrackEvent("scroll_depth", {
                value: point,
                percent_scrolled: point,
                scroll_threshold: point,
                page_path: location.pathname,
              });
            }
          });
        }
        let evaluationPending = false;
        function scheduleEvaluation() {
          if (evaluationPending) return;
          evaluationPending = true;
          requestAnimationFrame(() => {
            setTimeout(() => {
              evaluationPending = false;
              evaluate();
            }, 0);
          });
        }
        window.addEventListener("scroll", scheduleEvaluation, { passive: true });
        scheduleEvaluation();
      }

      function trackFaqOpen() {
        document.querySelectorAll("details[data-track-faq]").forEach((node) => {
          node.addEventListener("toggle", () => {
            if (node.open) {
              window.agentidTrackEvent("faq_open", { question: node.querySelector("summary")?.textContent || "" });
            }
          });
        });
      }

      function trackClicks() {
        document.addEventListener("click", (event) => {
          const target = event.target.closest("[data-track-event],a[href^='tel:'],a[href^='mailto:']");
          if (!target) return;
          if (target.matches("a[href^='tel:']")) {
            window.agentidTrackEvent("phone_click", { href: target.getAttribute("href") || "" });
            return;
          }
          if (target.matches("a[href^='mailto:']")) {
            window.agentidTrackEvent("email_click", { href: target.getAttribute("href") || "" });
            return;
          }
          const eventName = target.getAttribute("data-track-event");
          if (eventName) {
            window.agentidTrackEvent(eventName, {
              label: target.getAttribute("data-track-label") || target.textContent.trim(),
              href: target.getAttribute("href") || "",
            });
          }
        });

        document.querySelectorAll("[data-sponsor-placement]").forEach((placement) => {
          let recorded = false;
          const recordImpression = () => {
            if (recorded) return;
            recorded = true;
            window.agentidTrackEvent("sponsor_impression", {
              sponsorId: placement.getAttribute("data-sponsor-placement") || "",
            });
          };
          if (!("IntersectionObserver" in window)) {
            recordImpression();
            return;
          }
          const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
              recordImpression();
              observer.disconnect();
            }
          }, { threshold: [0.5] });
          observer.observe(placement);
        });
      }

      document.addEventListener("DOMContentLoaded", () => {
        trackScrollDepth();
        trackFaqOpen();
        trackClicks();
      });
    </script>`;
}

function renderChatBootstrap(env) {
  return `
    <script>
      (function() {
        const storageKey = "agentid.chat.v1";
        const page = location.pathname;
        const sourcePage = location.pathname + location.search;
        const isPricingPage = page === "/pricing";
        const greeting = isPricingPage
          ? "How can I help? Tell me what you need to automate and I’ll point you to the best-fit plan."
          : ${JSON.stringify(CHAT_GREET)};
        let state = loadState();
        let mounted = false;
        let root;
        let input;
        let sendButton;
        let cta;
        let summary;
        let badge;
        let openTimer = null;
        let nudge;
        let chatOpenTracked = false;

        function esc(value) {
          return String(value || "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char]);
        }

        function loadState() {
          try {
            return JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
          } catch {
            return {};
          }
        }

        function saveState(next) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {}
        }

        function ensureConversation() {
          if (!state.conversationId) {
            state.conversationId = crypto.randomUUID();
            state.messages = [];
            state.step = state.step || 0;
          }
          state.sourcePage = sourcePage;
          saveState(state);
          return state.conversationId;
        }

        function renderMessages() {
          const list = root.querySelector(".agentid-chat-list");
          if (!list) return;
          list.innerHTML = (state.messages || []).map((item) => {
            const sources = Array.isArray(item.meta && item.meta.sources)
              ? item.meta.sources.filter((source) => source && source.uri).slice(0, 3)
              : [];
            const sourceHtml = sources.length
              ? '<div class="chat-sources"><span>Sources:</span> ' + sources.map((source) => {
                return '<a href="' + esc(source.uri) + '" target="_blank" rel="noopener noreferrer">' + esc(source.title || source.uri) + '</a>';
              }).join(" · ") + '</div>'
              : "";
            return '<div class="chat-line ' + esc(item.role) + '"><div class="chat-bubble"><div>' + esc(item.text) + '</div>' + sourceHtml + '</div></div>';
          }).join("");
          requestAnimationFrame(() => {
            list.scrollTop = list.scrollHeight;
          });
        }

        function appendMessage(role, text, meta) {
          state.messages = state.messages || [];
          state.messages.push({ role, text, meta: meta || {}, at: new Date().toISOString() });
          saveState(state);
          renderMessages();
        }

        function quickReplies(items) {
          const box = root.querySelector(".agentid-chat-actions");
          if (!box) return;
          box.innerHTML = (items || []).map((item) => {
            return '<button type="button" class="chat-chip" data-value="' + esc(item.value) + '">' + esc(item.label) + '</button>';
          }).join("");
          box.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
              input.value = button.dataset.value || button.textContent.trim();
              sendMessage();
            });
          });
        }

        function openWidget(force, trigger) {
          const wasOpen = root.classList.contains("open");
          if (wasOpen && !force) return;
          root.classList.add("open");
          root.classList.remove("prompting");
          state.dismissed = false;
          saveState(state);
          if (!wasOpen && !chatOpenTracked) {
            chatOpenTracked = true;
            window.agentidTrackEvent && window.agentidTrackEvent("chat_open", {
              page_path: page,
              chat_trigger: trigger || "widget",
            });
          }
        }

        function closeWidget() {
          root.classList.remove("open");
          root.classList.remove("prompting");
          state.dismissed = true;
          saveState(state);
        }

        async function sendMessage() {
          const message = input.value.trim();
          if (!message) return;
          input.value = "";
          ensureConversation();
          appendMessage("user", message);
          sendButton.disabled = true;
          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                conversationId: state.conversationId,
                sourcePage,
                message,
                state,
              }),
            });
            const result = await response.json();
            if (result.state) {
              state = Object.assign(state, result.state);
              saveState(state);
            }
            appendMessage("assistant", result.reply || "Thanks. I’ll help with that.", {
              grounded: Boolean(result.grounded),
              sources: result.sources || [],
            });
            quickReplies(result.quickReplies || []);
            if (result.cta && result.cta.href) {
              cta.href = result.cta.href;
              cta.textContent = result.cta.label || "Book My Free AI Strategy Call";
              cta.style.display = "inline-flex";
            }
            if (result.summary) {
              summary.textContent = result.summary;
            }
            if (result.leadTag) {
              badge.textContent = result.leadTag;
              badge.className = "lead-badge " + String(result.leadTag).toLowerCase();
            }
            if (window.agentidTrackEvent) {
              window.agentidTrackEvent("conversation_started", { conversationId: state.conversationId, pagePath: page });
              if (result.leadCaptured) {
                const leadProperties = {
                  leadTag: result.leadTag || "",
                  package: result.recommendedPackage || "",
                  transaction_id: result.leadId || state.conversationId || "",
                  value: 1,
                  currency: "USD",
                };
                window.agentidTrackEvent("lead_captured", leadProperties);
                window.agentidTrackEvent("generate_lead", leadProperties);
              }
            }
          } catch (error) {
            appendMessage("assistant", "I’m having trouble reaching the server. Please try again or use the contact form.");
          } finally {
            sendButton.disabled = false;
            input.focus();
          }
        }

        function initializeWidget() {
          if (mounted) return;
          mounted = true;
          document.body.insertAdjacentHTML("beforeend", [
            '<div class="agentid-chat" aria-live="polite">',
            '  <button class="agentid-chat-nudge" type="button">How can I help you choose the right plan?</button>',
            '  <button class="agentid-chat-fab" type="button">' + (isPricingPage ? 'Ask about pricing' : 'Ask AI Agent') + '</button>',
            '  <section class="agentid-chat-panel" aria-label="GPTMarketPlus assistant">',
            '    <header>',
            '      <div>',
            '        <strong>GPTMarketPlus assistant</strong>',
            '        <span class="lead-badge">AI assistant</span>',
            '      </div>',
            '      <button type="button" class="chat-close" aria-label="Close chat">×</button>',
            '    </header>',
            '    <div class="agentid-chat-list"></div>',
            '    <div class="agentid-chat-actions"></div>',
            '    <div class="agentid-chat-summary">',
            '      <span class="summary-label">Lead summary</span>',
            '      <p class="summary-text"></p>',
            '    </div>',
            '    <div class="agentid-chat-footer">',
            '      <input id="agentid-chat-message" name="message" type="text" class="chat-input" placeholder="Reply here" aria-label="Type your message" autocomplete="off">',
            '      <button type="button" class="chat-send">Send</button>',
            '    </div>',
            '    <div class="agentid-chat-ctas">',
            '      <a class="button-primary" href="/book-a-consultation">Book My Free AI Strategy Call</a>',
            '      <a class="button-secondary" href="/contact">Request a Custom Quote</a>',
            '    </div>',
            '  </section>',
            '</div>'
          ].join(""));

          root = document.querySelector(".agentid-chat");
          input = root.querySelector(".chat-input");
          sendButton = root.querySelector(".chat-send");
          cta = root.querySelector(".button-primary");
          summary = root.querySelector(".summary-text");
          badge = root.querySelector(".lead-badge");
          nudge = root.querySelector(".agentid-chat-nudge");

          if (state.messages && state.messages.length) {
            renderMessages();
          } else {
            state.messages = [{ role: "assistant", text: greeting }];
            saveState(state);
            renderMessages();
          }

          root.querySelector(".agentid-chat-fab").addEventListener("click", () => {
            if (root.classList.contains("open")) {
              closeWidget();
            } else {
              openWidget(true, "floating_button");
            }
          });
          nudge.addEventListener("click", () => openWidget(true, "pricing_prompt"));
          root.querySelector(".chat-close").addEventListener("click", closeWidget);
          sendButton.addEventListener("click", sendMessage);
          input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          });
          document.querySelectorAll("[data-open-agent-chat]").forEach((button) => {
            button.addEventListener("click", () => openWidget(true, "page_cta"));
          });
        }

        document.addEventListener("DOMContentLoaded", () => {
          initializeWidget();
          if (isPricingPage && !state.dismissed) {
            openTimer = setTimeout(() => {
              root.classList.add("prompting");
              window.agentidTrackEvent && window.agentidTrackEvent("chat_prompt_view", {
                page_path: page,
                prompt_variant: "pricing_help_v1",
              });
            }, 2800);
          }
        });

        window.addEventListener("beforeunload", () => {
          saveState(state);
          if (openTimer) clearTimeout(openTimer);
        });
      })();
    </script>`;
}

function renderFormsBootstrap(env) {
  return `
    <script>
      (function() {
        function esc(value) {
          return String(value || "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char]);
        }

        async function submitForm(form) {
          const endpoint = form.getAttribute("data-endpoint");
          const status = form.querySelector(".form-status");
          const button = form.querySelector("button[type='submit']");
          if (!endpoint || !button) return;

          const data = new FormData(form);
          const payload = Object.fromEntries(data.entries());
          payload.sourcePage = location.pathname + location.search;
          payload.sourceUrl = location.href;
          payload.leadSource = [
            window.__agentidAttribution?.utm_source || "",
            window.__agentidAttribution?.utm_medium || "",
            window.__agentidAttribution?.utm_campaign || "",
          ].filter(Boolean).join(" / ");

          if (String(payload.websiteCheck || "").trim()) {
            if (status) status.textContent = "Submission blocked.";
            return;
          }
          delete payload.websiteCheck;

          button.disabled = true;
          if (status) status.textContent = "Sending...";
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok || result.ok === false) {
              throw new Error(result.error || "Submission failed");
            }
            if (status) {
              status.textContent = result.message || result.summary || "Received. We’ll follow up with the next step.";
            }
            if (result.customerBlueprintHtml && form.dataset.previewTarget) {
              const preview = document.querySelector(form.dataset.previewTarget);
              if (preview) preview.innerHTML = result.customerBlueprintHtml;
            }
            if (result.internalBlueprintJson && form.dataset.internalTarget) {
              const target = document.querySelector(form.dataset.internalTarget);
              if (target) target.textContent = JSON.stringify(result.internalBlueprintJson, null, 2);
            }
            if (result.dashboardUrl && form.dataset.dashboardTarget) {
              const target = document.querySelector(form.dataset.dashboardTarget);
              if (target) target.innerHTML = '<a class="button-primary" href="' + esc(result.dashboardUrl) + '">Open Customer Dashboard</a>';
            }
            if (result.followUpSequence && form.dataset.sequenceTarget) {
              const target = document.querySelector(form.dataset.sequenceTarget);
              if (target) {
                target.innerHTML = result.followUpSequence.map((item) => '<article class="sequence-card"><strong>Step ' + esc(item.step) + '</strong><h4>' + esc(item.subject) + '</h4><p>' + esc(item.body) + '</p></article>').join("");
              }
            }
            if (result.checkoutUrl) {
              if (window.agentidTrackEvent) {
                window.agentidTrackEvent("checkout_click", {
                  productId: payload.productId || payload.packageId || "",
                  sourcePage: location.pathname,
                });
              }
              window.location.href = result.checkoutUrl;
              return;
            }
            if (window.agentidTrackEvent) {
              const trackedEvent = result.trackEvent || "lead_captured";
              const eventProperties = {
                leadTag: result.leadTag || "",
                package: result.recommendedPackage || "",
                sourcePage: location.pathname,
                transaction_id: result.leadId || "",
              };
              window.agentidTrackEvent(trackedEvent, eventProperties);
              if (["contact_submit", "booking_submit"].includes(trackedEvent)) {
                window.agentidTrackEvent("generate_lead", Object.assign({
                  value: 1,
                  currency: "USD",
                }, eventProperties));
              }
            }
            form.reset();
          } catch (error) {
            if (status) status.textContent = error.message || "Submission failed.";
          } finally {
            button.disabled = false;
            if (window.turnstile && typeof window.turnstile.reset === "function") {
              window.turnstile.reset();
            }
          }
        }

        document.addEventListener("DOMContentLoaded", () => {
          document.querySelectorAll("form[data-agentid-form]").forEach((form) => {
            form.addEventListener("submit", (event) => {
              event.preventDefault();
              submitForm(form);
            });
          });
        });
      })();
    </script>`;
}

const AGENTID_PRIVATE_PATHS = new Set([
  "/onboarding",
  "/customer-dashboard",
  "/admin-dashboard",
]);
const AGENTID_NON_INDEXABLE_PATHS = new Set([
  "/agents",
  "/social",
  "/playbook",
  "/submission-status",
  "/software-builds",
  "/sponsor",
  "/advertise",
  "/ad-network",
]);

function isAgentIdPrivatePath(pathname) {
  return AGENTID_PRIVATE_PATHS.has(normalizePath(pathname));
}

function safeJsonParse(value, fallback = null) {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatDateTime(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value, 80);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateShort(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value, 80);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPercent(value) {
  return `${Math.max(0, Math.min(100, Number(value || 0)))}%`;
}

function formatMoney(value) {
  return moneyWithCents(Number(value || 0));
}

function pageEntriesForSitemap(env) {
  const pages = [
    ...AGENTID_PUBLIC_PAGES,
    { path: "/ai-marketing-automation", title: "AI Marketing Automation for Small Business", description: "A practical system for lead capture, qualification, follow-up, sales handoff, and measurable pipeline results." },
    { path: "/ai-lead-generation", title: "AI Lead Generation System", description: "Use bounded AI workflows to score leads, queue follow-up, and move qualified demand into sales conversations." },
    { path: "/small-business-ai-tools", title: "Small Business AI Tools", description: "Practical AI tools for local service businesses, consultants, and creators that need useful revenue workflows." },
    { path: "/ai-receptionist-software", title: "AI Receptionist Software Comparison", description: "Compare AI receptionist software by channel, booking, human handoff, compliance, operating model, and price." },
    { path: "/chatgpt-marketing", title: "ChatGPT Marketing Agents", description: "Marketing-agent workflows for useful content, SEO, outreach, conversion, and accountable daily execution." },
    { path: "/ai-sales-funnel", title: "AI Sales Funnel Automation", description: "A seven-stage AI sales funnel from demand and qualification through payment and verified attribution." },
    { path: "/agents/", title: "Autonomous Agent Operations", description: "Operational status and capabilities for GPTMarketPlus automation agents." },
    { path: "/social", title: "GPTMarketPlus Social Hub", description: "Share-ready links for legitimate GPTMarketPlus discovery and customer acquisition." },
    { path: "/playbook", title: "Growth Playbook", description: "Current public growth priorities and transparent agent operating status." },
    { path: "/software-builds", title: "AI Software Builds", description: "Fixed-scope AI software opportunities and implementation options." },
    { path: "/sponsor", title: "Sponsor GPTMarketPlus", description: "Apply for reviewed sponsor visibility across GPTMarketPlus buyer-intent pages." },
    { path: "/advertise", title: "Advertise with GPTMarketPlus", description: "Review sponsor inventory and apply for an approved placement." },
    { path: "/ad-network", title: "GPTMarketPlus Ad Network", description: "Reviewed advertising inventory for relevant AI and business software." },
    { path: "/software-builds/ai-software-opportunity-report", title: "AI Software Opportunity Report", description: "A fixed-scope report for evaluating an AI software opportunity." },
    { path: "/software-builds/lead-response-and-follow-up-automation", title: "Lead Response Automation", description: "A fixed-scope lead response and follow-up automation build." },
    { path: "/software-builds/paid-reporting-dashboard-builder", title: "Paid Reporting Dashboard Builder", description: "A fixed-scope paid reporting dashboard implementation package." },
    { path: "/software-builds/ai-content-operations-planner", title: "AI Content Operations Planner", description: "A fixed-scope AI content operations planning package." },
    { path: "/software-builds/internal-workflow-automation-console", title: "Internal Workflow Automation Console", description: "A fixed-scope internal workflow automation package." },
    { path: "/software-builds/public-data-monitor-and-alert-service", title: "Public Data Monitor and Alert Service", description: "A fixed-scope public data monitoring and alerting package." },
  ];
  const seen = new Set();
  return pages.filter((page) => {
    const path = normalizePath(page.path);
    const nonIndexable = isAgentIdSite(env)
      && (AGENTID_NON_INDEXABLE_PATHS.has(path) || path.startsWith("/software-builds/"));
    return !isAgentIdPrivatePath(path) && !nonIndexable && !seen.has(page.path) && seen.add(page.path);
  });
}

export function agentIdIndexablePaths(env = {}) {
  return pageEntriesForSitemap(env).map((page) => page.path);
}

async function maybeHydratePurchaseFromSession(env, sessionId) {
  if (!sessionId) return null;
  const existing = await dbGetPurchaseBySession(env, sessionId);
  if (existing?.status === "paid") return existing;
  const session = await retrieveStripeSession(env, sessionId);
  if (!session) return null;
  return storePurchaseFromSession(env, session);
}

function scopedKvKey(env, key) {
  const scope = String(env.STORAGE_SCOPE || "agentid.services").trim().toLowerCase();
  return scope ? `${scope}:${key}` : key;
}

async function verifiedPaypalOrder(env, orderId, accessToken) {
  const normalizedOrderId = cleanText(orderId || "", 80);
  const normalizedAccessToken = cleanText(accessToken || "", 180);
  if (!env.GMP_KV || !normalizedOrderId || !normalizedAccessToken) return null;
  const order = await env.GMP_KV.get(scopedKvKey(env, `paypal:order:${normalizedOrderId}`), "json");
  if (!order || order.status !== "COMPLETED" || !(await timingSafeStringEqual(normalizedAccessToken, order.accessToken))) {
    return null;
  }
  return order;
}

async function verifyOnboardingAccess(env, context = {}) {
  const sessionId = cleanText(context.sessionId || "", 160);
  const dashboardToken = cleanText(context.dashboardToken || context.token || "", 180);
  const paypalOrderId = cleanText(context.paypalOrderId || context.orderId || "", 80);
  const paypalAccessToken = cleanText(context.paypalAccessToken || context.accessToken || "", 180);

  if (sessionId) {
    const purchase = await maybeHydratePurchaseFromSession(env, sessionId);
    if (purchase?.status === "paid") {
      return {
        ok: true,
        provider: "stripe",
        purchase,
        purchaseId: purchase.id,
        packageName: purchase.package_name,
        dashboardToken: purchase.dashboard_token,
        sessionId,
      };
    }
  }

  if (dashboardToken) {
    const purchase = await dbGetPurchaseByToken(env, dashboardToken);
    if (purchase?.status === "paid") {
      return {
        ok: true,
        provider: "customer_token",
        purchase,
        purchaseId: purchase.id,
        packageName: purchase.package_name,
        dashboardToken: purchase.dashboard_token,
      };
    }
  }

  const paypalOrder = await verifiedPaypalOrder(env, paypalOrderId, paypalAccessToken);
  if (paypalOrder) {
    return {
      ok: true,
      provider: "paypal",
      paypalOrder,
      purchaseId: "",
      packageName: paypalOrder.productName || paypalOrder.packageTier,
      dashboardToken: paypalOrder.accessToken,
      paypalOrderId,
      paypalAccessToken,
    };
  }

  return { ok: false };
}

async function resolveCustomerWorkspace(env, context = {}) {
  const token = cleanText(context.token || "", 120);

  let lead = null;
  let purchase = null;
  let onboarding = null;

  if (token) {
    lead = await dbGetLeadByToken(env, token);
    purchase = await dbGetPurchaseByToken(env, token);
    onboarding = await dbGetOnboardingByToken(env, token);
  }

  if (!lead && purchase?.lead_id) {
    lead = await dbGetLeadById(env, purchase.lead_id);
  }

  if (!lead && purchase?.customer_email) {
    lead = await queryD1First(env, "SELECT * FROM agentid_leads WHERE email = ? ORDER BY datetime(created_at) DESC LIMIT 1", [purchase.customer_email]);
  }

  if (!onboarding) {
    onboarding = lead?.id ? await dbGetOnboardingByLead(env, lead.id) : null;
  }

  if (!onboarding && purchase?.id) {
    onboarding = await dbGetOnboardingByPurchase(env, purchase.id);
  }

  const workspaceToken = token || lead?.dashboard_token || purchase?.dashboard_token || onboarding?.dashboard_token || "";
  const packageName = onboarding?.package_tier || purchase?.package_name || lead?.recommended_package || "Starter Agent";
  const agentType = onboarding?.recommended_agent_type || lead?.recommended_agent_type || recommendedAgentTypeForPackage(lead?.business_type || "", packageName, lead?.desired_automation || lead?.pain_point || "");
  const stage = onboarding?.build_status_stage || purchase?.fulfillment_status || lead?.crm_stage || defaultLeadStage(lead?.lead_status || "COLD");

  return {
    token: workspaceToken,
    lead,
    purchase,
    onboarding,
    packageName,
    agentType,
    stage,
  };
}

const STYLES = `
:root {
  color-scheme: dark;
  --bg: #050b14;
  --bg-alt: #07111d;
  --surface: rgba(8, 18, 31, 0.86);
  --surface-2: rgba(13, 26, 43, 0.92);
  --line: rgba(127, 205, 255, 0.16);
  --line-strong: rgba(127, 205, 255, 0.28);
  --text: #eef6ff;
  --muted: #9cb3cc;
  --muted-2: #7f96b3;
  --accent: #71d6ff;
  --accent-2: #5da0ff;
  --success: #6df0c6;
  --warning: #f3c46f;
  --danger: #ff7e8d;
  --shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --content-width: 1180px;
  font-family: "Segoe UI Variable", "Avenir Next", "Helvetica Neue", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(97, 168, 255, 0.18), transparent 36%),
    radial-gradient(circle at 85% 10%, rgba(88, 217, 255, 0.14), transparent 24%),
    radial-gradient(circle at 50% 0%, rgba(50, 93, 190, 0.16), transparent 40%),
    linear-gradient(180deg, #040914 0%, #060d18 40%, #050b14 100%);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0.015)),
    radial-gradient(circle at 20% 20%, rgba(117, 217, 255, 0.04), transparent 0 24%),
    radial-gradient(circle at 80% 20%, rgba(117, 217, 255, 0.035), transparent 0 20%);
  opacity: 0.8;
}

a {
  color: inherit;
  text-decoration: none;
}

img,
svg,
iframe {
  max-width: 100%;
}

button,
input,
select,
textarea {
  font: inherit;
}

main {
  width: min(var(--content-width), calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 80px;
  position: relative;
  z-index: 1;
}

.site-nav {
  width: min(var(--content-width), calc(100% - 24px));
  margin: 16px auto 0;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  border: 1px solid var(--line);
  border-radius: calc(var(--radius-xl) + 4px);
  background: rgba(6, 14, 24, 0.76);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow);
  position: sticky;
  top: 12px;
  z-index: 30;
}

.nav-brand {
  display: grid;
  gap: 4px;
  min-width: 158px;
}

.brand-mark {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.brand-sub {
  color: var(--muted);
  font-size: 0.74rem;
}

.nav-links {
  display: flex;
  flex: 1;
  gap: 2px;
  flex-wrap: nowrap;
  justify-content: center;
}

.nav-links a {
  padding: 9px 9px;
  border-radius: 999px;
  color: var(--muted);
  border: 1px solid transparent;
  font-size: 0.88rem;
  white-space: nowrap;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease, border-color 180ms ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--text);
  background: rgba(97, 168, 255, 0.11);
  border-color: rgba(127, 205, 255, 0.22);
  transform: translateY(-1px);
}

.nav-cta,
.button-primary,
.button-secondary,
.nav-links a.active {
  white-space: nowrap;
}

.nav-cta,
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(112, 214, 255, 0.36);
  background: linear-gradient(135deg, rgba(97, 168, 255, 0.98), rgba(90, 240, 198, 0.9));
  color: #04111e;
  font-weight: 800;
  box-shadow: 0 14px 30px rgba(63, 153, 255, 0.24);
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.nav-cta {
  padding: 11px 14px;
  font-size: 0.9rem;
}

.nav-cta:hover,
.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(63, 153, 255, 0.28);
  filter: brightness(1.03);
}

.button-secondary,
.card-link,
.lookup-form button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(127, 205, 255, 0.22);
  background: rgba(10, 20, 34, 0.74);
  color: var(--text);
  font-weight: 700;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.button-secondary:hover,
.card-link:hover,
.lookup-form button:hover {
  transform: translateY(-1px);
  border-color: rgba(127, 205, 255, 0.4);
  background: rgba(18, 33, 52, 0.84);
}

.hero,
.page-hero,
.split-section,
.dashboard-shell,
.faq-list,
.pricing-grid,
.support-grid,
.deposit-grid,
.card-grid,
.hero-visual,
.lead-form,
.selector-card {
  animation: riseIn 420ms ease both;
}

.hero,
.split-section {
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  align-items: center;
}

.hero {
  min-height: min(680px, calc(100vh - 138px));
  padding: 34px 0 24px;
}

.hero-copy h1,
.section-heading h2,
.page-heading h1,
.page-hero h2,
.blueprint h2,
.dashboard-title h1 {
  margin: 0;
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.hero-copy h1 {
  font-size: clamp(2.65rem, 4.4vw, 4.15rem);
  max-width: 15ch;
}

.hero-lede {
  color: var(--muted);
  font-size: clamp(1.02rem, 2vw, 1.2rem);
  max-width: 62ch;
}

.eyebrow,
.card-kicker,
.summary-label {
  margin: 0 0 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.74rem;
  font-weight: 800;
}

.trust-line,
.section-heading p,
.page-hero p,
.copy-stack p,
.legal-copy p,
.side-note p,
.about-panel p,
.calendar-placeholder p,
.selector-result p,
.info-card p,
.feature-card span,
.stat-card span,
.support-card span,
.blueprint-card p,
.timeline span,
.kv span {
  color: var(--muted);
}

.cta-row,
.button-row,
.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.benefit-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  padding: 0;
  margin: 24px 0 0;
  list-style: none;
}

.benefit-list li,
.checklist li {
  position: relative;
  padding-left: 24px;
}

.benefit-list li::before,
.checklist li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--success));
  box-shadow: 0 0 0 4px rgba(113, 214, 255, 0.08);
}

.hero-visual {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: calc(var(--radius-xl) + 6px);
  background:
    radial-gradient(circle at top right, rgba(97, 168, 255, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(11, 22, 37, 0.94), rgba(6, 13, 24, 0.92));
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.opportunity-scanner {
  align-self: center;
}

.scanner-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.scanner-heading h2 {
  margin: 0;
  font-size: clamp(1.45rem, 2.2vw, 2rem);
  letter-spacing: -0.025em;
}

.scanner-badge {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 1px solid rgba(93, 240, 198, 0.28);
  border-radius: 999px;
  background: rgba(93, 240, 198, 0.08);
  color: var(--success);
  font-size: 0.75rem;
  font-weight: 800;
}

.scanner-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
  position: relative;
  z-index: 1;
}

.scanner-fields label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.scanner-fields input,
.scanner-fields select {
  width: 100%;
  min-height: 46px;
  padding: 11px 12px;
  border: 1px solid rgba(127, 205, 255, 0.2);
  border-radius: 12px;
  outline: none;
  background: rgba(3, 10, 19, 0.74);
  color: var(--text);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.scanner-fields input:focus,
.scanner-fields select:focus {
  border-color: rgba(113, 214, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(113, 214, 255, 0.1);
}

.money-input {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  border: 1px solid rgba(127, 205, 255, 0.2);
  border-radius: 12px;
  background: rgba(3, 10, 19, 0.74);
  overflow: hidden;
}

.money-input > span {
  padding-left: 12px;
  color: var(--accent);
}

.money-input input {
  border: 0;
  background: transparent;
}

.money-input:focus-within {
  border-color: rgba(113, 214, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(113, 214, 255, 0.1);
}

.scanner-submit {
  width: 100%;
  min-height: 48px;
  margin-top: 14px;
  border: 1px solid rgba(112, 214, 255, 0.36);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(97, 168, 255, 0.98), rgba(90, 240, 198, 0.9));
  color: #04111e;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(63, 153, 255, 0.2);
  position: relative;
  z-index: 1;
  transition: transform 160ms ease, filter 160ms ease;
}

.scanner-submit:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.scanner-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
  position: relative;
  z-index: 1;
}

.scanner-results[hidden] {
  display: none;
}

.scanner-result-card,
.scanner-recommendation {
  padding: 13px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(6, 15, 27, 0.78);
}

.scanner-result-card span,
.scanner-recommendation > span {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 0.72rem;
}

.scanner-result-card strong {
  color: var(--accent);
  font-size: 1rem;
}

.scanner-recommendation,
.scanner-disclaimer,
.scanner-actions {
  grid-column: 1 / -1;
}

.scanner-recommendation strong {
  display: block;
  margin-bottom: 5px;
}

.scanner-recommendation p,
.scanner-disclaimer {
  margin: 0;
  color: var(--muted);
  font-size: 0.76rem;
  line-height: 1.45;
}

.scanner-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.scanner-actions a {
  flex: 1 1 180px;
}

.ownership-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(8, 17, 29, 0.62);
  color: var(--muted);
  font-size: 0.82rem;
  text-align: center;
}

.ownership-strip span {
  position: relative;
  padding-left: 16px;
}

.ownership-strip span::before {
  content: "";
  position: absolute;
  top: 0.45em;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 12px rgba(93, 240, 198, 0.65);
}

.hero-visual::before,
.hero-visual::after {
  content: "";
  position: absolute;
  inset: auto;
  border-radius: 999px;
  filter: blur(0);
  pointer-events: none;
}

.hero-visual::before {
  width: 220px;
  height: 220px;
  right: -90px;
  top: -90px;
  background: radial-gradient(circle, rgba(105, 207, 255, 0.18), transparent 65%);
}

.hero-visual::after {
  width: 180px;
  height: 180px;
  left: -60px;
  bottom: -60px;
  background: radial-gradient(circle, rgba(93, 255, 194, 0.12), transparent 62%);
}

.visual-top,
.visual-grid,
.feature-rack,
.timeline,
.blueprint-grid,
.dashboard-grid,
.dashboard-tables {
  display: grid;
  gap: 14px;
}

.visual-top {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 14px;
}

.visual-chip,
.status-pill,
.lead-badge,
.timeline-step,
.stat-card,
.sequence-card {
  border: 1px solid var(--line);
  background: rgba(12, 22, 38, 0.8);
  border-radius: var(--radius-md);
}

.visual-chip {
  padding: 10px 12px;
  text-align: center;
  color: var(--text);
  font-size: 0.88rem;
}

.visual-chip.muted {
  color: var(--muted);
}

.visual-large,
.visual-panel,
.feature-card,
.info-card,
.price-card,
.support-card,
.about-panel,
.side-note,
.cta-box,
.calendar-placeholder,
.selector-card,
.blueprint-preview,
.dashboard-card,
.dashboard-panel,
.lookup-form,
.admin-login,
.review-panel,
.form-status,
.agentid-chat-summary,
.agentid-chat-panel,
.agentid-chat-fab,
.agentid-chat-ctas a,
.data-table,
.table-wrap,
.kv,
.timeline-step,
.status-pill {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
}

.visual-large,
.visual-panel {
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(9, 18, 31, 0.9);
}

.visual-large strong,
.visual-panel strong,
.info-card h3,
.price-card strong,
.support-card strong,
.about-panel strong,
.blueprint-card h3,
.section-heading h2,
.dashboard-title h1 {
  display: block;
  margin: 0 0 8px;
}

.visual-large strong,
.visual-panel strong {
  font-size: 1.05rem;
}

.visual-label {
  margin: 0 0 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.68rem;
  font-weight: 800;
}

.visual-bars {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.visual-bars span {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(113, 214, 255, 0.75), rgba(93, 160, 255, 0.95));
  box-shadow: 0 8px 20px rgba(97, 168, 255, 0.2);
}

.visual-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.visual-panel span,
.timeline span,
.support-card span,
.info-card p,
.feature-card span,
.blueprint-card p,
.kv strong,
.sequence-card p {
  display: block;
}

.stats-section {
  margin-top: 26px;
}

.stat-card {
  padding: 18px;
}

.stat-card strong {
  font-size: 1.6rem;
  letter-spacing: -0.02em;
}

.section {
  margin-top: 72px;
}

.section-heading {
  max-width: 54rem;
  margin-bottom: 24px;
}

.section-heading h2,
.page-heading h1,
.page-hero h2,
.blueprint h2,
.dashboard-title h1 {
  font-size: clamp(1.8rem, 3vw, 3rem);
}

.section-heading p,
.page-hero p,
.page-hero .pricing-note {
  max-width: 60ch;
}

.info-card,
.feature-card,
.price-card,
.support-card,
.about-panel,
.side-note,
.calendar-placeholder,
.selector-card,
.blueprint-preview,
.dashboard-card,
.dashboard-panel,
.review-panel {
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(10, 21, 36, 0.92), rgba(7, 15, 27, 0.88));
}

.info-card h3,
.feature-card strong,
.support-card strong,
.price-card strong {
  margin-top: 0;
  font-size: 1.12rem;
}

.card-grid,
.pricing-grid,
.support-grid,
.deposit-grid {
  display: grid;
  gap: 16px;
}

.card-grid,
.pricing-grid,
.support-grid,
.deposit-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sponsor-pricing-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sponsor-price-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkout-stack {
  display: grid;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
}

.checkout-stack .checkout-form,
.checkout-stack .form-status {
  margin: 0;
}

.checkout-stack button {
  width: 100%;
}

.sponsor-house-ad {
  width: min(1180px, calc(100% - 36px));
  margin: 26px auto 54px;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(127, 205, 255, 0.24);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at right, rgba(105, 207, 255, 0.15), transparent 32%),
    linear-gradient(135deg, rgba(12, 27, 47, 0.96), rgba(7, 16, 29, 0.96));
  box-shadow: var(--shadow);
}

.sponsor-house-ad strong,
.sponsor-house-ad span {
  display: block;
}

.sponsor-house-ad strong {
  margin-bottom: 6px;
  font-size: clamp(1.1rem, 2vw, 1.35rem);
}

.sponsor-house-ad span {
  color: var(--muted);
}

.feature-rack {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.feature-card {
  min-height: 136px;
}

.feature-card strong {
  font-size: 1.08rem;
}

.timeline {
  grid-template-columns: 1fr;
}

.timeline > div {
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(10, 18, 31, 0.84);
}

.timeline > div strong {
  display: block;
  margin-bottom: 6px;
}

.faq-list {
  gap: 12px;
}

.faq-list details {
  border: 1px solid var(--line);
  background: rgba(10, 18, 31, 0.82);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.faq-list summary {
  list-style: none;
  cursor: pointer;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-weight: 700;
}

.faq-list summary::-webkit-details-marker {
  display: none;
}

.faq-answer {
  padding: 0 20px 20px;
  color: var(--muted);
}

.legal-copy {
  display: grid;
  gap: 16px;
  max-width: 880px;
}

.lead-form,
.lookup-form {
  display: grid;
  gap: 14px;
}

.lead-form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: calc(var(--radius-xl) + 2px);
  background: linear-gradient(180deg, rgba(8, 17, 31, 0.96), rgba(7, 15, 27, 0.96));
  box-shadow: var(--shadow);
}

.lead-form .field.full,
.lead-form .checkbox.full,
.lead-form .form-note,
.lead-form .form-status,
.lead-form button,
.lead-form .turnstile-slot,
.lead-form .honeypot {
  grid-column: 1 / -1;
}

.field,
.checkbox,
.lookup-form {
  display: grid;
  gap: 8px;
}

.field span,
.checkbox span {
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 650;
}

.field input,
.field select,
.field textarea,
.lookup-form input {
  width: 100%;
  color: var(--text);
  background: rgba(8, 17, 30, 0.82);
  border: 1px solid rgba(127, 205, 255, 0.18);
  border-radius: 14px;
  padding: 13px 14px;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.field textarea {
  resize: vertical;
  min-height: 120px;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.lookup-form input:focus,
.chat-input:focus {
  border-color: rgba(113, 214, 255, 0.55);
  box-shadow: 0 0 0 4px rgba(113, 214, 255, 0.12);
}

.checkbox {
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(10, 18, 31, 0.7);
}

.checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.form-note,
.form-status,
.pricing-note,
.confirmation,
.status-pill,
.next-step,
.summary-text,
.dashboard-note {
  color: var(--muted);
}

.form-note,
.form-status {
  margin: 0;
  font-size: 0.92rem;
}

.form-status {
  min-height: 1.4em;
}

.honeypot {
  position: absolute;
  left: -9999px;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.compact {
  margin-top: 12px;
}

.page-hero {
  padding: 34px 0 8px;
}

.page-hero.split-section {
  padding-top: 10px;
}

.selector-card {
  margin-top: 22px;
  display: grid;
  gap: 16px;
}

.selector-card label {
  display: grid;
  gap: 8px;
  max-width: 360px;
}

.selector-card select {
  border: 1px solid rgba(127, 205, 255, 0.18);
  border-radius: 14px;
  padding: 13px 14px;
  color: var(--text);
  background: rgba(8, 17, 30, 0.82);
}

.selector-result {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(113, 214, 255, 0.16);
  background: rgba(7, 15, 27, 0.72);
}

.selector-result strong,
.selector-result p {
  margin: 0;
}

.about-panel strong {
  font-size: 1.2rem;
}

.pricing-grid .price-card,
.support-grid .support-card,
.deposit-grid .support-card {
  display: grid;
  align-content: start;
  gap: 12px;
}

.price-card ul,
.support-card ul,
.side-note ul {
  padding-left: 18px;
  margin: 0;
  color: var(--muted);
}

.cta-box {
  display: grid;
  gap: 14px;
  place-items: start;
  padding: 22px;
  border-radius: calc(var(--radius-xl) + 4px);
  border: 1px solid rgba(113, 214, 255, 0.22);
  background:
    radial-gradient(circle at top right, rgba(97, 168, 255, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(10, 20, 34, 0.94), rgba(7, 15, 27, 0.92));
}

.blueprint-preview {
  display: grid;
  gap: 14px;
  min-height: 420px;
}

.blueprint {
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: calc(var(--radius-xl) + 4px);
  border: 1px solid var(--line);
  background:
    radial-gradient(circle at top right, rgba(97, 168, 255, 0.15), transparent 25%),
    linear-gradient(180deg, rgba(10, 20, 34, 0.95), rgba(7, 15, 27, 0.92));
}

.blueprint header {
  display: grid;
  gap: 8px;
  max-width: 56rem;
}

.blueprint-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.blueprint-card {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: rgba(7, 15, 27, 0.72);
}

.blueprint-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 6px;
  border-top: 1px solid var(--line);
  color: var(--muted);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 10px 14px;
  color: var(--text);
}

.calendar-embed {
  width: 100%;
  min-height: 520px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(7, 15, 27, 0.82);
}

.dashboard-shell {
  display: grid;
  gap: 22px;
}

.dashboard-title {
  display: grid;
  gap: 10px;
}

.dashboard-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.dashboard-panel,
.dashboard-card,
.review-panel {
  border-radius: var(--radius-lg);
}

.dashboard-section {
  display: grid;
  gap: 18px;
}

.dashboard-tables {
  grid-template-columns: 1fr;
}

.table-wrap {
  overflow: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: rgba(7, 15, 27, 0.84);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(127, 205, 255, 0.1);
  vertical-align: top;
}

.data-table th {
  color: var(--accent);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: rgba(10, 18, 31, 0.92);
}

.key-value-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.kv {
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(7, 15, 27, 0.74);
}

.kv span {
  margin-bottom: 6px;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kv strong {
  font-size: 1rem;
}

.timeline-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.timeline-step {
  padding: 14px;
  min-height: 96px;
}

.timeline-step.active {
  border-color: rgba(113, 214, 255, 0.4);
  background: rgba(13, 28, 46, 0.92);
}

.timeline-step span {
  font-size: 0.86rem;
  color: var(--muted-2);
}

.sequence-card {
  padding: 16px;
}

.sequence-card h4 {
  margin: 6px 0 8px;
}

.code-block {
  margin: 0;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(7, 15, 27, 0.84);
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.lead-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.lead-badge.hot {
  color: #06242a;
  background: linear-gradient(135deg, #88f2d1, #5ed5ff);
}

.lead-badge.warm {
  color: #342608;
  background: linear-gradient(135deg, #f3c46f, #f8e08a);
}

.lead-badge.cold {
  color: #dfe9f7;
  background: linear-gradient(135deg, #4e688f, #2d3d57);
}

.agentid-chat {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 60;
  display: grid;
  justify-items: end;
  gap: 10px;
  pointer-events: none;
}

.agentid-chat * {
  pointer-events: auto;
}

.agentid-chat-nudge {
  display: none;
  max-width: min(320px, calc(100vw - 36px));
  padding: 13px 16px;
  border: 1px solid rgba(113, 214, 255, 0.34);
  border-radius: 18px 18px 4px 18px;
  background: rgba(9, 21, 37, 0.98);
  color: var(--text);
  font: inherit;
  font-weight: 800;
  text-align: left;
  box-shadow: var(--shadow);
}

.agentid-chat.prompting:not(.open) .agentid-chat-nudge {
  display: block;
  animation: chat-nudge-in 220ms ease-out both;
}

@keyframes chat-nudge-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.agentid-chat-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border: 1px solid rgba(113, 214, 255, 0.3);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(17, 31, 51, 0.96), rgba(7, 15, 27, 0.96));
  color: var(--text);
  font-weight: 800;
  box-shadow: var(--shadow);
}

.agentid-chat-panel {
  width: min(380px, calc(100vw - 28px));
  max-height: min(70vh, 720px);
  overflow: hidden;
  display: none;
  grid-template-rows: auto 1fr auto auto auto auto;
  gap: 12px;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid rgba(127, 205, 255, 0.2);
  background:
    radial-gradient(circle at top right, rgba(97, 168, 255, 0.12), transparent 22%),
    linear-gradient(180deg, rgba(8, 18, 31, 0.98), rgba(6, 14, 24, 0.98));
  box-shadow: var(--shadow);
  transform: translateY(12px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 180ms ease, transform 180ms ease, visibility 180ms ease;
}

.agentid-chat.open .agentid-chat-panel {
  display: grid;
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.agentid-chat-panel header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
}

.chat-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(127, 205, 255, 0.2);
  background: rgba(12, 22, 38, 0.9);
  color: var(--text);
}

.agentid-chat-list {
  display: grid;
  gap: 10px;
  overflow: auto;
  min-height: 240px;
  padding-right: 4px;
}

.chat-line {
  display: flex;
}

.chat-line.user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 88%;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(13, 28, 46, 0.92);
  border: 1px solid rgba(127, 205, 255, 0.12);
}

.chat-line.user .chat-bubble {
  background: linear-gradient(135deg, rgba(113, 214, 255, 0.92), rgba(93, 160, 255, 0.92));
  color: #04111e;
}

.chat-sources {
  margin-top: 10px;
  padding-top: 9px;
  border-top: 1px solid rgba(127, 205, 255, 0.14);
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.5;
}

.chat-sources a {
  color: #8fd3ff;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.agentid-chat-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chat-chip {
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(127, 205, 255, 0.18);
  background: rgba(10, 18, 31, 0.82);
  color: var(--text);
}

.agentid-chat-summary {
  padding: 12px 14px;
  border: 1px solid rgba(127, 205, 255, 0.12);
  border-radius: 16px;
  background: rgba(8, 17, 30, 0.84);
}

.summary-text {
  margin: 0;
}

.agentid-chat-footer {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(127, 205, 255, 0.18);
  background: rgba(8, 17, 30, 0.82);
  color: var(--text);
}

.chat-send {
  padding: 12px 16px;
  border: 1px solid rgba(113, 214, 255, 0.3);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(97, 168, 255, 0.98), rgba(90, 240, 198, 0.9));
  color: #04111e;
  font-weight: 900;
}

.agentid-chat-ctas {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agentid-chat-ctas a {
  width: 100%;
}

.resource-hero {
  max-width: 920px;
}

.resource-hero h1 {
  margin: 8px 0 18px;
  max-width: 18ch;
  font-size: clamp(2.35rem, 5vw, 4.8rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  color: var(--muted-2);
  font-size: 0.88rem;
}

.breadcrumbs a {
  color: var(--muted);
}

.resource-summary,
.kit-preview,
.roi-calculator,
.roi-results {
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at top right, rgba(97, 168, 255, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(10, 21, 36, 0.94), rgba(7, 15, 27, 0.9));
  box-shadow: var(--shadow);
}

.resource-summary {
  margin-top: 26px;
  max-width: 760px;
}

.resource-summary strong {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  line-height: 1.5;
}

.resource-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 28px;
  align-items: start;
  margin-top: 34px;
}

.resource-content {
  display: grid;
  gap: 18px;
}

.resource-section {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(8, 17, 30, 0.82);
}

.resource-section h2 {
  margin: 0 0 12px;
  font-size: clamp(1.45rem, 2.4vw, 2.1rem);
}

.resource-section p,
.resource-section li {
  color: var(--muted);
  line-height: 1.72;
}

.resource-section ul {
  display: grid;
  gap: 9px;
  padding-left: 22px;
}

.resource-sidebar {
  display: grid;
  gap: 16px;
  position: sticky;
  top: 118px;
}

.resource-sidebar .button-primary,
.resource-sidebar .button-secondary {
  width: 100%;
  margin-top: 10px;
}

.calculator-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: 24px;
  align-items: start;
}

.roi-calculator {
  display: grid;
  gap: 18px;
}

.roi-calculator fieldset {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
  padding: 18px;
  border: 1px solid rgba(127, 205, 255, 0.14);
  border-radius: var(--radius-lg);
}

.roi-calculator legend {
  padding: 0 8px;
  color: var(--accent);
  font-weight: 800;
}

.roi-results {
  display: grid;
  gap: 18px;
  position: sticky;
  top: 118px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.result-grid article {
  padding: 16px;
  border: 1px solid rgba(127, 205, 255, 0.14);
  border-radius: var(--radius-md);
  background: rgba(7, 15, 27, 0.76);
}

.result-grid span,
.result-grid strong {
  display: block;
}

.result-grid span {
  color: var(--muted);
  font-size: 0.86rem;
}

.result-grid strong {
  margin-top: 8px;
  font-size: clamp(1.2rem, 2.4vw, 1.75rem);
}

.recommendation {
  padding: 16px;
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: rgba(113, 214, 255, 0.08);
  color: var(--text);
  line-height: 1.55;
}

.kit-preview {
  display: grid;
  gap: 14px;
}

.kit-preview > strong {
  font-size: clamp(1.4rem, 3vw, 2.2rem);
}

.kit-preview ol {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 24px;
  color: var(--muted);
}

.price-badge {
  width: fit-content;
  padding: 9px 13px;
  border-radius: 999px;
  color: #04111e;
  background: linear-gradient(135deg, var(--accent), var(--success));
  font-weight: 900;
}

.product-checkout-form {
  display: grid;
  gap: 8px;
}

.product-offer .cta-box > strong {
  font-size: clamp(1.35rem, 3vw, 2rem);
}

.site-footer {
  width: min(var(--content-width), calc(100% - 32px));
  margin: 0 auto 28px;
  padding: 24px 0 10px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  color: var(--muted);
}

.site-footer strong {
  color: var(--text);
  display: block;
  margin-bottom: 10px;
}

.site-footer small {
  grid-column: 1 / -1;
  color: var(--muted-2);
  border-top: 1px solid var(--line);
  padding-top: 14px;
}

.site-footer a {
  color: var(--muted);
}

.site-footer a:hover {
  color: var(--text);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1120px) {
  .nav-optional:not(.active) {
    display: none;
  }

  .feature-rack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .timeline-grid,
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .site-nav {
    flex-wrap: wrap;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .hero,
  .split-section,
  .site-footer,
  .card-grid,
  .pricing-grid,
  .support-grid,
  .deposit-grid,
  .blueprint-grid,
  .key-value-list,
  .visual-grid,
  .lead-form {
    grid-template-columns: 1fr;
  }

  .resource-layout,
  .calculator-layout {
    grid-template-columns: 1fr;
  }

  .resource-sidebar,
  .roi-results {
    position: static;
  }

  .hero {
    min-height: auto;
    padding-top: 22px;
  }

  .hero-copy h1 {
    max-width: 100%;
  }

  .ownership-strip {
    margin-top: 22px;
  }
}

@media (max-width: 680px) {
  main {
    width: min(var(--content-width), calc(100% - 22px));
    padding-top: 18px;
  }

  .site-nav {
    top: 8px;
    width: calc(100% - 14px);
    padding: 14px;
  }

  .nav-brand {
    min-width: 0;
  }

  .brand-sub,
  .nav-links {
    display: none;
  }

  .nav-cta,
  .button-primary,
  .button-secondary,
  .card-link {
    width: 100%;
  }

  .cta-row,
  .button-row {
    flex-direction: column;
    align-items: stretch;
  }

  .sponsor-house-ad {
    width: calc(100% - 22px);
    flex-direction: column;
    align-items: stretch;
    padding: 18px;
  }

  .benefit-list {
    grid-template-columns: 1fr;
  }

  .scanner-fields,
  .scanner-results,
  .ownership-strip {
    grid-template-columns: 1fr;
  }

  .ownership-strip {
    gap: 8px;
    text-align: left;
  }

  .ownership-strip span {
    width: fit-content;
  }

  .roi-calculator fieldset,
  .result-grid {
    grid-template-columns: 1fr;
  }

  .hero-visual,
  .info-card,
  .feature-card,
  .price-card,
  .support-card,
  .about-panel,
  .side-note,
  .calendar-placeholder,
  .selector-card,
  .blueprint-preview,
  .dashboard-card,
  .dashboard-panel,
  .lookup-form,
  .review-panel,
  .blueprint {
    padding: 16px;
  }

  .feature-rack,
  .dashboard-grid,
  .timeline-grid {
    grid-template-columns: 1fr;
  }

  .agentid-chat {
    right: 10px;
    bottom: 10px;
    left: 10px;
    align-items: end;
  }

  .agentid-chat-panel {
    width: 100%;
    max-height: min(72vh, 680px);
  }

  .agentid-chat-nudge {
    max-width: min(310px, calc(100vw - 20px));
  }

  .site-footer {
    grid-template-columns: 1fr;
  }
}
`;

function organizationSchema(env) {
  const url = siteUrl(env);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName(env),
    url,
    logo: `${url}/favicon.svg`,
    sameAs: [
      env.LINKEDIN_URL || "",
      env.INSTAGRAM_URL || "",
      env.YOUTUBE_URL || "",
      env.X_URL || "",
      env.FACEBOOK_URL || "",
      env.TIKTOK_URL || "",
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: contactEmail(env),
      availableLanguage: ["en"],
    },
  };
}

function professionalServiceSchema(env, serviceType = "AI agent services") {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brandName(env),
    serviceType,
    url: siteUrl(env),
    provider: {
      "@type": "Organization",
      name: brandName(env),
      url: siteUrl(env),
    },
  };
}

function contactPointSchema(env) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    contactType: "sales",
    email: contactEmail(env),
    availableLanguage: ["en"],
    areaServed: "US",
  };
}

function serviceSchema(env, serviceName, description, path = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description,
    url: `${siteUrl(env)}${path}`,
    provider: {
      "@type": "Organization",
      name: brandName(env),
      url: siteUrl(env),
    },
    serviceType: serviceName,
  };
}

function breadcrumbSchema(env, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl(env)}${item.path}`,
    })),
  };
}

function collectionPageSchema(env) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Agent Resources",
    description: "Practical guides, templates, comparisons, and tools for planning useful business AI agents.",
    url: `${siteUrl(env)}/resources`,
    hasPart: [
      ...RESOURCE_PAGES.map((page) => ({
        "@type": "Article",
        name: page.title,
        url: `${siteUrl(env)}${page.path}`,
      })),
      {
        "@type": "SoftwareApplication",
        name: "AI Automation ROI Calculator",
        url: `${siteUrl(env)}/tools/ai-automation-roi-calculator`,
      },
    ],
  };
}

function articleSchema(env, page) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.description,
    datePublished: page.publishedAt || "2026-07-30",
    dateModified: page.updatedAt || page.publishedAt || "2026-07-30",
    mainEntityOfPage: `${siteUrl(env)}${page.path}`,
    author: {
      "@type": "Organization",
      name: brandName(env),
      url: `${siteUrl(env)}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: brandName(env),
      url: siteUrl(env),
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl(env)}/favicon.svg`,
      },
    },
    image: `${siteUrl(env)}/og-image.svg?title=${encodeURIComponent(page.title)}&subtitle=${encodeURIComponent(page.description)}`,
    ...(Array.isArray(page.sources) && page.sources.length
      ? { citation: page.sources.map((source) => source.url) }
      : {}),
  };
}

function softwareApplicationSchema(env) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Automation ROI Calculator",
    description: "Estimate monthly time savings, recovered contribution value, operating cost, payback period, and first-year ROI for a proposed AI automation workflow.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl(env)}/tools/ai-automation-roi-calculator`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

function productSchema(env, product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    url: `${siteUrl(env)}/ai-agent-launch-kit`,
    brand: {
      "@type": "Brand",
      name: brandName(env),
    },
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteUrl(env)}/ai-agent-launch-kit`,
    },
  };
}

function faqSchema(env) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    provider: organizationSchema(env),
  };
}

function renderRobots(env) {
  const sitemap = `${siteUrl(env)}/sitemap.xml`;
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /customer-dashboard",
    "Disallow: /admin-dashboard",
    "Disallow: /onboarding",
    `Sitemap: ${sitemap}`,
  ].join("\n");
}

function renderSitemap(env) {
  const pages = pageEntriesForSitemap(env);
  const urls = pages.map((page) => `
    <url>
      <loc>${escapeXml(`${siteUrl(env)}${page.path}`)}</loc>
      <lastmod>${SITE_CONTENT_LAST_MODIFIED}</lastmod>
      <changefreq>${page.path === "/" ? "weekly" : "monthly"}</changefreq>
      <priority>${page.path === "/" ? "1.0" : "0.7"}</priority>
    </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function renderLlmsTxt(env) {
  const pages = pageEntriesForSitemap(env)
    .map((page) => `- [${page.title}](${siteUrl(env)}${page.path}): ${page.description}`)
    .join("\n");
  return [
    `# ${brandName(env)}`,
    "",
    "Custom AI agents built to help businesses sell, respond, and operate faster.",
    "",
    "## Public pages",
    pages,
    "",
    "## Primary offer",
    "Custom AI agents that answer, organize, sell, schedule, follow up, and automate work for business owners.",
    "",
    "## Conversion path",
    `Book a [free AI strategy call](${siteUrl(env)}/book-a-consultation), [request a custom quote](${siteUrl(env)}/contact), or complete onboarding after purchase.`,
    "",
    "## Compliance",
    "Do not treat this site as medical, legal, or financial advice. Private dashboards and onboarding are not indexable.",
    "",
    `## Contact`,
    `Email: [${contactEmail(env)}](mailto:${contactEmail(env)})`,
  ].join("\n");
}

function renderLlmsFullTxt(env) {
  const pages = pageEntriesForSitemap(env).map((page) => {
    const extra = page.path === "/"
      ? "Explains the core offer in under 5 seconds and drives booking."
      : page.path === "/pricing"
        ? "Shows starting prices, support plans, and deposit-ready options."
        : page.path === "/ai-agents"
          ? "Lists agent types and recommends a fit by business type."
          : page.path === "/contact"
            ? "Validated lead capture for quote and plan requests."
            : page.path === "/book-a-consultation"
              ? "Booking-focused page with qualification and calendar integration."
              : page.path === "/free-ai-automation-audit-checklist"
                ? "Form-gated lead magnet to identify automation opportunities."
                : "Business-focused public page.";
    return `### ${page.path}\n${page.title}\n${page.description}\n${extra}`;
  }).join("\n\n");

  return [
    `# ${brandName(env)} - Full Site Reference`,
    "",
    `${brandName(env)} builds practical AI agents for businesses. The site is sales-first, lead-capture ready, and built for post-purchase onboarding.`,
    "",
    pages,
    "",
    "## Private pages",
    "- /onboarding: customer build-plan intake after purchase",
    "- /customer-dashboard: status, blueprint, and delivery tracking",
    "- /admin-dashboard: internal lead and fulfillment control panel",
    "",
    "## Guardrails",
    "- The chat widget identifies itself as AI.",
    "- The site does not promise guaranteed revenue or compliance.",
    "- Sensitive regulated data should only be collected in compliant implementations.",
    "- Marketing follow-ups require consent.",
    "",
    `## Contact`,
    `Email: ${contactEmail(env)}`,
    `Site: ${siteUrl(env)}`,
  ].join("\n");
}

function buildAiCrawlerPolicy(env) {
  return {
    version: "1.0",
    site: siteUrl(env),
    brand: brandName(env),
    crawlScope: "public pages only",
    allowedPaths: pageEntriesForSitemap(env).map((page) => page.path),
    disallowedPaths: [...AGENTID_PRIVATE_PATHS, "/api/"],
    rules: [
      "Do not crawl private dashboards or onboarding pages.",
      "Do not treat form submissions, chat transcripts, or internal build data as public content.",
      "Do not infer regulated compliance from this site unless explicitly stated and configured.",
      "Respect contact and marketing consent language.",
    ],
    contact: contactEmail(env),
  };
}

function renderOgImage(env, title = brandName(env), subtitle = "Custom AI agents that sell, respond, and automate work") {
  const safeTitle = cleanText(title || brandName(env), 80);
  const safeSubtitle = cleanText(subtitle || "", 140);
  const titleLines = (() => {
    const words = safeTitle.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > 28 && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    return lines.slice(0, 3);
  })();
  const subtitleLines = (() => {
    const words = safeSubtitle.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > 40 && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    return lines.slice(0, 2);
  })();

  const titleText = titleLines.map((line, index) => `<tspan x="70" dy="${index === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`).join("");
  const subtitleText = subtitleLines.map((line, index) => `<tspan x="70" dy="${index === 0 ? 0 : 32}">${escapeXml(line)}</tspan>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(safeTitle)}">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#08121f"/>
        <stop offset="55%" stop-color="#0a1424"/>
        <stop offset="100%" stop-color="#050b14"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#71d6ff"/>
        <stop offset="100%" stop-color="#6df0c6"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18" result="blur"/>
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.25 0 1 0 0 0.7 0 0 1 0 1 0 0 0 0.55 0"/>
      </filter>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1040" cy="110" r="150" fill="#4f9eff" fill-opacity="0.18" filter="url(#glow)"/>
    <circle cx="140" cy="520" r="170" fill="#6df0c6" fill-opacity="0.12" filter="url(#glow)"/>
    <rect x="60" y="54" width="1080" height="522" rx="38" fill="#091424" fill-opacity="0.82" stroke="#7fc9ff" stroke-opacity="0.18"/>
    <text x="70" y="120" fill="#71d6ff" font-size="24" font-weight="800" letter-spacing="5">AGENTID SERVICES</text>
    <text x="70" y="212" fill="#eef6ff" font-size="70" font-weight="900" letter-spacing="-1.5">${titleText}</text>
    <text x="70" y="376" fill="#9cb3cc" font-size="30" font-weight="500">${subtitleText}</text>
    <rect x="70" y="446" width="320" height="70" rx="999" fill="url(#accent)"/>
    <text x="230" y="490" text-anchor="middle" fill="#04111e" font-size="24" font-weight="900">Custom AI agent builds</text>
    <rect x="440" y="446" width="330" height="70" rx="999" fill="#111e31" stroke="rgba(127,205,255,0.22)"/>
    <text x="605" y="490" text-anchor="middle" fill="#eef6ff" font-size="24" font-weight="800">Lead capture + automation</text>
    <rect x="800" y="446" width="270" height="70" rx="999" fill="#111e31" stroke="rgba(127,205,255,0.22)"/>
    <text x="935" y="490" text-anchor="middle" fill="#eef6ff" font-size="24" font-weight="800">Built for businesses</text>
  </svg>`;
}

function renderFavicon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GPTMarketPlus">
    <defs>
      <linearGradient id="iconBg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#71d6ff"/>
        <stop offset="100%" stop-color="#6df0c6"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="#081221"/>
    <rect x="7" y="7" width="50" height="50" rx="13" fill="url(#iconBg)"/>
    <path d="M20 40l7-16h4l7 16h-4.4l-1.5-4h-6.4l-1.4 4H20zm7.1-7h4.7l-2.3-6.4-2.4 6.4z" fill="#04111e"/>
    <circle cx="44" cy="22" r="4" fill="#04111e" opacity="0.8"/>
  </svg>`;
}

function renderSecurityTxt(env) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  return [
    `Contact: mailto:${contactEmail(env)}`,
    `Expires: ${expires}`,
    `Preferred-Languages: en`,
    `Canonical: ${siteUrl(env)}/.well-known/security.txt`,
  ].join("\n");
}

function renderAdsTxt(env) {
  const publisherId = adSensePublisherId(env);
  return [
    `# ${brandName(env)} ads.txt`,
    adSenseEnabled(env) && publisherId
      ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`
      : `# Google AdSense is not active on this host while policy review is pending.`,
    `# Contact: ${contactEmail(env)}`,
  ].join("\n");
}

function renderFeed(env) {
  const now = new Date().toISOString();
  const items = pageEntriesForSitemap(env).slice(0, 8).map((page) => `
    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${escapeXml(`${siteUrl(env)}${page.path}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${siteUrl(env)}${page.path}`)}</guid>
      <pubDate>${escapeXml(now)}</pubDate>
      <description>${escapeXml(page.description)}</description>
    </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(brandName(env))}</title>
    <link>${escapeXml(siteUrl(env))}</link>
    <description>${escapeXml("Custom AI agents built for business.")}</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;
}

function renderJsonFeed(env) {
  const pages = pageEntriesForSitemap(env).slice(0, 8).map((page) => ({
    id: `${siteUrl(env)}${page.path}`,
    url: `${siteUrl(env)}${page.path}`,
    title: page.title,
    content_text: page.description,
  }));
  return {
    version: "https://jsonfeed.org/version/1",
    title: brandName(env),
    home_page_url: siteUrl(env),
    feed_url: `${siteUrl(env)}/feed.json`,
    items: pages,
  };
}

function indexNowKeyFileName(env) {
  return `${String(env.INDEXNOW_KEY || "").trim()}.txt`;
}

function indexNowKeyValue(env) {
  return String(env.INDEXNOW_KEY || "").trim();
}

function applyPublicBrand(env, html) {
  const canonical = siteUrl(env);
  return String(html || "")
    .replaceAll("https://www.agentid.services", canonical)
    .replaceAll("https://agentid.services", canonical)
    .replaceAll("https://www.gptmarketplus.com", canonical)
    .replaceAll("https://gptmarketplus.com", canonical)
    .replaceAll("GPTMarketPlus", brandName(env));
}

export async function handleAgentIdSiteRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  const method = request.method.toUpperCase();

  const respondHtml = (html, privatePage = false, status = 200) => htmlResponse(
    applyPublicBrand(env, html),
    status,
    privatePage ? PRIVATE_HTML_HEADERS : {},
  );

  if (path === "/styles.css") {
    return new Response(STYLES, { headers: CSS_HEADERS });
  }

  if (path === "/favicon.svg" || path === "/favicon.ico") {
    return svgResponse(renderFavicon());
  }

  if (path === "/og-image.svg") {
    return svgResponse(renderOgImage(env, url.searchParams.get("title") || brandName(env), url.searchParams.get("subtitle") || "Custom AI agents that sell, respond, and automate work"));
  }

  if (path === "/robots.txt") {
    return textResponse(renderRobots(env));
  }

  if (path === "/sitemap.xml") {
    return xmlResponse(renderSitemap(env));
  }

  if (path === "/llms.txt") {
    return textResponse(renderLlmsTxt(env));
  }

  if (path === "/llms-full.txt") {
    return textResponse(renderLlmsFullTxt(env));
  }

  if (path === "/ai-crawler-policy.json" || path === "/.well-known/ai-crawler-policy.json") {
    return jsonResponse(buildAiCrawlerPolicy(env));
  }

  if (path === "/security.txt" || path === "/.well-known/security.txt") {
    return textResponse(renderSecurityTxt(env));
  }

  if (path === "/ads.txt") {
    return textResponse(renderAdsTxt(env));
  }

  if (path === `/${GOOGLE_SITE_VERIFICATION_FILE}`) {
    return textResponse(GOOGLE_SITE_VERIFICATION_BODY);
  }

  if (path === "/api/ads/status" && method === "GET") {
    return jsonResponse(adSenseStatus(env), 200, {
      "cache-control": "public, max-age=300",
      "x-robots-tag": "noindex,nofollow",
    });
  }

  if (path === "/feed.xml") {
    return xmlResponse(renderFeed(env));
  }

  if (path === "/feed.json") {
    return jsonResponse(renderJsonFeed(env));
  }

  const indexNowFile = indexNowKeyFileName(env);
  if (indexNowFile && path === `/${indexNowFile}`) {
    return textResponse(indexNowKeyValue(env));
  }

  if ((path === "/api/campaign-links" || path === "/api/utm-links") && method === "GET") {
    return jsonResponse({
      ok: true,
      generatedAt: new Date().toISOString(),
      links: campaignLinkCatalog(env),
    });
  }

  if (path === "/api/admin/attribution" && method === "GET") {
    if (!(await hasAdminAccess(request, env))) {
      return jsonResponse(
        { ok: false, error: "Admin authorization required." },
        401,
        {
          "cache-control": "private, no-store",
          "www-authenticate": "Bearer",
          "x-robots-tag": "noindex,nofollow",
        },
      );
    }
    const days = Math.max(1, Math.min(90, Math.round(Number(url.searchParams.get("days")) || 7)));
    return jsonResponse(
      await loadAttributionHealth(env, days),
      200,
      {
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex,nofollow",
      },
    );
  }

  if (path === "/api/events" && method === "POST") {
    return handleAnalyticsEventSubmission(request, env, ctx);
  }

  if (path === "/api/genai/status" && method === "GET") {
    const config = agentIdGenAiConfig(env);
    return jsonResponse({
      ok: true,
      provider: "Google Cloud Agent Search",
      configured: config.configured,
      fallbackProvider: "Cloudflare AI Search",
      fallbackConfigured: Boolean(env.AGENTID_AI_SEARCH),
      projectId: config.projectId,
      location: config.location,
      engineId: config.engineId,
      corpus: "Public GPTMarketPlus pages only",
    }, 200, {
      "cache-control": "public, max-age=60",
    });
  }

  if (path === "/api/chat" && method === "POST") {
    return handleChat(request, env, ctx);
  }

  if (path === "/api/contact" && method === "POST") {
    return handleContactSubmission(request, env, ctx);
  }

  if (path === "/api/book-consultation" && method === "POST") {
    return handleBookingSubmission(request, env, ctx);
  }

  if (path === "/api/lead-magnet" && method === "POST") {
    return handleLeadMagnetSubmission(request, env, ctx);
  }

  if (path === "/api/digital-products/ai-agent-launch-kit" && method === "GET") {
    const access = await verifyDigitalProductSession(env, url.searchParams.get("session_id"), DIGITAL_PRODUCTS[0].id);
    if (!access.ok) {
      return jsonResponse({ ok: false, error: access.error }, access.status, {
        "x-robots-tag": "noindex,nofollow,noarchive",
      });
    }
    return textResponse(renderLaunchKitMarkdown(), 200, {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="AI-Agent-Launch-Kit.md"',
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex,nofollow,noarchive",
    });
  }

  if (path === "/api/onboarding" && method === "POST") {
    return handleOnboarding(request, env, ctx);
  }

  if (path === "/api/checkout" && method === "POST") {
    return handleCheckout(request, env);
  }

  if (path === "/api/stripe/webhook" || path === "/api/agents/stripe/webhook") {
    if (method === "POST") {
      return handleStripeWebhook(request, env, ctx);
    }
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  if (path === "/") {
    const state = await publicAgentState(env);
    return respondHtml(renderHomePage(env, state));
  }

  if (path === "/services") {
    return respondHtml(renderServicesPage(env));
  }

  if (path === "/ai-agents") {
    return respondHtml(renderAgentsPage(env));
  }

  if (path === "/pricing") {
    return respondHtml(renderPricingPage(env));
  }

  if (path === "/use-cases") {
    return respondHtml(renderUseCasesPage(env));
  }

  if (path === "/resources") {
    return respondHtml(renderResourcesPage(env));
  }

  const resourcePage = RESOURCE_PAGES.find((page) => page.path === path);
  if (resourcePage) {
    return respondHtml(renderResourceArticlePage(env, resourcePage));
  }

  if (path === "/tools/ai-automation-roi-calculator") {
    return respondHtml(renderRoiCalculatorPage(env));
  }

  if (path === "/ai-agent-launch-kit") {
    return respondHtml(renderLaunchKitPage(env));
  }

  if (path === "/downloads/ai-agent-launch-kit") {
    return respondHtml(await renderLaunchKitDownloadPage(env, url.searchParams.get("session_id") || ""), true);
  }

  if (path === "/about") {
    return respondHtml(renderAboutPage(env));
  }

  if (path === "/contact") {
    return respondHtml(renderContactPage(env, url));
  }

  if (path === "/book-a-consultation" || path === "/consultation") {
    return respondHtml(renderBookingPage(env));
  }

  if (path === "/faq") {
    return respondHtml(renderFaqPage(env));
  }

  if (path === "/privacy") {
    return respondHtml(renderPrivacyPage(env));
  }

  if (path === "/terms") {
    return respondHtml(renderTermsPage(env));
  }

  if (path === "/refund-policy") {
    return respondHtml(renderRefundPolicyPage(env));
  }

  if (path === "/free-ai-automation-audit-checklist" || path === "/lead-magnet") {
    return respondHtml(renderLeadMagnetPage(env));
  }

  if (path === "/onboarding" || path === "/client-onboarding") {
    const access = await verifyOnboardingAccess(env, {
      sessionId: url.searchParams.get("session_id") || url.searchParams.get("sessionId") || "",
      dashboardToken: url.searchParams.get("token") || "",
      paypalOrderId: url.searchParams.get("order_id") || "",
      paypalAccessToken: url.searchParams.get("access_token") || "",
    });
    if (!access.ok) {
      return respondHtml(renderOnboardingAccessRequiredPage(env), true, 403);
    }
    return respondHtml(renderOnboardingPage(env, {
      sessionId: access.sessionId || "",
      dashboardToken: access.dashboardToken,
      paypalOrderId: access.paypalOrderId || "",
      paypalAccessToken: access.paypalAccessToken || "",
      packageName: access.packageName,
    }), true);
  }

  if (path === "/customer-dashboard") {
    return respondHtml(await renderCustomerDashboardPage(env, {
      token: url.searchParams.get("token") || "",
    }), true);
  }

  if (path === "/admin-dashboard") {
    return respondHtml(await renderAdminDashboardPage(env, request), true);
  }

  return null;
}

async function renderCustomerDashboardPage(env, context = {}) {
  const workspace = await resolveCustomerWorkspace(env, context);
  const { lead, purchase, onboarding } = workspace;

  if (!workspace.token && !lead && !purchase && !onboarding) {
    const body = `
      <section class="page-hero split-section">
        <div>
          ${renderSectionTitle("Customer Dashboard", "Open your build plan with your access token", "Use the token from your purchase, onboarding, or delivery email.")}
          <p>This dashboard keeps the build process visible. Once we have your token or record, you’ll see the blueprint, status stages, and next steps.</p>
        </div>
        <div class="review-panel">
          ${renderLookupPanel({
            action: "/customer-dashboard",
            name: "token",
            placeholder: "Enter your dashboard token",
            button: "Open Dashboard",
            note: "If you completed purchase, use the token from your onboarding link or email.",
          })}
        </div>
      </section>`;

    return renderShell(env, {
      path: "/customer-dashboard",
      title: "Customer Dashboard",
      description: "Track onboarding, blueprint generation, and build progress.",
      body,
      robots: "noindex,nofollow",
      bodyClass: "page-dashboard page-customer-dashboard",
      privatePage: true,
    });
  }

  const packageName = workspace.packageName;
  const agentType = workspace.agentType;
  const stage = workspace.stage;
  const progress = buildProgressPercent(stage);
  const stageText = stageLabel(stage);
  const customerBlueprint = onboarding?.customer_blueprint_html || buildCustomerBlueprint({
    businessName: lead?.business_name || onboarding?.business_name || "Your business",
    packageName,
    agentName: agentType,
    agentType,
    businessType: lead?.business_type || onboarding?.business_type || "",
    mainProblem: onboarding?.main_problem || lead?.pain_point || "",
    desiredAutomation: onboarding?.current_lead_process || lead?.desired_automation || lead?.pain_point || "",
    toolsUsed: onboarding?.tools_used || "",
    dataFields: [
      "Business name",
      "Website URL",
      "Business type",
      "Main service",
      "Target customers",
      "Main problem",
    ],
    nextAction: onboarding?.launch_notes || lead?.next_action || "Review the plan, confirm integrations, and move into implementation.",
    complianceNotes: onboarding?.compliance_concerns || "No special compliance notes provided.",
  });
  const internalBlueprint = safeJsonParse(onboarding?.internal_blueprint_json, null) || buildInternalBlueprint({
    client: `${lead?.business_name || onboarding?.business_name || "Client"} · ${lead?.business_type || onboarding?.business_type || "Business"}`,
    packageName,
    agentType,
    requiredFeatures: [
      "Lead capture",
      "Qualification flow",
      "Owner notifications",
      "Analytics events",
    ],
    integrations: onboarding?.tools_used ? onboarding.tools_used.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) : [
      "Website",
      "Email",
      "CRM",
      "Calendar",
    ],
    dataModel: [
      "Lead record",
      "Onboarding record",
      "Purchase record",
      "Event log",
    ],
    prompt: onboarding?.system_prompt_text || buildAgentPrompt({
      businessName: lead?.business_name || onboarding?.business_name || "the business",
      businessType: lead?.business_type || onboarding?.business_type || "",
      packageName,
      mainProblem: onboarding?.main_problem || lead?.pain_point || "",
      desiredAutomation: onboarding?.current_lead_process || lead?.desired_automation || "",
      allowedToSay: onboarding?.allowed_to_say || "",
      neverToSay: onboarding?.never_to_say || "",
      escalationRules: onboarding?.escalation_rules || "",
      tone: onboarding?.tone || "professional, direct, modern, confident, practical, and sales-focused",
      complianceConcerns: onboarding?.compliance_concerns || "",
      recommendedAgentType: agentType,
    }),
    workflowLogic: [
      "Greet the visitor",
      "Qualify the lead",
      "Recommend the best package",
      "Capture contact details",
      "Route to booking, quote, or deposit",
    ],
    automationRules: [
      "Hot lead => owner alert",
      "Warm lead => follow-up sequence",
      "Cold lead => education and permission",
    ],
    escalationRules: [
      "Escalate sensitive or regulated questions to the owner",
      "Escalate ambiguous requests to a human review",
    ],
    testingRequirements: [
      "Validate forms",
      "Check lead scoring",
      "Verify CTA routing",
      "Confirm analytics events",
    ],
    deliveryChecklist: [
      "Customer-facing blueprint",
      "Internal build plan",
      "Agent prompt draft",
      "Follow-up sequence",
    ],
    supportPlan: "Launch support, optimization, and update cycles based on the selected package.",
  });
  const integrationPlan = safeJsonParse(onboarding?.integration_plan_json, null) || {
    toolsUsed: onboarding?.tools_used || "",
    businessType: lead?.business_type || onboarding?.business_type || "",
    packageName,
  };
  const trainingFiles = String(onboarding?.training_files || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const keyFacts = [
    { label: "Purchased package", value: packageName },
    { label: "Agent type", value: agentType },
    { label: "Build status", value: stageText },
    { label: "Progress", value: formatPercent(progress) },
    { label: "Lead status", value: lead?.lead_status || purchase?.status || "Active" },
    { label: "Launch date", value: formatDateShort(onboarding?.desired_launch_date || null) },
  ];

  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderSectionTitle("Customer Dashboard", "Your AI agent build plan and delivery status", "Track onboarding, blueprint generation, and build progress.")}
        <p>This dashboard shows what we are building, what stage the project is in, and what we still need from you.</p>
        <div class="button-row">
          <a class="button-primary" href="${escapeHtml(onboarding?.onboarding_url || `/onboarding?token=${encodeURIComponent(workspace.token || lead?.dashboard_token || purchase?.dashboard_token || "")}`)}">Continue onboarding</a>
          <a class="button-secondary" href="/contact">Message support</a>
        </div>
      </div>
      <div class="dashboard-card">
        <p class="card-kicker">Current status</p>
        <strong>${escapeHtml(stageText)}</strong>
        <p>${escapeHtml(buildLeadSummary(lead || { leadTag: purchase?.status || "WARM", businessType: lead?.business_type || onboarding?.business_type || "", recommendedPackage: packageName, painPoint: lead?.pain_point || onboarding?.main_problem || "", budgetRange: lead?.budget_range || "", timeline: lead?.timeline || "" }))}</p>
        <div class="status-pill">Progress: ${escapeHtml(formatPercent(progress))}</div>
      </div>
    </section>

    <section class="section">
      ${renderCardGrid([
        { kicker: "Package", title: packageName, description: "This is the package tied to your build slot and onboarding." },
        { kicker: "Agent type", title: agentType, description: "The recommended agent type based on your business and workflow." },
        { kicker: "Delivery stage", title: stageText, description: "Your build is tracked through clear stages instead of a hidden black box." },
        { kicker: "Next action", title: "Keep onboarding moving", description: onboarding?.launch_notes || lead?.next_action || "Review the build plan, confirm integrations, and move into implementation." },
      ])}
    </section>

    <section class="section split-section">
      <div>
        ${renderSectionTitle("Build stages", "Where the project stands right now", "Every customer sees the same stage model: purchase, onboarding, blueprint, build, testing, review, launch, and optimization.")}
        ${renderStageTimeline(stage)}
      </div>
      <div class="side-note">
        ${renderKeyValueList(keyFacts)}
      </div>
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle("What we are building", "Your AI Agent Build Plan", "The customer-facing blueprint is generated from your business details and package.")}
      ${customerBlueprint}
    </section>

    <section class="section split-section">
      <div>
        ${renderSectionTitle("Internal plan", "Prompt, integrations, and workflow details", "This is the technical build view that keeps the delivery process aligned.")}
        <pre class="code-block">${escapeHtml(JSON.stringify(internalBlueprint, null, 2))}</pre>
      </div>
      <div class="side-note">
        <p class="card-kicker">Integration plan</p>
        <pre class="code-block">${escapeHtml(JSON.stringify(integrationPlan, null, 2))}</pre>
      </div>
    </section>

    <section class="section split-section">
      <div>
        ${renderSectionTitle("Files and instructions", "Training inputs we have received", "These are the docs, FAQs, service lists, scripts, or notes that will train the agent.")}
        <ul class="checklist">
          ${(trainingFiles.length ? trainingFiles : ["No files listed yet. Add FAQs, service docs, scripts, or uploaded references during onboarding."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <div class="side-note">
        <p class="card-kicker">Support plan</p>
        <p>${escapeHtml(onboarding?.launch_notes || "Launch support and optimization are available after the initial build.")}</p>
        <a class="button-secondary" href="/contact">Request an update</a>
      </div>
    </section>
  `;

  return renderShell(env, {
    path: "/customer-dashboard",
    title: "Customer Dashboard",
    description: "Track onboarding, blueprint generation, and build progress.",
    body,
    robots: "noindex,nofollow",
    bodyClass: "page-dashboard page-customer-dashboard",
    privatePage: true,
  });
}

async function renderAdminDashboardPage(env, request) {
  const accessGranted = await hasAdminAccess(request, env);
  if (!accessGranted) {
    const body = `
      <section class="page-hero split-section">
        <div>
          ${renderSectionTitle("Admin Dashboard", "Private owner dashboard", "Administrative data is available only through authenticated requests.")}
          <p>This browser page never accepts credentials in its URL. Use an Authorization bearer header through the protected operator workflow.</p>
        </div>
        <div class="admin-login">
          <p class="form-note">Example: <code>curl -H 'Authorization: Bearer &lt;admin-token&gt;' https://gptmarketplus.com/admin-dashboard</code></p>
        </div>
      </section>`;

    return renderShell(env, {
      path: "/admin-dashboard",
      title: "Admin Dashboard",
      description: "Monitor leads, bookings, purchases, onboarding, and build status.",
      body,
      robots: "noindex,nofollow",
      bodyClass: "page-dashboard page-admin-dashboard",
      privatePage: true,
    });
  }

  const [stats, attribution] = await Promise.all([
    loadAgentIdStats(env),
    loadAttributionHealth(env, 7),
  ]);
  const mostRequested = (stats.mostRequestedAutomation || []).slice(0, 5);
  const mostCommon = (stats.mostCommonObjections || []).slice(0, 5);
  const latestLeads = stats.latestLeads || [];
  const latestPurchases = stats.latestPurchases || [];
  const latestOnboarding = stats.latestOnboarding || [];
  const latestEvents = stats.latestEvents || [];

  const body = `
    <section class="page-hero split-section">
      <div>
        ${renderSectionTitle("Admin Dashboard", "Lead, sales, and fulfillment command center", "Review hot leads, booked calls, quote requests, deposits, and build progress.")}
        <p>Respond within 15 minutes if possible when a hot lead comes in. This dashboard keeps the next action visible.</p>
      </div>
      <div class="dashboard-card">
        <p class="card-kicker">Owner note</p>
        <strong>Focus on hot leads, deposits, and builds waiting on onboarding.</strong>
        <p class="dashboard-note">The goal is to keep sales and fulfillment moving even when the owner is unavailable.</p>
      </div>
    </section>

    <section class="section">
      ${renderStatCards({
        totalLeads: stats.totalLeads,
        hotLeads: stats.hotLeads,
        bookedCalls: stats.bookedCalls,
        quoteRequests: stats.quoteRequests,
        depositsReceived: stats.depositsReceived,
        estimatedPipelineCents: stats.estimatedPipelineCents,
      })}
    </section>

    <section class="section">
      ${renderCardGrid([
        { kicker: "Conversion rate", title: formatPercent((stats.conversionRate || 0) * 100), description: "Booked calls and deposits compared to total leads." },
        { kicker: "Active builds", title: String(stats.activeBuilds || 0), description: "Onboarding records that are not yet live or optimized." },
        { kicker: "Awaiting onboarding", title: String(stats.awaitingOnboarding || 0), description: "Purchases that need the onboarding form completed." },
        { kicker: "Ready for review", title: String(stats.readyForReview || 0), description: "Builds waiting for client review or approval." },
      ])}
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle(
        "Attribution health",
        "Seven-day source and campaign coverage",
        "Private aggregate monitoring for tagged sessions, direct or untagged traffic, landing pages, chat opens, and lead events."
      )}
      ${renderCardGrid([
        {
          kicker: "Measurement status",
          title: attribution.statusLabel,
          description: attribution.summary.totalSessions < 5
            ? "Session tracking is collecting a fresh post-fix baseline. Historical events did not include anonymous session IDs."
            : "Coverage is scored from anonymous sessions with UTM source, medium, or campaign data.",
        },
        {
          kicker: `Tagged ${attribution.summary.coverageBasis}`,
          title: formatPercent(attribution.summary.taggedCoverageRate),
          description: `${attribution.summary.taggedSessions} tagged sessions and ${attribution.summary.taggedEvents} tagged events in the rolling window.`,
        },
        {
          kicker: "Anonymous sessions",
          title: String(attribution.summary.totalSessions),
          description: `${attribution.summary.totalEvents} aggregate events observed in the last ${attribution.windowDays} days.`,
        },
        {
          kicker: "High-intent activity",
          title: `${attribution.summary.chatOpens} chat opens`,
          description: `${attribution.summary.leadEvents} lead events and ${attribution.summary.chatPromptViews} pricing prompt views.`,
        },
      ])}
      <div class="review-panel">
        <p><strong>Latest event:</strong> ${escapeHtml(attribution.summary.latestSeenAt ? formatDateTime(attribution.summary.latestSeenAt) : "No events yet")}</p>
        <p>${escapeHtml(attribution.privacy)}</p>
        <p>Machine-readable report: <code>GET /api/admin/attribution?days=7</code> with the admin bearer token. Valid windows are 1 to 90 days.</p>
      </div>
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle("Attribution channels", "Source, medium, and campaign", "Use this table to identify which tagged links drive chat opens and lead events.")}
      ${attribution.channels.length ? renderRows(attribution.channels, [
        { label: "Source", value: (row) => row.source || "(direct / untagged)" },
        { label: "Medium", value: (row) => row.medium || "(none)" },
        { label: "Campaign", value: (row) => row.campaign || "(none)" },
        { label: "Sessions", value: (row) => row.sessions || 0 },
        { label: "Events", value: (row) => row.events || 0 },
        { label: "Chat opens", value: (row) => row.chat_opens || 0 },
        { label: "Lead events", value: (row) => row.lead_events || 0 },
      ]) : `<div class="review-panel"><p>No attribution events are available yet.</p></div>`}
    </section>

    <section class="section split-section">
      <div class="dashboard-section">
        ${renderSectionTitle("Landing pages", "Where tracked sessions enter", "")}
        ${attribution.landingPages.length ? renderRows(attribution.landingPages.slice(0, 10), [
          { label: "Landing page", value: (row) => row.landing_page || "/" },
          { label: "Sessions", value: (row) => row.sessions || 0 },
          { label: "Events", value: (row) => row.events || 0 },
          { label: "Chat", value: (row) => row.chat_opens || 0 },
        ]) : `<div class="review-panel"><p>No landing-page data is available yet.</p></div>`}
      </div>
      <div class="dashboard-section">
        ${renderSectionTitle("Daily attribution", "Rolling collection trend", "")}
        ${attribution.daily.length ? renderRows(attribution.daily.slice(0, 10), [
          { label: "Day", value: (row) => row.day || "" },
          { label: "Sessions", value: (row) => row.sessions || 0 },
          { label: "Events", value: (row) => row.events || 0 },
          { label: "Tagged", value: (row) => row.tagged_events || 0 },
          { label: "Chat", value: (row) => row.chat_opens || 0 },
        ]) : `<div class="review-panel"><p>No daily attribution data is available yet.</p></div>`}
      </div>
    </section>

    <section class="section split-section">
      <div>
        ${renderSectionTitle("Most requested automation", "What prospects ask for most", "")}
        <div class="feature-rack">
          ${(mostRequested.length ? mostRequested : [{ label: "Lead capture", value: 0 }]).map((item) => `
            <article class="feature-card">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(String(item.value || 0))} leads mentioned this automation theme.</span>
            </article>
          `).join("")}
        </div>
      </div>
      <div>
        ${renderSectionTitle("Most common objections", "What slows the close", "")}
        <div class="feature-rack">
          ${(mostCommon.length ? mostCommon : [{ label: "Cost", value: 0 }]).map((item) => `
            <article class="feature-card">
              <strong>${escapeHtml(item.label || "Unknown")}</strong>
              <span>${escapeHtml(String(item.value || 0))} leads raised this objection.</span>
            </article>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle("Latest leads", "New lead records and chat summaries", "")}
      ${latestLeads.length ? renderRows(latestLeads, [
        { label: "Business", value: (row) => row.business_name || row.business_type || row.name || "Unknown" },
        { label: "Tag", value: (row) => row.lead_status || "COLD" },
        { label: "Package", value: (row) => row.recommended_package || "" },
        { label: "Score", value: (row) => row.lead_score ?? "" },
        { label: "Contact", value: (row) => row.email || row.phone || "" },
        { label: "Next action", value: (row) => row.next_action || "" },
      ]) : `<div class="review-panel"><p>No leads have been captured yet.</p></div>`}
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle("Purchases and deposits", "Checkout activity and revenue pipeline", "")}
      ${latestPurchases.length ? renderRows(latestPurchases, [
        { label: "Package", value: (row) => row.package_name || row.package_id || "" },
        { label: "Status", value: (row) => row.status || "" },
        { label: "Amount", value: (row) => formatMoney(row.amount_cents || 0) },
        { label: "Checkout", value: (row) => row.checkout_type || "" },
        { label: "Email", value: (row) => row.customer_email || "" },
        { label: "Created", value: (row) => formatDateTime(row.created_at) },
      ]) : `<div class="review-panel"><p>No purchases are stored yet.</p></div>`}
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle("Onboarding and builds", "Customer workflow and blueprints", "")}
      ${latestOnboarding.length ? renderRows(latestOnboarding, [
        { label: "Business", value: (row) => row.business_name || "" },
        { label: "Package", value: (row) => row.package_tier || "" },
        { label: "Stage", value: (row) => stageLabel(row.build_status_stage || "") },
        { label: "Launch date", value: (row) => formatDateShort(row.desired_launch_date || "") },
        { label: "Website", value: (row) => row.website_url || "" },
        { label: "Created", value: (row) => formatDateTime(row.created_at) },
      ]) : `<div class="review-panel"><p>No onboarding records are stored yet.</p></div>`}
    </section>

    <section class="section dashboard-section">
      ${renderSectionTitle("Recent events", "Analytics and funnel tracking", "")}
      ${latestEvents.length ? renderRows(latestEvents, [
        { label: "Event", value: (row) => row.event_name || "" },
        { label: "Page", value: (row) => row.source_page || "" },
        { label: "Lead", value: (row) => row.lead_id || "" },
        { label: "Session", value: (row) => row.session_id || "" },
        { label: "Created", value: (row) => formatDateTime(row.created_at) },
      ]) : `<div class="review-panel"><p>No analytics events are stored yet.</p></div>`}
    </section>
  `;

  return renderShell(env, {
    path: "/admin-dashboard",
    title: "Admin Dashboard",
    description: "Monitor leads, bookings, purchases, onboarding, and build status.",
    body,
    robots: "noindex,nofollow",
    bodyClass: "page-dashboard page-admin-dashboard",
    privatePage: true,
  });
}

async function handleContactSubmission(request, env, ctx) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const isSponsorApplication = cleanText(body.applicationType || "", 40).toLowerCase() === "sponsor";
  const result = await captureLead(env, ctx, body, {
    request,
    submissionType: "contact",
    sourcePage: body.sourcePage || new URL(request.url).pathname,
    requiredFields: isSponsorApplication
      ? ["name", "email", "businessName", "website", "whatDoYouWantToAutomate", "contactConsent"]
      : [
          "name",
          "email",
          "phone",
          "businessName",
          "website",
          "businessType",
          "whatDoYouWantToAutomate",
          "budgetRange",
          "timeline",
          "preferredContactMethod",
          "contactConsent",
        ],
    message: isSponsorApplication
      ? "Thanks. Your sponsor application has been received for review. No charge has been created."
      : "Thanks. Your AI Agent Plan request has been received.",
    trackEvent: isSponsorApplication ? "sponsor_application_submit" : "contact_submit",
    quoteRequested: true,
    crmStage: isSponsorApplication ? "sponsor_application" : "qualified",
  });

  if (!result.ok) {
    return jsonResponse({ ok: false, error: result.error, retryAfter: result.retryAfter }, result.status || 400);
  }

  return jsonResponse(result.response);
}

async function handleBookingSubmission(request, env, ctx) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const result = await captureLead(env, ctx, body, {
    request,
    submissionType: "booking",
    sourcePage: body.sourcePage || new URL(request.url).pathname,
    requiredFields: [
      "name",
      "email",
      "businessName",
      "businessType",
      "whatDoYouWantToAutomate",
      "budgetRange",
      "timeline",
      "preferredContactMethod",
      "contactConsent",
    ],
    message: "Your free AI strategy call request has been received.",
    trackEvent: "booking_submit",
    bookedCall: true,
    crmStage: "strategy_call_booked",
  });

  if (!result.ok) {
    return jsonResponse({ ok: false, error: result.error, retryAfter: result.retryAfter }, result.status || 400);
  }

  return jsonResponse(result.response);
}

async function handleLeadMagnetSubmission(request, env, ctx) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const result = await captureLead(env, ctx, body, {
    request,
    submissionType: "lead_magnet",
    sourcePage: body.sourcePage || new URL(request.url).pathname,
    requiredFields: [
      "name",
      "email",
      "phone",
      "businessType",
      "website",
      "contactConsent",
    ],
    message: "Your checklist request has been received.",
    trackEvent: "lead_magnet_submit",
    crmStage: "nurture",
  });

  if (!result.ok) {
    return jsonResponse({ ok: false, error: result.error, retryAfter: result.retryAfter }, result.status || 400);
  }

  return jsonResponse(result.response);
}

async function handleAnalyticsEventSubmission(request, env, ctx) {
  const body = await readJson(request);
  if (body === BODY_TOO_LARGE) return payloadTooLargeResponse();
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const rate = await rateLimit(env, request, "event");
  if (!rate.ok) {
    return jsonResponse({ ok: false, error: "Rate limited.", retryAfter: rate.retryAfter }, 429);
  }

  const eventName = cleanText(body.eventName || body.event || "event", 120);
  const sourcePage = cleanText(body.sourcePage || new URL(request.url).pathname, 200);
  const leadId = cleanText(body.leadId || "", 120);
  const conversationId = cleanText(body.conversationId || "", 120);
  const sessionId = cleanText(body.sessionId || "", 160);
  const properties = typeof body.properties === "object" && body.properties ? body.properties : {};

  await dbInsertEvent(env, {
    event_name: eventName,
    source_page: sourcePage,
    lead_id: leadId,
    conversation_id: conversationId,
    session_id: sessionId,
    properties_json: properties,
    user_agent: request.headers.get("user-agent") || "",
  });

  return jsonResponse({ ok: true, recorded: true, eventName });
}
