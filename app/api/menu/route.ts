import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "mess_secretary") {
      return NextResponse.json({ error: "Forbidden: Only mess secretaries can update the menu" }, { status: 403 });
    }

    const { tableData } = await req.json();
    if (!tableData || !Array.isArray(tableData)) {
      return NextResponse.json({ error: "Invalid tableData" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user || !user.college || !user.hostel) {
      return NextResponse.json({ error: "User profile incomplete" }, { status: 403 });
    }

    // Upsert the menu for this specific college and hostel
    await db.collection("menus").updateOne(
      { college: user.college, hostel: user.hostel },
      { 
        $set: { 
          college: user.college, 
          hostel: user.hostel, 
          tableData, 
          updatedAt: new Date(),
          updatedBy: session.user.email
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Menu saved successfully" });
  } catch (error) {
    console.error("Failed to save menu:", error);
    return NextResponse.json({ error: "Failed to save menu" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user || !user.college || !user.hostel) {
      return NextResponse.json({ error: "User profile incomplete" }, { status: 403 });
    }

    const menu = await db.collection("menus").findOne({ 
      college: user.college, 
      hostel: user.hostel 
    });

    return NextResponse.json(menu || { tableData: [] });
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "mess_secretary") {
      return NextResponse.json({ error: "Forbidden: Only mess secretaries can delete the menu" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("messcheck");
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user || !user.college || !user.hostel) {
      return NextResponse.json({ error: "User profile incomplete" }, { status: 403 });
    }

    await db.collection("menus").deleteOne({ 
      college: user.college, 
      hostel: user.hostel 
    });

    return NextResponse.json({ success: true, message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Failed to delete menu:", error);
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 });
  }
}

