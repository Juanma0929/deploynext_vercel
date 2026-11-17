import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * The layers of every feature and of the shared kernel.
 *
 * A file inside src/features/<feature>/<layer>/ is classified by its layer and
 * the name of its feature is captured, so the policies below can require that
 * a dependency stays inside the same feature.
 */
const FEATURE_LAYERS = ["domain", "application", "infrastructure", "presentation", "di"];
const SHARED_LAYERS = ["domain", "infrastructure", "presentation", "di"];

const elements = [
  { type: "app", pattern: "src/app", partialMatch: false },
  ...FEATURE_LAYERS.map((layer) => ({
    type: `feature-${layer}`,
    pattern: `src/features/*/${layer}`,
    capture: ["feature"],
    partialMatch: false,
  })),
  ...SHARED_LAYERS.map((layer) => ({
    type: `shared-${layer}`,
    pattern: `src/shared/${layer}`,
    partialMatch: false,
  })),
];

const from = (type) => ({ from: { element: { type } } });
const sameFeature = (...layers) =>
  layers.map((layer) => ({
    to: {
      element: {
        type: `feature-${layer}`,
        captured: { feature: "{{ from.element.captured.feature }}" },
      },
    },
  }));
const anyOf = (...types) => types.map((type) => ({ to: { element: { type } } }));

/** Who may import whom. Anything not listed here is an error. */
const layerPolicies = [
  { ...from("feature-domain"), allow: [...sameFeature("domain"), ...anyOf("shared-domain")] },
  {
    ...from("feature-application"),
    allow: [...sameFeature("domain", "application"), ...anyOf("shared-domain")],
  },
  {
    ...from("feature-infrastructure"),
    allow: [
      ...sameFeature("domain", "infrastructure"),
      ...anyOf("shared-domain", "shared-infrastructure"),
    ],
  },
  {
    // Presentation never reaches infrastructure: it gets the use cases from di/.
    ...from("feature-presentation"),
    allow: [
      ...sameFeature("domain", "application", "presentation", "di"),
      ...anyOf("shared-domain", "shared-presentation"),
    ],
  },
  {
    ...from("feature-di"),
    allow: [
      ...sameFeature("domain", "application", "infrastructure", "di"),
      ...anyOf("shared-domain", "shared-infrastructure", "shared-di"),
    ],
  },
  {
    // Routes compose features: they render presentation and, on the server,
    // ask di/ for a use case. They never touch a repository.
    ...from("app"),
    allow: anyOf("app", "feature-presentation", "feature-di", "shared-domain", "shared-presentation"),
  },
  { ...from("shared-domain"), allow: anyOf("shared-domain") },
  { ...from("shared-infrastructure"), allow: anyOf("shared-domain", "shared-infrastructure") },
  { ...from("shared-presentation"), allow: anyOf("shared-domain", "shared-presentation") },
  { ...from("shared-di"), allow: anyOf("shared-domain", "shared-infrastructure", "shared-di") },
];

/** Libraries that tie code to a framework or to the network. */
const FRAMEWORK_AND_HTTP = ["react", "react-dom", "next", "axios", "ky", "ofetch", "node-fetch"];

const libraryPolicies = [
  // Libraries are allowed by default...
  { allow: { to: { module: { origin: ["external", "core"] } } } },
  // ...but the domain and the use cases stay pure TypeScript.
  {
    from: {
      element: { types: ["feature-domain", "feature-application", "shared-domain"] },
    },
    disallow: { to: { module: { source: FRAMEWORK_AND_HTTP } } },
    message:
      "The {{ from.element.type }} layer must not depend on React, Next.js or an HTTP library.",
  },
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": elements,
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          // Without this the rule only looks at local files, and the ban on
          // React, Next.js and HTTP libraries in the domain would never run.
          checkAllOrigins: true,
          policies: [...libraryPolicies, ...layerPolicies],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    // Only the infrastructure layers talk to the network.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/features/*/infrastructure/**", "src/shared/infrastructure/**"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "Use the HttpClient from src/shared/infrastructure/http through di/.",
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
