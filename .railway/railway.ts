import { bucket, defineRailway, github, postgres, preserve, project, ref, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "us-west2" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-west2", sizeMB: 5000 });
  // Private S3-compatible bucket for bean photos; the region is immutable after creation
  const photos = bucket("organized-chest", { region: "sjc" });
  const api = service("api", {
    source: github("amaliluthfi19/brewnal", { branch: "master", checkSuites: true }),
    build: { buildCommand: "pnpm --filter api build", buildEnvironment: "V3", builder: "RAILPACK", watchPatterns: ["/apps/api/**"] },
    // Apply pending Prisma migrations before each deploy goes live; a failed migration aborts the deploy
    preDeploy: "pnpm --filter api db:deploy",
    start: "pnpm --filter api start",
    replicas: { "us-west2": 1 },
    // Must match the service domain's target port (8080), or the edge returns 502
    env: {
      DATABASE_URL: preserve(),
      JWT_SECRET: preserve(),
      PORT: "8080",
      // Reference variables: Railway resolves the bucket credentials at deploy, so no secret lives in this file
      S3_BUCKET: ref(photos, "BUCKET"),
      S3_ENDPOINT: ref(photos, "ENDPOINT"),
      S3_REGION: ref(photos, "REGION"),
      S3_ACCESS_KEY_ID: ref(photos, "ACCESS_KEY_ID"),
      S3_SECRET_ACCESS_KEY: ref(photos, "SECRET_ACCESS_KEY"),
    },
  });

  // The web app is hosted on Netlify (netlify.toml), not Railway
  return project("brewnal-project", {
    resources: [api, Postgres, postgresVolume, photos],
  });
});
