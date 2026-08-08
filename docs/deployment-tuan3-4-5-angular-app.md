# Deployment: tuan3_4_5/angular-app

## Platform: Vercel

## URL: https://angular-app-ten-lime.vercel.app

## Deploy Command
```bash
cd tuan3_4_5/angular-app
vercel --yes        # subsequent deploys: vercel --prod
```

## Config
`tuan3_4_5/angular-app/vercel.json`
- Build Command: `npm run build` (`ng build`, production config, esbuild application builder)
- Output Directory: `dist/angular-app/browser`
- Rewrites: SPA fallback to `/index.html` for client-side routing

## Environment Variables
None set in Vercel dashboard. `src/environments/environment.ts` (gitignored, but not excluded from Vercel uploads) hardcodes the reqres.in demo API URL/key used by this app.

## Custom Domain
Not configured. Using default `*.vercel.app` domain.

## Rollback
```bash
vercel rollback [deployment-url]
```
