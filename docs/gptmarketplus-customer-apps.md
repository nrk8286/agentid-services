# GPTMarketPlus customer applications: v1 product contract

## Purpose and audience

This contract defines the first customer-facing application GPTMarketPlus may plan,
configure, or implement for a small service business: the **Lead Capture & Follow-Up
Agent**. It is written for company owners, implementation staff, and GPTMarketPlus
operators so that the customer promise, delivery boundary, and acceptance standard are
the same in sales, onboarding, and delivery.

The v1 agent is a bounded revenue-operations workflow. Its job is to collect a
consented inquiry, qualify it against company-defined rules, create a visible follow-up
task, and hand the conversation to a named human owner. It is not an autonomous sales
representative, CRM replacement, appointment guarantee, or promise of revenue.

## Commercial model and scope boundary

### Start with the $29 Launch Kit

The verified self-service product is the **$29 AI Agent Launch Kit**. After a verified
PayPal payment, it provides a private workspace and starter pack: a workflow brief,
starter prompt, lead-intake and consent plan, follow-up sequence, scenario QA checklist,
and 30-day scorecard. The kit helps a company define a usable first version; it does not
install or operate a production customer app.

The Launch Kit is the appropriate starting point when a company needs to choose its
offer, best-fit lead, first workflow, tone, approved knowledge, boundaries, and handoff
rules. The company can use the materials itself or request implementation help.

### Paid onboarding and custom implementation

Production setup is paid onboarding or custom implementation only after GPTMarketPlus
and the company agree to a written scope. The written scope must state the workflow,
systems to connect, authorized company content, responsible owner, delivery milestones,
test cases, price, and support terms before a payment link or invoice is issued.

The base v1 scope is one company, one lead source or intake surface, one designated
owner/handoff destination, one agreed qualification model, and one agreed follow-up
sequence. Additional channels, CRM/calendar/messaging integrations, data migration,
multiple locations or brands, bespoke dashboards, after-hours coverage, and ongoing
operations are custom-scope items. They are not included merely because they are
mentioned in the Launch Kit or requested in a form.

Custom services are reviewed proposals, not self-service checkout products. GPTMarketPlus
does not enable custom-service billing or begin implementation without an approved
written scope and a realistic fulfillment path.

## What a company gets in v1

Subject to the written scope, a company receives a configured lead workflow with:

- A company-branded or company-approved lead intake surface for the agreed channel.
- Required contact-consent language and agreed intake fields, such as name, email,
  business, requested service, timing, and stated goal.
- Basic validation and abuse protection appropriate to the agreed intake surface.
- A transparent qualification rule set using only the company-approved fields and
  criteria; for example, hot, warm, nurture, or excluded/test.
- A lead record and follow-up task containing the minimum details needed for the owner
  to respond.
- A named human owner or agreed queue that receives the handoff and can make the final
  decision.
- An agreed acknowledgment and follow-up sequence, including the message templates,
  timing, stop conditions, and human escalation point.
- A launch checklist, scenario-based test record, and a 30-day scorecard for agreed
  operational measures such as valid inquiries, owner response time, and handoffs.

The included deliverable is the configured workflow and its agreed documentation. It
does not include an unlimited number of revisions, lead generation, purchased lists,
unlimited integrations, human answering services, campaign management, or ongoing
optimization unless those items are explicitly written into the paid scope.

## Visitor flow

1. A visitor reaches the agreed web, chat, or other intake surface and sees what the
   company is offering and how to request contact.
2. The visitor supplies the requested information and affirmatively consents to contact
   about that request. Required fields and consent wording are set in the written scope.
3. The system validates the submission and applies the agreed anti-abuse controls. An
   invalid, incomplete, duplicate, test, internal, or suspicious submission may be
   rejected, marked excluded, or routed for review rather than treated as a sales lead.
4. A valid consented submission receives the agreed confirmation. The confirmation may
   acknowledge receipt; it must not imply a booking, quote, eligibility decision, or
   guaranteed response unless the company has separately committed to it.
5. The agent classifies the inquiry using the agreed criteria, records the result, and
   creates the appropriate owner follow-up task.
6. Any automated follow-up is limited to the approved sequence, approved sender,
   consent basis, and stop rules. A human owner handles advice, pricing, contractual
   commitments, exceptions, and any request outside the workflow.

## Owner flow

1. The designated owner receives the lead/task handoff with the information needed to
   review the request, including its source, consent status, classification, and stated
   need.
2. The owner reviews accuracy and context before communicating. Agent classifications
   are prioritization aids, not final decisions.
3. The owner accepts, reassigns, declines, or marks the task as not actionable according
   to the company process. The owner supplies any quote, booking confirmation, legal,
   medical, financial, employment, or other regulated decision.
4. The owner records the agreed outcome where the written scope provides a place to do
   so, and observes unsubscribe, suppression, and do-not-contact requests immediately.
5. During the 30-day launch review, the company and GPTMarketPlus inspect operational
   evidence and decide whether to keep, adjust, expand, or stop the workflow. Expansion
   beyond the written scope requires a new written scope.

## Data boundaries and tenant rules

### Data minimization

The agent collects only the fields necessary for the agreed intake, qualification,
handoff, and measurement workflow. A typical v1 record is limited to contact details,
the visitor's stated request, source, consent status, timestamps, classification, and
task status. The company must not use the intake to collect payment-card data,
government identifiers, passwords, authentication tokens, or special-category/sensitive
personal data unless a separate written scope explicitly addresses a lawful and secure
handling design.

