/**
 * Shared types for data collections
 */

export interface ServiceLink {
  text: string;
  url: string;
  style: 'primary' | 'secondary';
}

export interface Service {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  links: ServiceLink[];
}

export interface CommunityProject {
  id: string;
  name: string;
  description: string;
  features: string[];
  links: ServiceLink[];
}

export interface Social {
  id: string;
  name: string;
  url: string;
  title: string;
  icon: string;
}

export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  address: string;
  color: string;
}

export interface FiatPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
  backgroundColor: string;
  borderColor: string;
  hostedButtonId?: string;
}
