import { getCollection } from 'astro:content';
import type { ContactEmailEntry } from './parsers';

const CONTACT_ID = 'contact' as const;

/**
 * Fetch the contact email from the contactEmails collection
 * @returns The contact email address
 * @throws Error if contact email is not found
 */
export async function getContactEmail(): Promise<string> {
  const contactEmails = await getCollection('contactEmails');
  const contact = contactEmails.find(entry => entry.id === CONTACT_ID);
  
  if (!contact) {
    throw new Error(`Contact email with id "${CONTACT_ID}" not found`);
  }
  
  return contact.data.email;
}

/**
 * Fetch the contact email entry from the contactEmails collection
 * @returns The contact email entry
 * @throws Error if contact email is not found
 */
export async function getContactEmailEntry(): Promise<ContactEmailEntry> {
  const contactEmails = await getCollection('contactEmails');
  const contact = contactEmails.find(entry => entry.id === CONTACT_ID);
  
  if (!contact) {
    throw new Error(`Contact email with id "${CONTACT_ID}" not found`);
  }
  
  return contact;
}
