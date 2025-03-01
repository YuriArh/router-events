import { redirect, type ActionFunctionArgs } from "react-router";
import { getSupabaseServerClient } from "~/supabase.server";

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=Invalid%20code");
  }

  const headersToSet = new Headers();
  const { supabase } = getSupabaseServerClient(request, headersToSet);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect("/login?error=" + encodeURIComponent(error.message));
  }

  return redirect("/");
};

export default function Callback() {
  return <div>Callback</div>;
}
