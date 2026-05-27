# Flashquotes Docs — Authoring Notes

## MDX character escaping

These docs render as MDX (Mintlify). A few characters need escaping inside prose and examples:

| Character | When to escape | How |
|-----------|----------------|-----|
| `$` | In examples and prose, especially when followed by a number or `{` (e.g. `$5`, `${var}`) | `\$` |
| `{` and `}` | Anywhere in prose that isn't an intentional JSX expression | `\{` and `\}` |
| `<` and `>` | When the surrounding text isn't a JSX/HTML tag | `&lt;` and `&gt;` |
| `*`, `_`, `` ` `` | When you want a literal, not Markdown emphasis or code | Backslash-escape (`\*`, `\_`, `` \` ``) |
| `|` inside table cells | When the literal pipe is part of the cell content | `\|` |

### Why `$` matters

MDX runs through a JS-aware compiler. `${anything}` is treated as a template-string-like expression in some contexts and can break the build. Even when it doesn't break, unescaped `$` in price examples can render inconsistently across versions of the toolchain. **Always escape `$` in price examples** — `\$59/mo`, `\$1,125`, `(\$300)`.

### Examples

```mdx
✅  **Example**: \$75/hour per bartender — a 4-hour service bills \$300 per bartender.
❌  **Example**: $75/hour per bartender — a 4-hour service bills $300 per bartender.
```

### Exceptions

Existing markdown tables in `settings/plans.mdx` use unescaped `$` (e.g. `$59/mo`) and render correctly. Match the surrounding pattern when editing inside an existing table; for **new prose and examples elsewhere**, escape.

## Plan tier badges

Badges live in `snippets/badge.mdx` and are imported per page:

```mdx
import { PlusBadge, ProBadge, ScaleBadge } from "/snippets/badge.mdx";
```

- `<PlusBadge />` — blue, marks Plus-tier features
- `<ProBadge />` — green, marks Pro-tier features
- `<ScaleBadge />` — orange, marks Scale-tier features (also used inline next to "Scale access required" callouts)

Place the badge directly after the H2 title (e.g. `## Dynamic Pricing <ScaleBadge />`) for tier sections, or inline next to the feature reference in prose.

## Changelog entries

`changelog/overview.mdx` is ordered newest-first. Each entry is wrapped in `<Update label="Month DD, YYYY">…</Update>` with a single `##` title (optionally followed by a badge), a brief lead-in sentence, optional bullets, and a closing docs link. Keep entries tight — one feature per entry, scannable in seconds.
