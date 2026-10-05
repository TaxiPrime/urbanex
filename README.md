# Urbanex

Static Spanish corporate presentation and contact website for **P&P URBANEX SL**, a single-member limited company based in Sabadell.

Production hostname: `https://urbanex.taxiprime.app`. A configured hostname does not imply the site is deployed; see the delivery issue for current evidence.

## Development

Requires Node.js 22 or later. There are no external dependencies or installation steps.

```sh
npm run check
npm run dev
```

The local preview listens on `http://127.0.0.1:3013`. Set `PORT` to use another free port.

Edit Spanish content in `content/es.json`, visual styles in `public/styles.css` and templates in `scripts/build.mjs`. Build output is generated in the ignored `dist/` directory. The public pages are `/`, `/aviso-legal/` and `/privacidad/`, with a cookies section on the privacy page and a custom 404 page.

## Validation

`npm run check` builds the site and verifies corporate identity, unique headings/titles, local links and fragments, privacy content, public asset types, and the absence of forms, tracking scripts and remote rendering resources. CI runs it on pull requests and main. Desktop/mobile visual review and production behavior require separate checks.

## Deployment

Create an independent Vercel project named `urbanex`, connected to `TaxiPrime/urbanex`, with production branch `main`. Use a commercial plan suitable for a corporate site; Hobby is restricted to personal non-commercial use.

The checked-in `vercel.json` selects no framework, runs `npm run check`, serves `dist/`, and sets security headers including a policy that prevents all browser scripts and connections. Analytics and Speed Insights must remain disabled. Preview deployments must not expose the Vercel toolbar or other injected scripts to public visitors.

Add only `urbanex.taxiprime.app` to this project. Obtain the exact CNAME target from Vercel and configure that record in Cloudflare in DNS-only mode. Inspect existing exact/wildcard records and CAA restrictions first. Preserve the previous Urbanex DNS configuration privately; never change TaxiPrime's existing records. Validate the certificate, HTTP-to-HTTPS redirect, all page URLs, a missing URL and public assets. Rollback restores the saved Urbanex record and the prior deployment.

## Privacy and evidence boundaries

The site serves local assets and contains no browser JavaScript, forms, embeds, tracking or non-essential cookies. Hosting can process technical request data. Parent-domain cookies may still be sent by browsers; the site does not use them for rendering or tracking.

The contact domain currently routes mail through Google's MX servers; that is not proof of individual mailbox delivery or the precise contract/account configuration. Verify receipt and access to the approved mailbox separately. Before publishing, confirm current corporate details and review the applicable Vercel/Google processing terms and technical retention settings. No message-delivery test is implied by a working mailto link.

Never commit original legal/identity/banking documents, signatures, personal identifiers, credentials, verification codes, screenshots of private admin pages or DNS account data. Statutory activities are not proof of active operations or licences. This site does not establish ownership of TaxiPrime or guarantee Meta business verification.
