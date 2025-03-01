import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { getEnv, getPublicEnvToExpose } from "env.server";

export const getSupabaseServerClient = (request: Request, headers: Headers) => {
  const supabase = createServerClient(
    getEnv(process.env).supabaseUrl!,
    getEnv(process.env).supabaseKey!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            );
          }
        },
      },
    }
  );
  return { supabase, headers };
};
