import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    modified: z.string(),
    category: z.string(),
    author: z.string(),
    excerpt: z.string(),
    metaDescription: z.string(),
    featuredImage: z.string().default(''),
    ogImage: z.string().default(''),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
