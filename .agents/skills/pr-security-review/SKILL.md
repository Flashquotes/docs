---
name: pr-security-review
description: Review Flashquotes documentation changes for security vulnerabilities, API contract bugs, and harmful integration guidance. Use for requested PR or working-tree security reviews, especially OpenAPI definitions and API reference pages.
---

# Documentation security review

Adapted from the main app's `.claude/agents/pr-security-reviewer.md`. Keep its evidence-based, report-only approach; focus on this public Mintlify documentation repository.

## Review scope

Review without modifying the files under review. Report suggested fixes; do not run formatters, apply fixes, stage, commit, publish, or post comments as part of a review. A separate user instruction to implement fixes authorizes that work after presenting findings. Creating or maintaining this skill is a separate task from reviewing product changes.

For a working-tree review, inspect `git status --short`, `git diff`, `git diff --cached`, and relevant untracked files. Do not miss new MDX pages because they are untracked. For a PR, use its actual base and head; do not assume a local `main` represents either. Include surrounding shared schemas and configuration when they affect the change. Preserve unrelated user work.

Read repository authoring instructions. The principal review surfaces are:

- `api-reference/openapi.json`: shared schemas, authentication, servers, parameters, examples, and responses.
- `api-reference/*/*.mdx`: endpoint behavior and copyable integration examples.
- Other `api-reference/*/openapi.json` files: separate or legacy contracts; check which specification a page actually uses.
- `docs.json`: navigation, API playground/proxy, generated examples, analytics, and redirects.
- Changed MDX components, snippets, embeds, images, and downloadable assets that become public.

## Verify against the application

Use the main app as the source of truth for endpoint behavior. It is commonly checked out at `../flashquotes`; otherwise use the repository and PR supplied by the user. Resolve the merged commit or reviewed head and read that exact revision with `git show` or a read-only GitHub request. Do not substitute a stale local checkout or a PR summary for implementation evidence.

Trace relevant route handlers through authentication, query/expand parsing, tenant-scoped service queries, public selects, response shapers, and calculation code. In the app, useful starting points include `src/app/api/(public)/`, `src/lib/api/public/`, and `src/server/services/api/public/`. Confirm field types and nullability from the schema at the same revision. Treat the OpenAPI document as a contract to check, not evidence that the implementation behaves that way.

If implementation access is unavailable, continue the docs-only checks and identify the unverified claims. Separate an application defect from a documentation regression; this review does not authorize modifying the app or accessing production customer data.

## Security checks

- **Published data:** Look for live API keys, authorization headers, credentials, personal/customer data, signed links, and working invoice/payment URLs in examples and assets. Use clearly synthetic examples. Do not print discovered secrets in findings. Distinguish intentional public analytics identifiers from credentials before reporting a leak.
- **Authentication guidance:** Verify header names, HTTPS destinations, global and operation-level OpenAPI security, plan gates, IP restrictions, and actual denial status codes. Flag examples that place secrets in URLs, client-side browser code, committed files, or third-party destinations. Check for `security: []` overrides that unintentionally make generated clients omit authentication.
- **Playground and request safety:** Inspect changed server URLs, proxy settings, prefilled credentials, and auto-generated requests. Verify where a user's key would be sent. Do not flag the existing proxy or analytics integration without a demonstrated unsafe change. Validate examples with fake credentials and a local recorder when useful; do not call production to test tenant boundaries or payment links.
- **Tenant and expansion boundaries:** Confirm company scoping of roots, cursors, and expanded children. Check the documented allow-list at every supported depth, parent inclusion, list `data.` prefixes, absent versus null relations, and empty collections. Do not document private fields as public, or promise isolation stronger than the implementation provides.
- **Restricted information:** Check public selects and shapers for actual response fields. For quote APIs, examine structured itemization, unit prices, quantities, discount allocations, pricing configuration, contract content/signatures, and invoice descendants. Distinguish permitted aggregate totals, financial terms, and free-text fields from excluded data. A prose exclusion does not establish an application security boundary.
- **Executable content and links:** Review changed scripts, raw HTML/MDX, iframes, unsafe URL schemes, remote assets, redirects, and rendered user-controlled values for a concrete injection or exfiltration path. Do not execute downloaded or embedded code merely to review it.

## Contract and resource-use checks

Report contract errors that can break integrations or cause unsafe financial decisions:

- Routes, base URL composition, methods, ID parameters, required fields, response envelopes, enum values, nullability, and shared schema references match the implementation.
- Monetary units and percentage scales are correct for each field. Distinguish live quote value from invoice balance, gratuity, taxes, saved prices, and catalog repricing. Check whether timestamps actually track all changes the docs imply they track.
- Filters, date/timezone encoding, cursor visibility, sorting, and empty-page behavior match the server. A successful list request does not prove complete synchronization.
- Copyable examples preserve bracketed parameters and positive timezone offsets, send the correct headers, and avoid production credentials. Success and error examples match their schemas and the route's status mapping.
- Expansion count/depth, page caps, and collection behavior are documented accurately. Do not infer request-rate limits, independent nested pagination, bounded payload size, or latency guarantees from a page/depth limit or a local benchmark.
- Shared-schema changes do not silently contradict other current endpoint pages or generated clients. Keep historical/legacy payloads distinct when they genuinely differ.

## Validation and findings

Use the repository's available checks, normally `mint validate`, `mint broken-links`, and `git diff --check`, when relevant. These commands validate documentation structure; they do not prove authorization or runtime safety. Inspect examples and contract claims against source as well. Avoid adding a test suite for a prose-only review.

Report only actionable, evidenced security issues, contract bugs, or resource-use problems. Do not turn stylistic preferences, speculative hardening, or intentional disclosures into vulnerabilities. For each finding give severity, a docs file and line, the triggering scenario, concrete impact, implementation evidence, and a concise suggested correction. Rank findings by impact.

If there are no findings, say so. State the reviewed scope, application revision, checks run, and any material verification limits. A docs-only review must not claim that the deployed API is secure, that a pending asynchronous review finished, or that the changes are approved for deployment.
