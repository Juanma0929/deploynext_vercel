# Features

Every feature has the same five layers, and the same rules in all of them. The
directions are enforced by `eslint-plugin-boundaries` in `eslint.config.mjs`, so
breaking one of them fails `npm run lint`.

```
<feature>/
  domain/           entities + ports (repository interfaces)
  application/      use cases, one class per use case
  infrastructure/   DTOs, mappers and the repository over the shared HttpClient
  presentation/     components and the facade hooks they use
  di/               the only place that builds concrete repositories and use cases
```

- `domain/` imports nothing from React, Next.js or any HTTP library. An entity
  validates its invariants in its constructor: it cannot exist in an invalid
  state.
- `application/` depends only on the ports declared in `domain/`.
- `infrastructure/` implements those ports using `@/shared/infrastructure/http`.
  It is the only layer that knows the shape of the API's JSON.
- `presentation/` gets its use cases from `di/` through a facade hook. A
  component never calls the network or the store directly and holds no business
  rule.
- `di/` instantiates the implementations. Nothing else does.

Route files under `src/app` compose `presentation/` only.
