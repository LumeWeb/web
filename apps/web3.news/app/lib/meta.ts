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
  const metaTags: Record<string, ServerRuntimeMetaDescriptor> = {};

  // Helper function to generate a unique key for each meta tag
  const generateKey = (tag: ServerRuntimeMetaDescriptor): string => {
    if ("name" in tag && tag.name) {
      return `name:${tag.name}`;
    }
    if ("property" in tag && tag.property) {
      return `property:${tag.property}`;
    }
    if ("httpEquiv" in tag && tag.httpEquiv)
      return `httpEquiv:${tag.httpEquiv}`;
    if ("charSet" in tag) {
      return "charSet";
    }
    if ("title" in tag) {
      return "title";
    }
    if ("script:ld+json" in tag) {
      return "script:ld+json";
    }
    if ("tagName" in tag && tag.tagName) {
      return `tagName:${tag.tagName}`;
    }
    // Fallback for complex or unknown types - convert to JSON string
    return `unknown:${JSON.stringify(tag)}`;
  };

  // Merge parent meta tags
  parentMeta?.matches?.forEach((match) => {
    match.meta?.forEach((tag) => {
      const key = generateKey(tag);
      metaTags[key] = tag;
    });
  });

  // Define new meta tags and add or overwrite them in the metaTags object
  const newMetaTags: ServerRuntimeMetaDescriptor[] = [
    { title },
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:image", content: imageUrl },
    { name: "og:type", content: ogType },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
  ];

  newMetaTags.forEach((tag) => {
    const key = generateKey(tag);
    metaTags[key] = tag;
  });

  return Object.values(metaTags);
}
