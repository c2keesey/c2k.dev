# Public project asset catalog

This directory is the reviewed visual-evidence handoff for the 21 projects in
the existing c2k.dev project network plus Agent Console.

- `catalog.json` is the consumption contract. Every target has exactly one
  explicit disposition: `selected_asset` or `custom_visualization`.
- `source-safety-manifest.json` records provenance, transforms, safety review,
  and rejected candidates.
- Selected files are immutable, content-addressed by the SHA-256 values in the
  catalog. Consumers should use the catalog URLs rather than discovering files
  by directory traversal.

The catalog intentionally contains only four selected assets. Missing imagery
is not an error: when an authentic, owned, public-safe source was unavailable,
the target carries a project-specific visualization brief instead of a forced
or fabricated screenshot.

## Integration rules

1. Preserve each asset's aspect ratio and use its supplied alt text.
2. Treat `supporting` assets as identity accents, not proof of product UI.
3. Do not replace a `custom_visualization` disposition with a live screenshot
   unless that screenshot receives a fresh source and safety review.
4. Do not publish local filesystem paths, private repository URLs, machine or
   network identifiers, user content, messages, credentials, customer data, or
   proprietary MAIA product state.
