import { redirect } from "react-router";
import { getSupabaseServerClient } from "./supabase.server";

export const requireUser = async (request: Request) => {
  const headersToSet = new Headers();
  const { supabase } = getSupabaseServerClient(request, headersToSet);

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    throw redirect("/login");
  }

  return { user: data.user };
};
