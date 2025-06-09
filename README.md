# lstcol.js

A small script that mimics the fixed-column alignment of the listings package
for LaTeX. A code listing is typeset in a proportional font, but aligned to some
grid making it look as intended by the programmer.

![A sample listing](./media/sample.png)

Can be used with some CSS Typesetting tools working in the browser.

## Usage

⚠️ Your browser needs to support the [`Intl.Segmenter`][intl] API for the script
to work. Check the linked page for the compatibility information.

Download [the script](./dist/index.js) and place it on your web server (or you
may use some services that host code from GitHub), then import it as follows (a
`<script type="module">` will be needed):

```javascript
import { alignListings } from "./dist/index.js";
```

The `alignListings` function must be called with a CSS selector string, an
element, or an array of elements to perform column aligment on as its first
argument.  Also, an additional options object may be passed as the second
argument:

```javascript
alignListings("pre > code", {
  /**
   * Width of a single character cell (column) as a fraction of the font size
   * (optional).
   * The default is `0.6`.
   */
  baseWidth: 0.6,
  /**
   * Function that overrides the category of a given symbol (optional).
   *
   * For different languages you may want to have different categories for some
   * graphemes.
   *
   * A grapheme (a string containing one or more Unicode code points) and the
   * current element being aligned (specified by `target`) are passed as
   * arguments. The function should return a category name or undefined. In the
   * latter case, the default classification is used.
   */
  categoryOverride(grapheme, el) {
    if (el.classList.contains("commonlisp")) {
      const code = grapheme.charCodeAt(0);
      switch (code) {
      case 39: // '
      case 42: // *
      case 43: // +
      case 45: // -
      case 64: // @
        return "letter";
      }
    }
  },
})
```

It is recommended that code highlighting and other similar procedures are run
before this function.  `alignListings` works by inserting some spacing elements
between the text nodes that might end up stripped out by other tooling.

Also, if your page uses some custom web fonts, make sure that they are fully
loaded when the function is executed, otherwise the alignment would be broken.

[intl]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
