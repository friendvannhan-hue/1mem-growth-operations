# 1MEM Growth Operations

Static service portfolio for Nguyễn Văn Nhân. The editorial redesign presents
Growth Operations as the core that connects interchangeable data, commerce,
engagement, automation, operations, and loyalty modules. Existing page copy,
proof, and links remain in `index.html`.

## Design sources

`design/variables.css` is the browser's source of truth for the supplied design
tokens. `editorial.css` maps the original component variables to those tokens
and uses Inter and Oswald as the supplied free substitutes for Graphik and
Girott when the original fonts are unavailable. `design/tokens.json` preserves
the machine-readable token export, while `design/theme.css` is the equivalent
Tailwind `@theme` export for future Tailwind projects. The latter two files are
reference assets and are not loaded by this plain HTML site.

## Preview

`python3 -m http.server 4173`

## Test

`npm test`
