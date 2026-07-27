import type { APIRoute } from 'astro';
import { linksBySlug } from '../lib/links';
import { recordClick } from '../lib/db';

export const prerender = false;

/**
 * Short-link handler. Responds with 302 immediately.
 * Click is recorded via ctx.waitUntil so it never delays the redirect,
 * but still completes after the response is sent (Worker stays alive for it).
 */
export const GET: APIRoute = async ({ params, locals }) => {
	const slug = params.slug;
	if (!slug) {
		return new Response('Not found', { status: 404 });
	}

	const destination = linksBySlug.get(slug);
	if (!destination) {
		return new Response('Not found', { status: 404 });
	}

	const track = recordClick(slug).catch((err) => {
		console.error('[analytics] recordClick failed', slug, err);
	});

	const ctx = (locals as any).cfContext;
	if (ctx?.waitUntil) {
		ctx.waitUntil(track);
	} else {
		await track;
	}

	return Response.redirect(destination, 302);
};
