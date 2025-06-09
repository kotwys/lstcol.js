---
css:
- ./style.css
---

# Sample

```csharp
/// <summary>
/// Widę Łátïn Пащкӫт ғоҗпүсъёҫ & 東アジア文字
/// </summary>
public class Octahedron(double side)
{
  private static double VOLUME_COEFF = Math.Sqrt(2.0) / 3.0;
  public string Name => "正八面体";
  public void OutputInfo(int Precision,
                         string Language = "fi");
}
```

```el
(require 'cl-lib)

(defun lingvo--find-next-tag (tag-name)
  (lambda ()
    (let* ((query `(((open_tag name: (ident) @name)
                     (:match ,tag-name @name))
                    @tag)
           (nodes (treesit-query-capture 'lingvo query
                                         (point)))))
      ;; return first
      (cl-loop for (capture . node) in nodes
               when (eq capture 'tag)
                 return node))))
```

<script type="module">
import { alignListings } from "http://localhost:8080/dist/index.js";
alignListings("pre > code", {
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
});
</script>
