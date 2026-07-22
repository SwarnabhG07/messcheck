"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const settingsSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  college: z.string().min(2, "Please enter your college name"),
  yearOfStudy: z.string().min(1, "Please select your year of study"),
  rollNumber: z.string().min(2, "Please enter your roll number"),
  graduationYear: z.string().length(4, "Graduation year must be 4 digits"),
  hostel: z.string().min(1, "Please select your hostel"),
});

type SettingsValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: SettingsValues;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { update } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsValues) => {
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

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

      await update({ name: data.name });
      setSuccessMsg("Profile updated successfully!");
      
      // Force a hard reload to ensure the session context and UI reflect the updated name immediately.
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to update profile", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to delete account");
      }

      // Immediately sign out and redirect to login
      await signOut({ callbackUrl: "/login" });
    } catch (err: any) {
      console.error("Failed to delete account", err);
      setError(err.message);
      setIsDeleting(false);
    }
  };

  // Generate years dynamically
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 6 }, (_, i) => (currentYear + i).toString());

  // Generate hostels H1 to H13
  const hostels = [...Array.from({ length: 13 }, (_, i) => `H${i + 1}`), "Test Hostel"];

  return (
    <div className="space-y-5 pb-4">
      {/* Profile Form Card */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Profile Details</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-50 text-green-600 text-sm font-medium rounded-xl border border-green-100">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                {...register("name")}
                className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-black/10 text-sm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="college" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                College
              </Label>
              <Input
                id="college"
                type="text"
                list="settings-colleges-list"
                placeholder="e.g. IIT Bombay"
                {...register("college")}
                className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-black/10 text-sm"
              />
              <datalist id="settings-colleges-list">
                {[
                  "IIT Madras (Chennai)", "IIT Delhi", "IIT Bombay (Mumbai)", "IIT Kanpur", "IIT Kharagpur", 
                  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT (BHU) Varanasi", 
                  "IIT (ISM) Dhanbad", "IIT Gandhinagar", "IIT Ropar", "IIT Jodhpur", "IIT Mandi", 
                  "IIT Patna", "IIT Bhubaneswar", "IIT Tirupati", "IIT Palakkad", "IIT Dharwad", 
                  "IIT Goa", "IIT Bhilai", "IIT Jammu", "NIT Tiruchirappalli (Trichy)", "NIT Karnataka (Surathkal)", 
                  "NIT Rourkela", "NIT Warangal", "NIT Calicut", "VNIT Nagpur", "NIT Durgapur", "NIT Silchar", 
                  "MNIT Jaipur", "MNNIT Allahabad (Prayagraj)", "NIT Kurukshetra", "NIT Jalandhar", 
                  "MANIT Bhopal", "NIT Meghalaya", "NIT Raipur", "NIT Agartala", "NIT Goa", "NIT Jamshedpur", 
                  "NIT Patna", "NIT Hamirpur", "NIT Puducherry", "NIT Manipur", "NIT Arunachal Pradesh", 
                  "NIT Srinagar", "NIT Delhi", "NIT Mizoram", "NIT Nagaland", "NIT Sikkim", "NIT Uttarakhand", 
                  "NIT Andhra Pradesh (Tadepalligudem)", "IIEST Shibpur (Shibpur, West Bengal)", "ABV-IIITM Gwalior", 
                  "IIIT Allahabad", "IIITDM Jabalpur", "IIITDM Kancheepuram", "IIIT Sri City (Chittoor)", 
                  "IIIT Guwahati", "IIIT Vadodara", "IIIT Kota", "IIIT Tiruchirappalli", "IIIT Una", 
                  "IIIT Sonepat", "IIIT Kalyani", "IIIT Lucknow", "IIIT Dharwad", "IIITDM Kurnool", 
                  "IIIT Kottayam", "IIIT Manipur", "IIIT Nagpur", "IIIT Pune", "IIIT Ranchi", "IIIT Surat", 
                  "IIIT Bhopal", "IIIT Bhagalpur", "IIIT Agartala", "IIIT Raichur", "IIIT Vadodara (International Diu Campus)", 
                  "Assam University (Silchar)", "BIT Mesra", "BIT Deoghar (Off-Campus)", "BIT Patna (Off-Campus)", 
                  "Gurukula Kangri Vishwavidyalaya (Haridwar)", "Indian Institute of Carpet Technology (Bhadohi)", 
                  "Institute of Infrastructure Technology Research and Management (IITRAM, Ahmedabad)", 
                  "Guru Ghasidas Vishwavidyalaya (Bilaspur)", "J.K. Institute of Applied Physics & Technology (Prayagraj)", 
                  "National Institute of Electronics and Information Technology (Aurangabad)", 
                  "National Institute of Advanced Manufacturing Technology (NIAMT, Ranchi)", 
                  "Sant Longowal Institute of Engineering and Technology (SLIET, Punjab)", "Mizoram University (Aizawl)", 
                  "Tezpur University (Assam)", "Shri Mata Vaishno Devi University (Katra)", 
                  "Dr. SPM International Institute of Information Technology (Naya Raipur)", "University of Hyderabad", 
                  "Punjab Engineering College (PEC, Chandigarh)", "Jawaharlal Nehru University (JNU, Delhi)", 
                  "International Institute of Information Technology (IIIT Bhubaneswar)", "Central Institute of Technology (Kokrajhar, Assam)", 
                  "Puducherry Technological University", "Ghani Khan Choudhury Institute of Engineering and Technology (Malda)", 
                  "Central University of Rajasthan", "National Institute of Food Technology Entrepreneurship and Management (NIFTEM, Kundli)", 
                  "National Institute of Food Technology, Entrepreneurship and Management (NIFTEM, Thanjavur)", 
                  "North Eastern Regional Institute of Science and Technology (NERIST, Itanagar)", 
                  "Indian Institute of Handloom Technology (Varanasi)", "Chhattisgarh Swami Vivekanand Technical University (Bhilai)", 
                  "Institute of Chemical Technology (ICT, Bhubaneswar)", "North-Eastern Hill University (Shillong)", 
                  "Central University of Jammu", "Dr. Harisingh Gour Vishwavidyalaya (Sagar)", "Central University of Haryana", 
                  "Indian Institute of Handloom Technology (Salem)", "Gati Shakti Vishwavidyalaya (Vadodara)", 
                  "School of Planning and Architecture (SPA, Bhopal)", "School of Planning and Architecture (SPA, New Delhi)", 
                  "School of Planning and Architecture (SPA, Vijayawada)"
                ].map(college => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </datalist>
              {errors.college && <p className="text-red-500 text-xs mt-1 font-medium">{errors.college.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Year of Study
              </Label>
              <Select
                value={watch("yearOfStudy")}
                onValueChange={(val) => setValue("yearOfStudy", val, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-black/10 text-sm">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="1st Year" className="rounded-lg">1st Year</SelectItem>
                  <SelectItem value="2nd Year" className="rounded-lg">2nd Year</SelectItem>
                  <SelectItem value="3rd Year" className="rounded-lg">3rd Year</SelectItem>
                  <SelectItem value="4th Year" className="rounded-lg">4th Year</SelectItem>
                  <SelectItem value="5th Year" className="rounded-lg">5th Year</SelectItem>
                  <SelectItem value="Alumni" className="rounded-lg">Alumni</SelectItem>
                </SelectContent>
              </Select>
              {errors.yearOfStudy && <p className="text-red-500 text-xs mt-1 font-medium">{errors.yearOfStudy.message}</p>}
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Graduation Year
              </Label>
              <Select
                value={watch("graduationYear")}
                onValueChange={(val) => setValue("graduationYear", val, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-black/10 text-sm">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-48">
                  {graduationYears.map(year => (
                    <SelectItem key={year} value={year} className="rounded-lg">{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.graduationYear && <p className="text-red-500 text-xs mt-1 font-medium">{errors.graduationYear.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="rollNumber" className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Roll Number
              </Label>
              <Input
                id="rollNumber"
                placeholder="e.g. 210100101"
                {...register("rollNumber")}
                className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-black/10 text-sm"
              />
              {errors.rollNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.rollNumber.message}</p>}
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1.5">
                Hostel
              </Label>
              <Select
                value={watch("hostel")}
                onValueChange={(val) => setValue("hostel", val, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-black/10 text-sm">
                  <SelectValue placeholder="Select Hostel" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-48">
                  {hostels.map(h => (
                    <SelectItem key={h} value={h} className="rounded-lg">{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hostel && <p className="text-red-500 text-xs mt-1 font-medium">{errors.hostel.message}</p>}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-8 bg-amber-600 text-white font-semibold text-sm rounded-xl hover:bg-amber-700 transition-all shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-1">Danger Zone</h3>
          <p className="text-red-600/80 text-sm">
            Permanently delete your account and all of your reviews.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 h-10 px-5 rounded-xl text-sm font-semibold text-white shadow-sm shrink-0">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">Are you absolutely sure?</DialogTitle>
              <DialogDescription className="text-gray-500 pt-2 leading-relaxed">
                This will permanently delete your account and remove all of the reviews you have ever posted. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 rounded-xl text-white"
              >
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
