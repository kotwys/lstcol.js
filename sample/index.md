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

<script type="module">
import { alignListings } from "http://localhost:8080/dist/index.js";
alignListings({
  target: "pre > code",
});
</script>
