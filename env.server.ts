import { makeTypedEnv, publicEnvSchema } from "env.common";
import { z } from "zod";

const envSchema = publicEnvSchema.extend({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const getEnv = makeTypedEnv(envSchema);

const getPublicEnvToExpose = () => {
  return publicEnvSchema.parse(process.env);
};

export { getEnv, getPublicEnvToExpose };
