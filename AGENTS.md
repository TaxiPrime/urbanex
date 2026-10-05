# Urbanex corporate website

Independent public repository for P&P URBANEX SL at urbanex.taxiprime.app.

- Use FloowGitHub and .github/floowgithub.json for delivery. The issue owns the checklist and PRs. Follow explicit user authorization for commits, pushes, merges and deployment.
- Work on an issue branch of the live checkout; do not create workspace worktrees.
- Code, comments, identifiers and documentation are English. Spanish product copy belongs in content/es.json; do not hard-code it in templates.
- Run npm run check after changes. Review desktop and mobile rendering when layout changes. GitHub Actions runs the same checks.
- Build scripts use only Node.js built-ins. No installation, runtime JavaScript, forms, analytics, embeds or external fonts are needed.
- Keep the original corporate, banking and identity documents out of the repository and all public artifacts. Publish only the approved corporate identification and contact data.
- Describe statutory activities accurately; do not imply operating services, licences or ownership of TaxiPrime without evidence.
- Vercel is a separate project. Confirm a suitable commercial plan before production deployment. Change only the Urbanex hostname, preserve its previous DNS setting and verify HTTPS.
- Build success, CI, merge, preview, DNS, production HTTP, visual acceptance and mailbox delivery are separate proof boundaries.