The workflow must not buy, scrape, enrich, or upload contact lists outside the
company's authority. It must not use visitor data to train a public model or make it
available to other customers.

### Tenant isolation and access

Each company is a separate tenant. Tenant data, credentials, prompts, approved knowledge,
conversation content, lead records, task queues, and reporting must be logically scoped
to that tenant and never exposed to another customer. Public status pages may show only
aggregate, non-customer-specific information.

Access follows least privilege:

- Visitor-facing surfaces may accept only the agreed, consented submission and return
  only a confirmation appropriate to that visitor.
- Company owners receive only their own tenant's lead and task information.
- GPTMarketPlus staff access customer data only when required to deliver, support,
  secure, or audit the agreed service, and only through authorized administrative
  controls.
- Credentials remain server-side and are never placed in browser code, public prompts,
  logs, or documentation. Administrative access uses separate authorization and must
  not rely on query-string secrets.

Private onboarding, customer, and administrative responses must be non-indexable and
must not be stored in shared/public caches. Logs and analytics must avoid secrets, full
payment tokens, and unnecessary customer content. Retention, deletion, export, and
processor requirements that differ from the standard implementation require written
scope before launch.

### Standard v1 retention and access session

The hosted v1 app retains lead records for up to 90 days, then removes them during the
next capture or operational cleanup. An authenticated owner can remove an individual
lead sooner from the private workspace. The public form does not accept or store
arbitrary metadata. A dashboard token is exchanged once for a short-lived,
HttpOnly/Secure/SameSite owner session; the clean private-app URL contains no bearer
token. Longer retention, export, legal hold, or a different deletion workflow requires
written scope before launch.

### Security and messaging safeguards

The v1 intake uses app-scoped rate limiting and server-verified Turnstile when enabled,
plus a honeypot and consent validation. Input is validated and safely handled before it
is displayed, stored, or used in a task. The
workflow uses the company-approved destination and sender only. It does not impersonate
people, bypass suppression, bulk-message contacts, or send unsupervised high-impact
communications.

The company remains responsible for the accuracy of its offer, its consent language,
the lawful basis for contact, its privacy notice, message approvals, owner coverage, and
its use of the resulting leads. GPTMarketPlus remains responsible for implementing the
agreed workflow with the controls stated in the written scope.

## Current v1 limitations

- V1 is a lead-intake, qualification, task-routing, and human-handoff workflow. It is
  not a fully autonomous agent that negotiates, closes sales, approves refunds, or makes
  binding commitments.
- A follow-up task being created is not proof that a message was sent, delivered, read,
  replied to, or acted on. Delivery and messaging integrations require separate setup
  and testing.
- Calendar booking, CRM synchronization, SMS/voice, inbox access, payment collection,
  and third-party data access are not assumed. Each requires explicit credentials,
  written scope, and acceptance tests.
- Classification is a configurable operational aid. It can be wrong and must have human
  review, correction, and escalation paths.
- The workflow cannot guarantee traffic quality, lead volume, response time, booked
  appointments, sales, revenue, rankings, or return on investment. Results depend on
  the company's offer, demand, traffic, response, capacity, data quality, and execution.

## Future application paths

The lead workflow is a reusable foundation, not an automatic entitlement to other
applications. Each future application needs its own written scope, tenant/data review,
approved knowledge source, human owner, and acceptance criteria.

| Application | Potential extension | Required boundary before delivery |
| --- | --- | --- |
| FAQ agent | Answer approved, current questions and hand off uncertain or sensitive questions. | Approved knowledge base, response ownership, citation/update process, and exclusions for advice or regulated topics. |
| Booking agent | Collect scheduling preferences and propose or create appointments. | Calendar authorization, availability rules, cancellation/no-show process, confirmation language, and human exception owner. |
| Operations agent | Create internal tasks, summarize approved operational inputs, and route exceptions. | Named systems of record, role permissions, audit trail, approval gates, and no autonomous financial, employment, safety, or legal decisions. |

## V1 acceptance criteria

A paid v1 implementation is accepted only when the agreed written-scope test cases pass
and the company owner confirms the result. At minimum, acceptance requires:

- The production tenant identifies the correct company and does not expose another
  tenant's records, content, credentials, prompts, or reports.
- The agreed intake surface displays the approved purpose and consent language, requires
  the agreed mandatory fields, and rejects submission without consent.
- Validation and agreed anti-abuse controls are active; representative malformed,
  duplicate/test, and valid submissions produce the documented outcomes.
- A valid consented test inquiry creates the correct tenant-scoped record, applies the
  documented classification, and creates or routes the correct follow-up task.
- The designated owner can receive and review the handoff, while a visitor cannot read
  private lead or task details through the public surface.
- The approved acknowledgment and, if scoped, follow-up templates use the correct
  company sender, consent basis, timing, stop rules, and human escalation path.
- The owner can correct a classification, stop follow-up, and record or route an
  exception according to the agreed process.
- Private customer and admin responses are access-controlled, non-indexable, and not
  publicly cached; secrets and unnecessary personal content do not appear in normal
  logs or client-side code.
- The company receives the agreed launch documentation, test evidence, owner operating
  instructions, and 30-day measurement baseline.
- Any item not demonstrated above is documented as deferred, unavailable, or a future
  custom-scope change—not represented as delivered.

## Plain-language promise

GPTMarketPlus can help a company turn a consented inquiry into a clear, reviewable
follow-up handoff. The $29 Launch Kit helps define the first workflow; paid onboarding
and implementation make an agreed workflow operational. Neither product guarantees
leads, appointments, sales, revenue, response outcomes, or business results.
