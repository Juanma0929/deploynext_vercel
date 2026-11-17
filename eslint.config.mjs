import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// The layers of the Clean Architecture, declared so eslint-plugin-boundaries can
// check the direction of every import. `capture: ["feature"]` keeps the name of
// the feature a file belongs to, which is what lets a policy say "the same
// feature" instead of "any feature".
const elements = [
  { type: "domain", pattern: "src/features/*/domain", capture: ["feature"] },
  { type: "application", pattern: "src/features/*/application", capture: ["feature"] },
  { type: "infrastructure", pattern: "src/features/*/infrastructure", capture: ["feature"] },
  { type: "presentation", pattern: "src/features/*/presentation", capture: ["feature"] },
  { type: "di", pattern: "src/features/*/di", capture: ["feature"] },
  { type: "shared-domain", pattern: "src/shared/domain" },
  { type: "shared-infrastructure", pattern: "src/shared/infrastructure" },
  { type: "shared-presentation", pattern: "src/shared/presentation" },
  { type: "app", pattern: "src/app" },
];

const from = (type) => ({ element: { type } });
/** Layers of the feature the importing file itself belongs to. */
const own = (...types) => ({
  to: { element: { types, captured: { feature: "{{ from.captured.feature }}" } } },
});
/** Layers that are shared by the whole application. */
const shared = (...types) => ({ to: { element: { types } } });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": elements,
    },
    rules: {
      // Any import not allowed below is a layer violation.
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            // The domain is the centre: it depends on nothing but itself.
            {
              from: from("domain"),
              allow: [own("domain"), shared("shared-domain")],
            },
            // Use cases reach the domain through its ports.
            {
              from: from("application"),
              allow: [own("domain", "application"), shared("shared-domain")],
            },
            // Repositories, DTOs and mappers implement those ports.
            {
              from: from("infrastructure"),
              allow: [
                own("domain", "application", "infrastructure"),
                shared("shared-domain", "shared-infrastructure"),
              ],
            },
            // Components and facade hooks get their use cases from di/.
            {
              from: from("presentation"),
              allow: [
                own("domain", "application", "presentation", "di"),
                shared("shared-domain", "shared-presentation"),
              ],
            },
            // di/ is the only layer allowed to build concrete implementations.
            {
              from: from("di"),
              allow: [
                own("domain", "application", "infrastructure", "di"),
                shared("shared-domain", "shared-infrastructure"),
              ],
            },
            // Routes compose presentation and ask di/ for a use case. They may
            // read a domain type or an entity they were handed, but they can
            // never see infrastructure: no route builds a repository.
            {
              from: from("app"),
              allow: [
                shared(
                  "app",
                  "presentation",
                  "di",
                  "domain",
                  "shared-domain",
                  "shared-presentation",
                ),
              ],
            },
            { from: from("shared-domain"), allow: [shared("shared-domain")] },
            {
              from: from("shared-infrastructure"),
              allow: [shared("shared-domain", "shared-infrastructure")],
            },
            {
              from: from("shared-presentation"),
              allow: [shared("shared-domain", "shared-presentation")],
            },
          ],
        },
      ],
    },
  },

  {
    // The domain must stay framework-free: no React, no Next, no HTTP.
    files: ["src/features/*/domain/**/*.ts", "src/shared/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "The domain cannot depend on React." },
            { name: "react-dom", message: "The domain cannot depend on React." },
            { name: "next", message: "The domain cannot depend on Next.js." },
            { name: "axios", message: "The domain cannot depend on an HTTP library." },
          ],
          patterns: [
            { group: ["next/*"], message: "The domain cannot depend on Next.js." },
            { group: ["**/infrastructure/**"], message: "The domain cannot see infrastructure." },
          ],
        },
      ],
    },
  },

  {
    rules: {
      // The statement asks for typed code: an `any` has to be justified and
      // silenced on purpose, never left by accident.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
