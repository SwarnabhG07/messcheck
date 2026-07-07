import { redirect } from "next/navigation";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch the latest user profile directly from MongoDB
  const client = await clientPromise;
  const db = client.db("messcheck");
  const user = await db.collection("users").findOne({ email: session.user.email });

  if (!user) {
    redirect("/login");
  }

  const profileData = {
    college: user.college || "",
    yearOfStudy: user.yearOfStudy || "",
    rollNumber: user.rollNumber || "",
    graduationYear: user.graduationYear || "",
    hostel: user.hostel || "",
  };

  return (
    <div className="px-6 py-2 max-w-4xl mx-auto w-full">
      <SettingsForm initialData={profileData} />
    </div>
  );
}
