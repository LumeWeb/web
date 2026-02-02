import type { ParserFunction } from 'astro/loaders';

/**
 * Type for a record entry with an id field
 */
export type IdRecord<T> = { id: string } & T;

/**
 * Type for a contact email entry
 */
export type ContactEmailEntry = {
  id: string;
  email: string;
  label: string;
  description?: string;
};

/**
 * Interface for a URL record entry
 */
export interface UrlRecordEntry {
  id: string;
  url: string;
}

/**
 * Type for a content collection item with data property
 */
export type CollectionItem<T> = { data: T };

/**
 * Find a social entry by ID from a collection
 */
export const findSocialById = (socials: Array<CollectionItem<{ url: string }>>, id: string): string | undefined => {
  return socials.find(s => s.id === id)?.data.url;
};

/**
 * Extract data array from a content collection
 */
export const extractCollectionData = <T>(collection: Array<CollectionItem<T>>): T[] => {
  return collection.map(item => item.data);
};

/**
 * Parse a JSON file and extract a specific property
 */
export const parseJsonProperty =
  <T>(property: string): ParserFunction<T> =>
  (text) =>
    JSON.parse(text)[property];

/**
 * Parse a JSON file with nested properties
 */
export const parseNestedJsonProperty =
  <T>(...properties: string[]): ParserFunction<T> =>
  (text) =>
    properties.reduce((obj, prop) => obj[prop], JSON.parse(text));

/**
 * Parse a JSON file and wrap it with an id key
 * @param id - The id to use for wrapping
 */
export const parseWrapWithId =
  (id: string): ParserFunction<Record<string, unknown>> =>
  (text) => ({ [id]: JSON.parse(text) });

/**
 * Convert a record object to an array with id keys
 */
export const parseRecordToArray =
  <T extends Record<string, unknown>>(): ParserFunction<
    Array<IdRecord<T>>
  > =>
  (text) => {
    const record = JSON.parse(text) as Record<string, T>;
    return Object.entries(record).map(([key, value]) => ({
      id: key,
      ...(typeof value === 'object' && value !== null ? value : { value }),
    }));
  };

/**
 * Parse a JSON file, extract a specific property (object), and convert to array with id
 * @param property - The property name to extract from JSON
 */
export const parsePropertyRecordToArray = <T extends Record<string, unknown>>(
  property: string
): ParserFunction<Array<IdRecord<T>>> => {
  return (text: string) => {
    const record = JSON.parse(text)[property] as Record<string, T>;
    return Object.entries(record).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  };
};

/**
 * Parse a JSON file, extract a string record, and convert to {id, url} array
 * @param property - The property name to extract from JSON
 */
export const parseStringPropertyRecordToArray = (
  property: string
): ParserFunction<Array<UrlRecordEntry>> => {
  return (text: string) => {
    const record = JSON.parse(text)[property] as Record<string, string>;
    return Object.entries(record).map(([key, value]) => ({
      id: key,
      url: value,
    }));
  };
};

/**
 * Parse a JSON file, extract a nested contact email property, and wrap in array with id
 * @param parentProperty - The parent property name (e.g., "email")
 * @param contactId - The id to use for the contact entry
 */
export const parseContactEmail = (
  parentProperty: string,
  contactId: string
): ParserFunction<Array<ContactEmailEntry>> => {
  return (text: string) => {
    const data = JSON.parse(text);
    return [{ id: contactId, ...data[parentProperty][contactId] as { email: string; label: string; description?: string } }];
  };
};
