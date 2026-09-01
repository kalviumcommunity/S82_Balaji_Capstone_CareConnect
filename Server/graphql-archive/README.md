# GraphQL Layer (Archived)

This folder contains a GraphQL schema and resolver layer for the Doctor model
(queries, create/update/delete mutations). It is not currently mounted in the
live Express app (`server.js`).

## Why it's archived instead of active

1. `apollo-server-express` and `graphql` are not listed as dependencies in this
   project's `package.json` — they are not installed in this codebase, so this
   layer does not run as-is.
2. This project runs Express 5.1.0. `apollo-server-express` (and even Apollo
   Server 4's Express integration) has historically targeted Express 4, so
   adding it now carries real risk of dependency and version friction against
   the working, fully-tested REST API this project currently runs on.

The REST API already covers all of this functionality with proper
authentication and role-based authorization, so introducing a second API layer
was not worth the added dependency risk for this project.

## If revisited

The resolvers here would need security fixes to match the REST API's
authorization model before being production-ready: `createDoctor` currently
accepts a plaintext password and does not hash it, and none of the mutations
(`createDoctor`, `updateDoctor`, `deleteDoctor`) have any authentication or
authorization check. The equivalent REST routes (`/api/doctors/add`,
`/api/doctors/edit/:id`) were fixed for exactly this issue.