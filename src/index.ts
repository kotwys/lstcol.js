const CATEGORIES = {
  control: [
    [0x0000, 0x001F],  // C0 controls
    [0x007F, 0x009F],  // DEL + C1 controls
    [0x200B, 0x200F],  // Zero-width spaces, RTL marks
    [0x2028, 0x202E],  // Line/paragraph separators, directional controls
    [0x2060, 0x206F],  // Word joiners, invisible operators
    [0xFEFF, 0xFEFF]   // Zero-width no-break space (BOM)
  ],
  letter: [
    [0x0041, 0x02AF],  // A-Z, a-z, Latin supplements/extensions, IPA
    [0x0370, 0x03FF],  // Greek and Coptic
    [0x1F00, 0x1FFF],  // Greek Extended
    [0x0400, 0x052F],  // Cyrillic + Supplement
    [0x2DE0, 0x2DFF],  // Cyrillic Extended-A
    [0xA640, 0xA69F],  // Cyrillic Extended-B
  ],
  cjk: [
    [0x4E00, 0x9FFF],   // Common
    [0x3400, 0x4DBF],   // Extension A
    [0x20000, 0x2A6DF], // Extension B
    [0x2A700, 0x2B73F], // Extension C
    [0x2B740, 0x2B81F], // Extension D
    [0x2B820, 0x2CEAF], // Extension E
    [0xF900, 0xFAFF],   // Compatibility
    [0x3300, 0x33FF],    // Compatibility area
    [0x3040, 0x30FF],   // Hiragana + Katakana
    [0x31F0, 0x31FF],   // Katakana Phonetic Extensions
    [0xFF65, 0xFF9F],   // Halfwidth Katakana
    [0xAC00, 0xD7AF],   // Hangul Syllables
    [0x1100, 0x11FF],   // Hangul Jamo
    [0x3130, 0x318F],   // Hangul Compatibility Jamo
    [0xA960, 0xA97F],   // Hangul Jamo Extended-A
    [0xD7B0, 0xD7FF],   // Hangul Jamo Extended-B
    [0x3000, 0x303F],
    [0xFF00, 0xFFEF]    // Halfwidth and Fullwidth Forms
  ]
};

type CategoryName = keyof typeof CATEGORIES | "other";

/**
 * Classifies a grapheme cluster into a category name.
 * @param grapheme - the grapheme cluster to classify
 * @returns the category name
 */
function classifyGrapheme(grapheme: string): CategoryName {
  const codePoint = grapheme.codePointAt(0);
  for (const [category_, ranges] of Object.entries(CATEGORIES)) {
    const category = category_ as CategoryName;
    const matches = ranges.some(([start, end]) =>
      codePoint >= start && codePoint <= end
    );
    if (matches) return category;
  }

  return "other";
}

/**
 * Amount of cells to be used for a grapheme of the given category. Only CJK
   characters take up two cells at the time.
 */
const cellAllocation = (category: CategoryName): number => ({
  "cjk": 2,
}[category] || 1);

interface Token {
  /** Text node that corresponds to the token. */
  node: Text,
  /** Array of the indexes of the first code points of each grapheme. */
  graphemeBoundaries: number[],
  /** Category of all the graphemes */
  category: CategoryName,
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const measureToken = (token: Token): number => {
  const parent = token.node.parentElement;
  const style = window.getComputedStyle(parent);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return ctx.measureText(token.node.textContent).width;
};

const outputPx = (px: number) => px.toFixed(3) + "px";

/**
 * Traverses text nodes under the given element and splits them into “tokens”.
 * Tokens are extracted based on categories of graphemes (grapheme clusters).
 *
 * @param el - element to traverse
 * @returns an array of tokens
 */
function splitTokens(el: Element): Array<Token> {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const segmenter = new Intl.Segmenter();
  const tokens: Array<Token> = [];

  let node: Text;
  while (node = walker.nextNode() as Text) {
    let prevCategory: CategoryName | null;
    let graphemeBoundaries = [];
    for (const { index, segment } of segmenter.segment(node.textContent)) {
      const category = classifyGrapheme(segment);
      const shouldSplit = prevCategory &&
        (prevCategory === "other" || category !== prevCategory);
      if (shouldSplit) {
        node.splitText(index);
        break;
      }
      graphemeBoundaries.push(index);
      prevCategory = category;
    }

    tokens.push({
      node,
      graphemeBoundaries,
      category: prevCategory,
    });
  }

  return tokens;
}

export interface Options {
  /**
   * Width of a single character cell (column) as a fraction of the font size.
   * The default is `0.6`.
   */
  baseWidth?: number,
  /**
   * Target element(s) to apply column alignment to. When a string is given, it
   * should be a CSS selector.
   */
  target: string | Element | ArrayLike<Element>,
}

function alignElement(el: Element, baseWidth: number) {
  const style = window.getComputedStyle(el);
  const cellWidthPx = parseFloat(style.fontSize) * baseWidth;
  const tokens = splitTokens(el);

  /** Space to compensate after the previous token */
  let previous = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const parent = token.node.parentElement;
    if (token.category === "control") {
      previous = 0;
      continue;
    }

    const width = measureToken(token);
    const graphemes = token.graphemeBoundaries.length;
    const box = cellWidthPx * graphemes * cellAllocation(token.category);
    const diff = box - width;
    const useMargins = diff > 0 || graphemes == 1;
    const gap = diff / (graphemes + (useMargins ? 0 : -1));
    const outer = useMargins ? 0.5*gap : 0;
    // An only child may be aligned by the style of its parent element
    if (parent.childNodes.length == 1) {
      parent.style.marginLeft = outputPx(previous + outer);
      parent.style.letterSpacing = outputPx(gap);
      previous = outer - gap; // letter-spacing adds an excessive space at the
                              // right
    } else {
      for (let j = graphemes - 1; j >= 0; j--) {
        const subnode = j > 0
          ? token.node.splitText(token.graphemeBoundaries[j])
          : token.node;
        const span = document.createElement("span");
        span.style.marginLeft = outputPx(j == 0 ? previous + outer : gap);
        subnode.parentElement.insertBefore(span, subnode);
      }
      previous = outer;      
    }
  }
}

export function alignListings(options: Options) {
  if (!("Intl" in window && "Segmenter" in Intl)) {
    throw new Error("Your browser does not support Intl.Segmenter.");
  }

  if (!(
    typeof options.target === "string"
      || options.target instanceof Element
      || typeof options.target.length === "number"
  )) {
    throw new Error("target should be an element, an array of elements or a CSS selector.");
  }

  if (
    options.baseWidth
      && typeof options.baseWidth !== "number"
      || options.baseWidth <= 0
  ) {
    throw new Error("baseWidth should be a positive number");
  }

  let elements: ArrayLike<Element>;
  if (typeof options.target === "string") {
    elements = document.querySelectorAll(options.target);
  } else if (options.target instanceof Element) {
    elements = [options.target];
  } else {
    elements = options.target;
  }

  for (let i = 0; i < elements.length; i++) {
    alignElement(elements[i], options.baseWidth || 0.6);
  }
}
