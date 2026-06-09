import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const alternatives = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/alternatives' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    description: z.string(),
    category: z.enum(['hosting', 'storage', 'pinning', 'cdn']),
    featured: z.boolean().default(false),
  }),
});

export const collections = { alternatives };
