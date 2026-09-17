# Token Descriptions

A `$description` is usage guidance for people and agents choosing a token. Every semantic token must have one, even when its name seems self-explanatory, because consumers may inspect the token without the surrounding token tree or documentation.

## What to include

A description should help a consumer choose or apply the token correctly. State:

- the role or situation the token is intended for;
- any context, constraint, or prohibited use;
- how it differs from adjacent tokens when their roles could be confused.

Primitive tokens do not require descriptions. Add one only when the primitive has token-specific guidance that is not clear from its name. Put shared rules, such as using primitives only through semantic aliases, and scale-wide rationale in the relevant guide rather than repeating them on every primitive.

## Where to put it

Put `$description` on every semantic token leaf and on any primitive token that needs one. This keeps the guidance attached to the value that consumers select and makes it available to tools and agents inspecting that token.

A group may also have a `$description` when one short rule applies to every descendant. Group guidance is supplemental and never replaces the description required on each semantic token.

Do not put `$description` at a token document's root. Root properties can conflict when resolver sources are merged. Put broader taxonomy and maintenance guidance in repository documentation. When a generated token needs a description, generate it from the recipe or generator rather than editing generated output.

## How to write it

- Start with the intended use: `Use for ...` or a direct statement of purpose.
- Add a condition or exclusion when it prevents a likely mistake.
- Describe stable intent, not the current alias, raw value, theme, or brand mapping.
- Make the description understandable without navigating the token tree.
- Keep it to one sentence when possible and two when a boundary needs clarification.
- Do not include maintenance instructions; use documentation or `$extensions` for source metadata.
- Use `$deprecated`, not `$description`, for deprecation status and migration guidance.

A useful pattern is:

```text
Use for <role or situation>. Do not use for <confusable role>.
```

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

This repeats the name and embeds a value that may change. Also avoid descriptions such as `Blue 500` or `A color token`, which add no usage guidance.

## Rules

1. Give every semantic token leaf a description.
2. Describe primitive tokens only when they need token-specific guidance.
3. Describe use, not appearance or implementation.
4. Make each description understandable on its own.
5. Explain the boundary between easily confused tokens.
6. Keep descriptions independent of values and aliases.
7. Use group descriptions only as supplemental shared guidance.
8. Write for consumers, including automated agents, rather than maintainers.
