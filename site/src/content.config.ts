import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ text: z.string(), url: z.string().url().optional(), kind: z.string().optional() });
const sources = z.array(source).default([]);
const base = {
  title: z.string(),
  slug: z.string(),
  order: z.number(),
  lede: z.string(),
  sources,
  reviewed: z.coerce.date().optional(),
};

const conditions = defineCollection({
  loader: glob({ base: './src/content/conditions', pattern: '*.md' }),
  schema: z.object({
    ...base,
    fullTitle: z.string(),
    group: z.enum(['代謝', '心血管', '腦與情緒', '消化', '骨與泌尿', '細胞與腫瘤']),
    tcmName: z.string().default('—'),
    answer: z.string(),
    evidence: z.array(z.object({ claim: z.string(), level: z.number().int().min(1).max(4), basis: z.string(), sourceRef: z.array(z.number()).optional() })),
    teas: z.array(z.object({ name: z.string(), why: z.string() })).default([]),
    tcmTeas: z.array(z.object({ name: z.string(), mix: z.string().optional(), note: z.string().optional() })).default([]),
    cautions: z.array(z.string()).default([]),
  }),
});

const safety = defineCollection({
  loader: glob({ base: './src/content/safety', pattern: '*.md' }),
  schema: z.object({ ...base, fullTitle: z.string().optional(), answer: z.string().optional(), cautions: z.array(z.string()).default([]) }),
});

const remedies = defineCollection({
  loader: glob({ base: './src/content/remedies', pattern: '*.md' }),
  schema: z.object({
    ...base,
    base: z.string(),
    herbs: z.array(z.object({ name: z.string(), amount: z.string().optional() })).default([]),
    method: z.string(),
    nature: z.string(),
    suits: z.array(z.string()).default([]),
    avoid: z.array(z.string()).default([]),
  }),
});

const teas = defineCollection({
  loader: glob({ base: './src/content/teas', pattern: '*.md' }),
  schema: z.object({
    ...base,
    nature: z.string(),
    ferment: z.string(),
    color: z.string(),
    compounds: z.any().optional(),
  }),
});

export const collections = { conditions, safety, remedies, teas };
