"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const username = String(formData.get("username") || "").trim();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username,
      },
    },
  });

  console.log("REGISTER DATA:", data);
  console.error("REGISTER ERROR:", error);

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    redirect(`/register?error=${encodeURIComponent("User gagal dibuat.")}`);
  }

  try {
    await prisma.profile.create({
      data: {
        id: data.user.id,
        username,
        displayName: username,
      },
    });
  } catch (profileError) {
    console.error("PROFILE CREATE ERROR:", profileError);

    redirect(
      `/register?error=${encodeURIComponent(
        "Akun berhasil dibuat, tetapi profile gagal dibuat.",
      )}`,
    );
  }

  redirect("/login?registered=1");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent("Email dan password wajib diisi.")}`,
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}
