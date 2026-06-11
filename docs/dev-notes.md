### Package Overrides
Overrides found in `package.json`

- `uuid` and `sockjs`
  - Override `uuid` to v14.0.0 or greater to address [buffer bounds check](https://github.com/advisories/GHSA-w5hq-g745-h8pq). This showed up in `sockjs`, so I'm also scoping it there to [override nested versioning](https://www.geeksforgeeks.org/node-js/how-to-override-nested-npm-dependency-versions/).
