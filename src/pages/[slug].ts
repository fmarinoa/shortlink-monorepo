import type { APIRoute } from 'astro';
import { linksBySlug } from '../lib/links';

export const prerender = false;

/**
 * Short-link handler. Responds with 302 immediately.
 * Analytics are recorded asynchronously via keepalive fetch.
 */
export const GET: APIRoute = async ({ params, url }) => {
	const slug = params.slug;
	if (!slug) {
		return new Response('Not found', { status: 404 });
	}

	const destination = linksBySlug.get(slug);
	if (!destination) {
		return new Response('Not found', { status: 404 });
	}

	// Fire-and-forget analytics via keepalive — never delays the 302.
	void fetch(new URL('/api/track', url), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ slug }),
		keepalive: true,
	}).catch((err) => {
		console.error('[analytics] track fetch failed', slug, err);
	});

	return Response.redirect(destination, 302);
};
