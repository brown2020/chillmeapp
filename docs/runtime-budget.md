# Runtime budget (leanness)

Critical path: guest or returning user reaches `/auth/signin` first HTML under production `next start`.

| Path | Metric | Budget | Notes |
|------|--------|--------|-------|
| `auth_signin` | HTML TTFB (p50) | ≤ 2000 ms | Local production server; CDN prod should be comparable or better |

Measurement conditions: clean-env `npm run build` + `PORT=3017 npm start`, five samples, median.
