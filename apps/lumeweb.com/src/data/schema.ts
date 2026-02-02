import { z } from "zod";
import servicesDataRaw from "./services.json";
import socialsDataRaw from "./socials.json";
import contactsDataRaw from "./contacts.json";

// ============ Services ============

export const ServiceLinkSchema = z.object({
  text: z.string(),
  url: z.string(),
  style: z.enum(["primary", "secondary"]),
});

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  links: z.array(ServiceLinkSchema),
});

export const UpcomingServicesSchema = z.object({
  tagline: z.string(),
  description: z.string(),
  features: z.array(z.string()),
});

export const ServicesDataSchema = z.object({
  services: z.array(ServiceSchema),
  upcoming: UpcomingServicesSchema.nullable(),
});

export type ServiceLink = z.infer<typeof ServiceLinkSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type UpcomingServices = z.infer<typeof UpcomingServicesSchema>;
export type ServicesData = z.infer<typeof ServicesDataSchema>;

// ============ Socials ============

export const SocialSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  title: z.string(),
  icon: z.string(),
});

export const CommunitySectionSchema = z.object({
  url: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const SocialsDataSchema = z.object({
  socials: z.array(SocialSchema),
  community: z.record(z.string(), CommunitySectionSchema),
});

export type Social = z.infer<typeof SocialSchema>;
export type CommunitySection = z.infer<typeof CommunitySectionSchema>;
export type SocialsData = z.infer<typeof SocialsDataSchema>;

// ============ Contacts ============

export const ContactEmailSchema = z.object({
  email: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const ContactEmailSectionSchema = z.object({
  support: ContactEmailSchema.optional(),
});

export const ContactsDataSchema = z.object({
  email: ContactEmailSectionSchema,
  socials: z.record(z.string(), z.string()),
});

export type ContactEmail = z.infer<typeof ContactEmailSchema>;
export type ContactEmailSection = z.infer<typeof ContactEmailSectionSchema>;
export type ContactsData = z.infer<typeof ContactsDataSchema>;

// ============ Exports ============

const servicesParsed = ServicesDataSchema.parse(servicesDataRaw as unknown) as ServicesData;
export const services: Service[] = servicesParsed.services;
export const upcomingServices: UpcomingServices | null = servicesParsed.upcoming;

const socialsParsed = SocialsDataSchema.parse(socialsDataRaw as unknown) as SocialsData;
export const socials: Social[] = socialsParsed.socials;
export const communitySections: Record<string, CommunitySection> = socialsParsed.community;

const contactsParsed = ContactsDataSchema.parse(contactsDataRaw as unknown) as ContactsData;
export const contactEmails: ContactEmailSection = contactsParsed.email;
export const contactSocials: Record<string, string> = contactsParsed.socials;
