"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const signupSchema = z.object({
  name: z.string().min(2, "Full Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Create the user via the API route
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to sign up");
      }

      // 2. Automatically log the user in
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Account created but failed to auto-login.");
      }

      // 3. Teleport them to the onboarding page
      router.push("/onboarding");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-125 h-125 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-violet-600/20 transform rotate-3">
            <span className="text-white font-bold text-2xl -rotate-3">MC</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Create an Account
          </h1>
          <p className="text-gray-500 text-sm">
            Join MessCheck today
          </p>
        </div>

        {/* The Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className="w-full h-12 rounded-xl bg-[#f0f4f8] border-none focus-visible:ring-black/10 text-sm text-gray-900 placeholder:text-gray-400"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="w-full h-12 rounded-xl bg-[#f0f4f8] border-none focus-visible:ring-black/10 text-sm text-gray-900 placeholder:text-gray-400"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full h-12 rounded-xl bg-[#f0f4f8] border-none focus-visible:ring-black/10 text-sm text-gray-900 placeholder:text-gray-400"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-violet-600 text-white font-semibold text-sm rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
              >
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
