export type SearchResult = {
  id: number;
  timestamp: Date;
  title: string;
  description: string;
  slug: string;
};

export type SelectOptions = {
  value: string;
  label: string;
};

export type SiteList = {
  [domain: string]: {
    name: string;
    pubkey: string;
  };
};
