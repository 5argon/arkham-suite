module.exports = {
  async constraints({ Yarn }) {
    const sveltePackages = [
      '@5argon/arkham-starter-sveltekit',
      '@5argon/arkham-life-site',
      '@5argon/arkham-life-ui',
    ];

    const targetVersions = {
      '@eslint/compat': '^2.0.2',
      '@eslint/js': '^9.39.2',
      '@inlang/paraglide-js': '^2.10.0',
      '@sveltejs/adapter-cloudflare': '^7.2.6',
      '@sveltejs/kit': '^2.50.2',
      '@sveltejs/vite-plugin-svelte': '^6.2.4',
      '@tailwindcss/forms': '^0.5.11',
      '@tailwindcss/typography': '^0.5.19',
      '@tailwindcss/vite': '^4.1.18',
      '@types/node': '^24',
      'eslint': '^9.39.2',
      'eslint-config-prettier': '^10.1.8',
      'eslint-plugin-svelte': '^3.14.0',
      'globals': '^17.3.0',
      'prettier': '^3.8.1',
      'prettier-plugin-svelte': '^3.4.1',
      'prettier-plugin-tailwindcss': '^0.7.2',
      'svelte': '^5.49.2',
      'svelte-check': '^4.3.6',
      'tailwindcss': '^4.1.18',
      'typescript': '^5.9.3',
      'typescript-eslint': '^8.54.0',
      'vite': '^7.3.1',
      'vite-plugin-devtools-json': '^1.0.0',
      'wrangler': '^4.63.0',
    };

    for (const workspace of Yarn.workspaces()) {
      if (!sveltePackages.includes(workspace.pkg.ident)) continue;

      for (const [ident, range] of Object.entries(targetVersions)) {
        for (const dependency of Yarn.dependencies({ workspace, ident })) {
          dependency.update(range);
        }
      }
    }
  },
};