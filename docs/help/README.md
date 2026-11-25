# Writing Help articles

These articles are the only documentation the app shows to users. Anything in `docs/` that is not listed in `src/features/help/manifest.ts` is never published.

## Rules

- **Plain Markdown only.** Use headings, paragraphs, lists, tables, links, inline code, and images from `public/help/`. Do not use raw HTML, MDX, or JSX. The renderer drops HTML.
- **Use exact UI labels in bold**, for example **Use my location**, and real routes, for example `/rent`.
- **Say when something is demo or coming soon.** Write "Demo: this is not saved" or "Coming soon", and link the issue that tracks it.
- **Never include** secrets, private keys, seed phrases, real wallet addresses, or personal data.
- **Keep the manifest in step.** Add each new article to `src/features/help/manifest.ts` in the same change. Set `verifiedAt` and `verifiedCommit` when you check it against the UI.
- **Renames update guides.** If a PR renames a button or route that a guide uses, update the guide in that same PR.
