### Package Overrides
Overrides found in `package.json`

- `uuid` and `sockjs`
  - Override `uuid` to v14.0.0 or greater to address [buffer bounds check](https://github.com/advisories/GHSA-w5hq-g745-h8pq). This showed up in `sockjs`, so I'm also scoping it there to [override nested versioning](https://www.geeksforgeeks.org/node-js/how-to-override-nested-npm-dependency-versions/).
- `qs`
  - Overridden to v6.16.0 or greater to address [array-limit bypass](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) and [Denial of Service via attacker-controlled `isBuffer`](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g). `express` and `body-parser` depended on vulnerable [`qs`](https://www.npmjs.com/package/qs) v6.15.x, releases and their declared version ranges don't allow npm to auto-update to the patched v6.16.x versions, so `npm audit fix` couldn't resolve the vulnerabilities.
