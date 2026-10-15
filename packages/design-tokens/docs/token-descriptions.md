# Token Descriptions

Every semantic token leaf requires a `$description` that explains its use without surrounding documentation; `pnpm tokens:check` enforces it. Write for consumers, including agents, not maintainers. Describe primitives only when they need token-specific guidance; keep scale-wide rules in the guides.

## Placement

- Put descriptions on token leaves. Group descriptions may supplement, but never replace, semantic leaf descriptions.
- Never put `$description` at the document root: it can conflict when resolver sources merge.
- For generated tokens, add descriptions through the recipe or generator.

## Writing

State the intended role, constraints, and differences from easily confused tokens. Use one sentence, or two when a boundary needs clarification:

```text
Use for <role or situation>. Do not use for <confusable role>.
```

Describe stable intent, not the current value, alias, theme, or brand mapping. Keep maintenance instructions in documentation and source metadata in `$extensions`. Use `$deprecated` for deprecation status and migration guidance.

## Examples

Good:

```json
{
  "$description": "Use for default body copy in long-form content."
}
```

```json
{
  "$description": "Use as the base background of a page or application. Do not use for elevated containers."
}
```

Avoid:

```json
{
  "$description": "Primary prose text style at 16px."
}
```

This repeats the name and embeds a changeable value. `Blue 500` and `A color token` likewise add no usage guidance.
