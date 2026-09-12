import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "List your business | NammaSpot" },
      {
        name: "description",
        content:
          "Create a free NammaSpot seller account and give your small business a simple online page customers can find, save and share.",
      },
      { property: "og:title", content: "List your business | NammaSpot" },
      {
        property: "og:description",
        content: "Free seller sign-up for local makers, bakers and artists.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Use a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name: form.name, phone: form.phone },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email if confirmation is required.");
    void navigate({ to: "/dashboard" });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-extrabold">List your business</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an account, then add your business details for approval.
        </p>
        <form onSubmit={submit} className="card-soft mt-6 space-y-4 p-5">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required maxLength={80} value={form.name} onChange={set("name")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="phone">Phone / WhatsApp</Label>
            <Input
              id="phone"
              required
              inputMode="tel"
              maxLength={15}
              value={form.phone}
              onChange={set("phone")}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={set("email")}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={set("password")}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            {busy ? "Creating…" : "Create account"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </SiteShell>
  );
}
