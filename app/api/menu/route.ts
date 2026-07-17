import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/app/lib/mongodb";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`menu_${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many menu updates. Please try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "mess_secretary" && userRole !== "supreme_leader") {
      return NextResponse.json({ error: "Forbidden: Only mess secretaries or supreme leaders can update the menu" }, { status: 403 });
    }

    const { tableData } = await req.json();
    if (!tableData || !Array.isArray(tableData) || tableData.length > 20) {
      return NextResponse.json({ error: "Invalid tableData: too many rows or not an array" }, { status: 400 });
    }
    for (const row of tableData) {
      if (!Array.isArray(row) || row.length > 10) {
        return NextResponse.json({ error: "Invalid table row format or too many columns" }, { status: 400 });
      }
      for (const cell of row) {
        if (typeof cell !== "string" || cell.length > 500) {
          return NextResponse.json({ error: "Invalid cell content: must be string up to 500 characters" }, { status: 400 });
        }
      }
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
    console.error("Failed to save menu:", error instanceof Error ? error.message : String(error));
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

    const menu = await db.collection("menus").findOne(
      { college: user.college, hostel: user.hostel },
      { projection: { _id: 0, updatedBy: 0 } }
    );

    return NextResponse.json(menu || { tableData: [] });
  } catch (error) {
    console.error("Failed to fetch menu:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`menu_${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many menu updates. Please try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "mess_secretary" && userRole !== "supreme_leader") {
      return NextResponse.json({ error: "Forbidden: Only mess secretaries or supreme leaders can delete the menu" }, { status: 403 });
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
    console.error("Failed to delete menu:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 });
  }
}

