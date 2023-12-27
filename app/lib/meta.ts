import OGImage from "../images/og_default.png";
import type {
  ServerRuntimeMetaArgs,
  ServerRuntimeMetaDescriptor,
} from "@remix-run/server-runtime";

interface GenerateMetaTagsParams {
  title: string;
  description: string;
  imageUrl?: {};
  ogType?: "website" | "article";
  parentMeta?: ServerRuntimeMetaArgs;
}

export function generateMetaTags({
  title,
  description,
  imageUrl = OGImage,
  ogType = "website",
  parentMeta,
}: GenerateMetaTagsParams) {
  let parentMetaMerged: ServerRuntimeMetaDescriptor[] = [];

  if (parentMeta?.matches) {
    parentMetaMerged = parentMeta?.matches.flatMap((match) => match.meta ?? []);
  }

  return [
    ...parentMetaMerged,
    { title },
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:image", content: imageUrl },
    { name: "og:type", content: ogType },
  ];
}
