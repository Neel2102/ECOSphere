# Switzer (self-hosted)

The sidebar header uses **Switzer**, which is not a system font. Download it
free from Fontshare (https://www.fontshare.com/fonts/switzer) and place the
variable-font file here as:

```
public/fonts/Switzer-Variable.woff2
```

`styles/global.css` already declares the matching `@font-face`. Until the file
is added, the UI gracefully falls back to Segoe UI / Arial.
