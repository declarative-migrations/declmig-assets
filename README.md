# declmig-assets
Versioned product images, CSS, CDN exports, and static assets; app branding is isolated from marketing sites.

## Shared CSS design tokens

Import `branding/tokens.css` in app or site stylesheets. Tokens are prefixed
`--declmig-` and cover surfaces, text, buttons, status, focus, spacing and
radii. The default theme is light. Dark mode follows the operating system
unless the root element sets `data-declmig-theme="light"` or `"dark"`.

The source stays framework-neutral. Consumers can override individual tokens
locally without copying asset styles. Run `node --test tests/tokens.test.mjs`
before modifying colors: the contract checks semantic parity and WCAG AA
contrast for normal-sized text and primary buttons. This repository does not
publish CSS to a CDN automatically; downstream repositories must pin a commit
or release before adoption.
