import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);

    if (event.url.pathname === '/favicon.ico') {
        console.log('Favicon request intercepted');
        return new Response(null, { status: 204 });
    }    

    if (response.status === 404) {
        throw redirect(303, '/');
    }

    return response;
};