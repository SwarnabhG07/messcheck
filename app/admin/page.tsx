"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, UserCheck, Loader2, Building, Home, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [hostel, setHostel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [secretaries, setSecretaries] = useState<any[]>([]);
  const [isLoadingSecretaries, setIsLoadingSecretaries] = useState(true);

  const userRole = (session?.user as any)?.role;

  const fetchSecretaries = async () => {
    try {
      const res = await fetch("/api/admin/secretaries");
      if (res.ok) {
        const data = await res.json();
        setSecretaries(data.secretaries || []);
      }
    } catch (error) {
      console.error("Failed to fetch secretaries:", error);
    } finally {
      setIsLoadingSecretaries(false);
    }
  };

  useEffect(() => {
    if (userRole === "supreme_leader") {
      fetchSecretaries();
    }
  }, [userRole]);

  const handleRemoveRole = async (targetEmail: string) => {
    try {
      const res = await fetch(`/api/admin/secretaries?email=${encodeURIComponent(targetEmail)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Refresh the list after successful removal
        fetchSecretaries();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove role");
      }
    } catch (error) {
      console.error("Failed to remove role:", error);
      alert("Network error while trying to remove role");
    }
  };

  // Render access denied if not supreme leader (basic client side protection for now)
  if (userRole !== "supreme_leader") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md">
          This page is strictly restricted to Supreme Leaders. You do not have permission to view this content.
        </p>
      </div>
    );
  }

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/secretaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, college, hostel }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || `Successfully assigned 'mess_secretary' role to ${email}` });
        setEmail("");
        setCollege("");
        setHostel("");
        // Refresh the list
        fetchSecretaries();
      } else {
        setMessage({ type: 'error', text: data.error || "Failed to assign role. Please try again." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Assign Role Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage mess secretaries across all hostels.</p>
          </div>
        </div>

        <form onSubmit={handleAssignRole} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              User Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-amber-500 rounded-xl"
            />
            <p className="text-xs text-gray-500">
              The user must already have created an account before you can assign them this role.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="college" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              College Name
            </Label>
            <Input
              id="college"
              type="text"
              placeholder="e.g., University of Technology"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
              className="h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-amber-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostel" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Hostel Name
            </Label>
            <Input
              id="hostel"
              type="text"
              placeholder="e.g., Boys Hostel A"
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              required
              className="h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-amber-500 rounded-xl"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting || !email.trim()}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-medium shadow-sm transition-all"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning Role...</>
            ) : (
              "Assign Mess Secretary Role"
            )}
          </Button>
        </form>
      </div>

      {/* List of Secretaries */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Current Mess Secretaries</h2>
        
        {isLoadingSecretaries ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : secretaries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No mess secretaries assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-500">Name / Email</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">College</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Hostel</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {secretaries.map((sec) => (
                  <tr key={sec._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="font-medium text-gray-900">{sec.name || 'N/A'}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="w-3 h-3 mr-1.5" />
                        {sec.email}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        {sec.college || 'Not set'}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-gray-400" />
                        {sec.hostel || 'Not set'}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-gray-100 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Mess Secretary Role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <strong>{sec.name || sec.email}</strong> as a Mess Secretary? They will be demoted back to a regular Student and will lose access to post announcements and edit menus.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveRole(sec.email)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                            >
                              Yes, Remove Role
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
