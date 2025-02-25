import { z } from "zod";
import { camelKeys } from "string-ts";

const publicEnvSchema = z.object({
  MAPTILER_KEY: z.string(),
});

const makeTypedEnv = <T>(schema: { parse: (data: unknown) => T }) => {
  return (args: Record<string, unknown>) => {
    return camelKeys(schema.parse(args));
  };
};

const getPublicEnvFrom = makeTypedEnv(publicEnvSchema);

const getPublicEnv = () => {
  if (typeof window === "undefined") {
    return getPublicEnvFrom(process.env);
  }

  if (!window.PUBLIC_ENV) {
    throw new Error(
      " Public env is not exposed. Make sure yoou at exposing them at root.tsx"
    );
  }
  return getPublicEnvFrom(window.PUBLIC_ENV);
};

export { getPublicEnv, publicEnvSchema, makeTypedEnv };
