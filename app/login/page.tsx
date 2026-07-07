"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Utensils, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle email + password sign in
  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Google sign in
  function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4 font-sans">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-125 h-125 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-105">
        {/* Logo & Branding */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white mb-3 shadow-lg shadow-black/10">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
            MESS DASHBOARD
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">
            Sign in to manage your mess
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleCredentialsSignIn}
          className="bg-white rounded-[20px] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-gray-100 p-6"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <Label
              htmlFor="email"
              className="block text-gray-600 text-xs font-bold tracking-widest uppercase mb-2"
            >
              EMAIL
            </Label>
            <div className="relative">
              <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
                className="w-full pl-11 pr-4 h-12 rounded-xl bg-[#f0f4f8] border-gray-200 focus-visible:ring-black/10 focus-visible:border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <Label
              htmlFor="password"
              className="block text-gray-600 text-xs font-bold tracking-widest uppercase mb-2"
            >
              PASSWORD
            </Label>
            <div className="relative">
              <Lock className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-11 pr-12 h-12 rounded-xl bg-[#f0f4f8] border-gray-200 focus-visible:ring-black/10 focus-visible:border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black" />
              <Label
                htmlFor="remember"
                className="text-gray-500 text-[13px] font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            <a
              href="#"
              className="text-[13px] text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-black text-white font-semibold text-sm rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-black/10"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-12 bg-white border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-[13px] mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-black font-semibold hover:underline transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
