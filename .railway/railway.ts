import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "us-west2" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-west2", sizeMB: 5000 });
  const api = service("api", {
    source: github("amaliluthfi19/brewnal", { branch: "master", checkSuites: true }),
    build: { buildCommand: "pnpm --filter api build", buildEnvironment: "V3", builder: "RAILPACK", watchPatterns: ["/apps/api/**"] },
    start: "pnpm --filter api start",
    replicas: { "us-west2": 1 },
    networking: { tcpProxies: { "5432": {} } },
    env: { DATABASE_URL: preserve(), JWT_SECRET: preserve() },
  });
  const web = service("web", {
    source: github("amaliluthfi19/brewnal", { branch: "master", checkSuites: false }),
    build: { buildCommand: "pnpm --filter web build", buildEnvironment: "V3", builder: "RAILPACK", watchPatterns: ["/apps/web/**"] },
    start: "pnpm --filter web dev",
    replicas: { "us-west2": 1 },
  });

  return project("brewnal-project", {
    resources: [api, Postgres, web, postgresVolume],
  });
});
