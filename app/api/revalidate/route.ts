import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

interface RevalidatePayload {
  _type: string;
}

/**
 * Status-code contract:
 * - 500: SANITY_REVALIDATE_SECRET is not configured (never proceed unverified).
 * - 401: signature verification failed.
 * - 400: signature verified but body has no `_type`, OR body could not be
 *   parsed as JSON (signature not verified in that case).
 * - 200: success.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "Missing required env var: SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );
  }

  let isValidSignature: boolean | null;
  let body: RevalidatePayload | null;

  try {
    const parsed = await parseBody<RevalidatePayload>(req, secret);
    isValidSignature = parsed.isValidSignature;
    body = parsed.body;
  } catch {
    return NextResponse.json(
      { message: "Malformed webhook payload — signature not verified" },
      { status: 400 },
    );
  }

  if (!isValidSignature) {
    return NextResponse.json(
      { message: "Invalid signature" },
      { status: 401 },
    );
  }

  if (!body?._type) {
    return NextResponse.json(
      { message: "Missing _type in payload" },
      { status: 400 },
    );
  }

  revalidateTag(body._type);

  return NextResponse.json({ revalidated: true, tag: body._type });
}
