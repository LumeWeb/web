import React from "react";
import { generateChunkSyntax } from "./template-generators";

/**
 * GoChunk - Array chunking component
 *
 * Splits an array into chunks of a specified size using Go template syntax
 * Useful for creating grid layouts (e.g., 3 items per row)
 *
 * @example
 * <GoChunk items="items" size="3" elementName="chunk" indexName="chunkIndex">
 *   <Row>
 *     <GoRange items="$chunk" elementName="item">
 *       <Column>
 *         <Text><GoVar name="$item.name" /></Text>
 *       </Column>
 *     </GoRange>
 *   </Row>
 * </GoChunk>
 * // Outputs: {{$chunkIndex, $chunk := chunk .Items 3}}
 * //         <Row>{{range $item := $chunk}}<Column><Text>{{$item.Name}}</Text></Column>{{end}}</Row>
 *
 * @example without index
 * <GoChunk items="products" size="2" elementName="productRow">
 *   <div style="row">
 *     <GoRange items="$productRow" elementName="product">
 *       <div style="col">
 *         <Text><GoVar name="$product.name" /></Text>
 *       </div>
 *     </GoRange>
 *   </div>
 * </GoChunk>
 * // Outputs: {{$productRow := chunk .Products 2}}
 * //         <div style="row">{{range $product := $productRow}}<div style="col"><Text>{{$product.Name}}</Text></div>{{end}}</div>
 *
 * @note
 * The chunk function must be registered in Go:
 *
 * **Option 1: Using `any` (Go 1.18+)**
 *   funcMap := template.FuncMap{
 *     "chunk": chunk,
 *   }
 *
 *   func chunk(slice any, size int) [][]any {
 *     v := reflect.ValueOf(slice)
 *     if v.Kind() != reflect.Slice {
 *       return nil
 *     }
 *
 *     length := v.Len()
 *     var result [][]any
 *
 *     for i := 0; i < length; i += size {
 *       end := i + size
 *       if end > length {
 *         end = length
 *       }
 *
 *       var chunk []any
 *       for j := i; j < end; j++ {
 *         chunk = append(chunk, v.Index(j).Interface())
 *       }
 *       result = append(result, chunk)
 *     }
 *
 *     return result
 *   }
 *
 * **Option 2: Using `samber/lo` library**
 *   import "github.com/samber/lo"
 *
 *   funcMap := template.FuncMap{
 *     "chunk": chunk,
 *   }
 *
 *   func chunk(slice any, size int) [][]any {
 *     return lo.Chunk(slice, size)
 *   }
 */
export interface GoChunkProps {
  /** Variable name of the array to chunk */
  items: string;
  /** Size of each chunk */
  size: number;
  /** Optional: name for the chunk element variable (e.g., "chunk") */
  elementName: string;
  /** Optional: name for the chunk index variable (e.g., "chunkIndex") */
  indexName?: string;
  /** Content to render for each chunk */
  children: React.ReactNode;
}

export const GoChunk: React.FC<GoChunkProps> = ({
  items,
  size,
  elementName,
  indexName,
  children,
}) => {
  return (
    <>
      {generateChunkSyntax(items, size, elementName, indexName)}
      {children}
    </>
  );
};
