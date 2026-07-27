import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { setDatabase } from './lib/db';

export const onRequest = defineMiddleware((_context, next) => {
	const db = (env as any).DB;
	if (db) setDatabase(db);
	return next();
});
