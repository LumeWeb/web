export type SearchResult = {
  id: number;
  timestamp: Date;
  title: string;
  description: string;
  slug: string;
  cid: string;
};

export type SelectOptions = {
  value: string;
  label: string;
};

export type SiteList = {
  [domain: string]: {
    pubkey: string;
    name: string;
    rss: string;
  };
};
