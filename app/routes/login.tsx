import { Form, redirect, type ActionFunctionArgs } from "react-router";
import { loginSchema } from "~/schemas/login-schema";
import { Button } from "~/shared/ui/button";
import { FloatingLabelInput } from "~/shared/ui/floating-input";
import { getSupabaseServerClient } from "~/supabase.server";
import type { Route } from "./+types/register";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const parsedData = loginSchema.safeParse(data);
  if (!parsedData.success) {
    return { error: "Invalid input" };
  }

  const { email, password } = parsedData.data;
  const headersToSet = new Headers();
  const { supabase, headers } = getSupabaseServerClient(request, headersToSet);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error };
  }

  return redirect("/", {
    headers,
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <Form method="post" className="space-y-8 max-w-3xl mx-auto py-10">
      <FloatingLabelInput label="Email" type="email" name="email" />
      <FloatingLabelInput label="Password" type="password" name="password" />
      <Button type="submit">Submit</Button>
      {actionData?.error && (
        <p>
          {typeof actionData.error === "object"
            ? actionData.error.message
            : actionData.error}
        </p>
      )}
    </Form>
  );
}
