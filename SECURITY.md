# Security Policy

## Supported version

Security fixes are applied to the current `main` branch and the production deployment at `agentid.services`.

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/nrk8286/agentid-services/security/advisories/new). Do not open a public issue for credentials, authentication bypasses, payment problems, customer information, or exploitable production behavior.

Include:

- affected route, component, or deployment;
- reproduction steps with sensitive values removed;
- impact and any known prerequisites;
- a safe proof of concept when available.

Do not access data that is not yours, disrupt production, automate payment or ad interactions, or perform denial-of-service testing. Reports will be reviewed as quickly as operationally possible.

Secrets belong in Cloudflare Worker secrets, Google Secret Manager, GitHub Actions secrets, or local ignored environment files. They must never be committed.
