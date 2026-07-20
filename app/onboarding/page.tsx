"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  college: z.string().min(2, "College name is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  graduationYear: z.string().min(4, "Graduation year is required").regex(/^\d{4}$/, "Must be a valid 4-digit year"),
  hostel: z.string().min(2, "Hostel is required"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: session?.user?.name || "",
      college: "",
      yearOfStudy: "",
      rollNumber: "",
      graduationYear: "",
      hostel: "",
    },
  });

  const onSubmit = async (data: OnboardingValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to update profile");
      }

      // Update the client-side session so it knows we are onboarded
      await update({ onboarded: true, name: data.name });

      // Hard redirect to dashboard to ensure middleware runs fresh
      window.location.href = "/";
    } catch (err: any) {
      console.error("Failed to submit onboarding form", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hostels = [...Array.from({ length: 13 }, (_, i) => `H${i + 1}`), "Test Hostel"];
  const currentYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 6 }, (_, i) => (currentYear + i).toString());

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative background blobs (matching login page style but distinct colors) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-125 h-125 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-125">
        {/* Header/Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1e293b] mb-2">
            Welcome to MessCheck
          </h1>
          <p className="text-gray-500 text-sm">
            Hey {session?.user?.name?.split(' ')[0] || 'there'}, let's get your profile set up!
          </p>
        </div>

        {/* The Form Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                {...register("name")}
                className="w-full h-12 rounded-xl bg-[#f0f4f8] border-none focus-visible:ring-black/10 text-sm text-gray-900 placeholder:text-gray-400"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            {/* College */}
            <div>
              <Label htmlFor="college" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                College
              </Label>
              <Input
                id="college"
                type="text"
                placeholder="e.g. IIT Bombay"
                {...register("college")}
                className="w-full h-12 rounded-xl bg-[#f0f4f8] border-none focus-visible:ring-black/10 text-sm text-gray-900 placeholder:text-gray-400"
              />
              {errors.college && <p className="text-red-500 text-xs mt-1 font-medium">{errors.college.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Year of Study */}
              <div>
                <Label htmlFor="yearOfStudy" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                  Year of Study
                </Label>
                <select
                  id="yearOfStudy"
                  {...register("yearOfStudy")}
                  className="w-full h-12 px-3 rounded-xl bg-[#f0f4f8] border-none focus:ring-2 focus:ring-black/10 text-sm text-gray-900 outline-none"
                >
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="PhD/Masters">PhD / Masters</option>
                </select>
                {errors.yearOfStudy && <p className="text-red-500 text-xs mt-1 font-medium">{errors.yearOfStudy.message}</p>}
              </div>

              {/* Year of Graduation */}
              <div>
                <Label htmlFor="graduationYear" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                  Graduation Year
                </Label>
                <select
                  id="graduationYear"
                  {...register("graduationYear")}
                  className="w-full h-12 px-3 rounded-xl bg-[#f0f4f8] border-none focus:ring-2 focus:ring-black/10 text-sm text-gray-900 outline-none"
                >
                  <option value="" disabled>Select Year</option>
                  {gradYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.graduationYear && <p className="text-red-500 text-xs mt-1 font-medium">{errors.graduationYear.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Roll Number */}
              <div>
                <Label htmlFor="rollNumber" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                  Roll Number
                </Label>
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="e.g. 210100101"
                  {...register("rollNumber")}
                  className="w-full h-12 rounded-xl bg-[#f0f4f8] border-none focus-visible:ring-black/10 text-sm text-gray-900 placeholder:text-gray-400"
                />
                {errors.rollNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.rollNumber.message}</p>}
              </div>

              {/* Hostel */}
              <div>
                <Label htmlFor="hostel" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                  Hostel
                </Label>
                <select
                  id="hostel"
                  {...register("hostel")}
                  className="w-full h-12 px-3 rounded-xl bg-[#f0f4f8] border-none focus:ring-2 focus:ring-black/10 text-sm text-gray-900 outline-none"
                >
                  <option value="" disabled>Select Hostel</option>
                  {hostels.map(hostel => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
                {errors.hostel && <p className="text-red-500 text-xs mt-1 font-medium">{errors.hostel.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-amber-600 text-white font-semibold text-sm rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
              >
                {isSubmitting ? "Saving Profile..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
