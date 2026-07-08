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

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('Derrick'),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    pillar: z.enum(['educational', 'opinion', 'promotional', 'technical']).optional(),
    tags: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { alternatives, blog };
