# `@earendil-works/elanor-ui-remote`

Elanor-owned bridge for executable UI modules running outside the trusted host DOM.

- `./sandbox` registers non-rendering remote `elnr-*` placeholders and a remote root.
- `./host` validates remote mutations before materializing real Elanor custom elements.
Pi or another product owns its extension protocol, artifact discovery, contribution targets, authorization, capabilities, CSP, and sandbox lifecycle. This package contains no Pi-specific manifest or capability types.
