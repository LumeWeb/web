export interface Author {
  name: string;
  twitter?: string;
  github?: string;
}

export const authors: Record<string, Author> = {
  Derrick: {
    name: "Derrick Hammer",
    twitter: "https://x.com/pcfreak30",
    github: "https://github.com/pcfreak30",
  },
};

export function getAuthor(id: string): Author {
  return authors[id] ?? { name: id };
}
