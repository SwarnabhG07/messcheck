import clientPromise from "@/app/lib/mongodb";
export const runtime = "nodejs";

export async function GET() {
  try {
    const c = await clientPromise;
    await c.db("messcheck").command({ ping: 1 });
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
