import OGImage from "../images/og_default.png";

export function generateMetaTags(
  title: string,
  description: string,
  imageUrl = OGImage,
  ogType: "website" | "article" = "website"
) {
  return [
    { title },
    { name: "title", content: title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:image", content: imageUrl },
    { name: "og:type", content: ogType },
  ];
}
