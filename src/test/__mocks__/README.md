# Jest manual mocks

This directory contains Jest manual mocks for packages only. Keep one file per
mocked package, using the package name for the file name (for example,
`server-only.js`). For scoped packages, mirror the package path under
`__mocks__/@scope/package.js`.

Do not put demo data, fixtures, or test helpers here. Put shared helpers under
`src/test/`.
