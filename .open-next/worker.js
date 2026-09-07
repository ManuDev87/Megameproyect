// PIXLANZ_PLACEHOLDER — OpenNext overwrites this file during Cloudflare deploy.
export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Pixlanz", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
