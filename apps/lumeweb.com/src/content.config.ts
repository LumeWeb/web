import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';
import {
  parseJsonProperty,
  parsePropertyRecordToArray,
  parseStringPropertyRecordToArray,
  parseContactEmail,
  parseWrapWithId,
} from './data/parsers';

/**
 * Helper to parse a JSON file and extract a specific property as an array
 */
const parseJsonArrayProperty = <T>(property: string) =>
  parseJsonProperty<T[]>(property);

// ============ Services ============

const ServiceLinkSchema = z.object({
  text: z.string(),
  url: z.string(),
  style: z.enum(['primary', 'secondary']),
});

const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  links: z.array(ServiceLinkSchema),
});

const UpcomingServicesSchema = z.object({
  tagline: z.string(),
  description: z.string(),
  features: z.array(z.string()),
});

const services = defineCollection({
  loader: file('src/data/services.json', {
    parser: parseJsonArrayProperty('services'),
  }),
  schema: ServiceSchema,
});

// ============ Socials ============

const SocialSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  title: z.string(),
  icon: z.string(),
});

const socials = defineCollection({
  loader: file('src/data/socials.json', {
    parser: parseJsonArrayProperty('socials'),
  }),
  schema: SocialSchema,
});

const communitySections = defineCollection({
  loader: file('src/data/socials.json', {
    parser: parsePropertyRecordToArray('community'),
  }),
  schema: z.object({
    id: z.string(),
    url: z.string(),
    label: z.string(),
    description: z.string().optional(),
  }),
});

// ============ Contacts ============

const contactEmails = defineCollection({
  loader: file('src/data/contacts.json', {
    parser: parseContactEmail('email', 'contact'),
  }),
  schema: z.object({
    id: z.string(),
    email: z.string(),
    label: z.string(),
    description: z.string().optional(),
  }),
});

const contactSocials = defineCollection({
  loader: file('src/data/contacts.json', {
    parser: parseStringPropertyRecordToArray('socials'),
  }),
  schema: z.object({
    id: z.string(),
    url: z.string(),
  }),
});

// ============ Community ============

const CommunityProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  links: z.array(
    z.object({
      text: z.string(),
      url: z.string(),
      style: z.enum(['primary', 'secondary']),
    })
  ),
});

const community = defineCollection({
  loader: file('src/data/community.json', {
    parser: parseJsonArrayProperty('projects'),
  }),
  schema: CommunityProjectSchema,
});

// ============ Donations ============

const CryptoCurrencySchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  address: z.string(),
  color: z.string(),
});

const FiatPlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  icon: z.string(),
  backgroundColor: z.string(),
  borderColor: z.string(),
  hostedButtonId: z.string().optional(),
});

const cryptoCurrencies = defineCollection({
  loader: file('src/data/donations.json', {
    parser: parseJsonArrayProperty('cryptocurrencies'),
  }),
  schema: CryptoCurrencySchema,
});

const fiatPlatforms = defineCollection({
  loader: file('src/data/donations.json', {
    parser: parseJsonArrayProperty('fiatPlatforms'),
  }),
  schema: FiatPlatformSchema,
});

// ============ Navigation ============

const NavigationItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  view: z.string().optional(),
  external: z.boolean().optional(),
});

const FooterColumnSchema = z.object({
  title: z.string(),
  items: z.array(NavigationItemSchema),
});

const FooterSchema = z.object({
  columns: z.array(FooterColumnSchema),
});

const NavigationSchema = z.object({
  navbar: z.array(NavigationItemSchema),
  footer: FooterSchema,
});

const navigation = defineCollection({
  loader: file('src/data/navigation.json', {
    parser: parseWrapWithId('main'),
  }),
  schema: NavigationSchema,
});

export const collections = {
  services,
  socials,
  communitySections,
  contactEmails,
  contactSocials,
  community,
  cryptoCurrencies,
  fiatPlatforms,
  navigation,
};
