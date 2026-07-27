import { defineMiddleware } from 'astro:middleware';
import { setDatabase } from './lib/db';

export const onRequest = defineMiddleware((context, next) => {
	try {
		const db = (context.locals.runtime?.env as any)?.DB;
		if (db) setDatabase(db);
	} catch (err) {
		// Binding no disponible en dev local, ignorar
	}
	return next();
});
