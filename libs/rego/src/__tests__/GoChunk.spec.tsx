import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoChunk } from "@/GoChunk";
import { GoRange } from "@/GoRange";
import { GoVar } from "@/GoVar";

describe("GoChunk", () => {
  test("renders chunk without index", () => {
    const html = renderToDecodedString(
      <GoChunk items="products" size={2} elementName="productRow">
        <div className="row">
          <GoRange items="$productRow" elementName="product">
            <div className="col">
              <span>
                <GoVar name="$product.name" />
              </span>
            </div>
          </GoRange>
        </div>
      </GoChunk>,
    );
    expect(html).toContain("{{$productRow := chunk .products 2}}");
    expect(html).toContain("{{$product.name}}");
  });

  test("renders chunk with index", () => {
    const html = renderToDecodedString(
      <GoChunk
        items="items"
        size={3}
        elementName="chunk"
        indexName="chunkIndex">
        <div>
          <GoRange items="$chunk" elementName="item">
            <span>
              <GoVar name="$item.name" />
            </span>
          </GoRange>
        </div>
      </GoChunk>,
    );
    expect(html).toContain("{{$chunkIndex, $chunk := chunk .items 3}}");
    expect(html).toContain("{{$item.name}}");
  });
});
