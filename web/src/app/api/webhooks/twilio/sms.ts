import { TWILIO_PHONE_NUMBER } from "@/lib/sms/sms.lib";
import { NextRequest, NextResponse } from "next/server";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

// ! this code doesn't work, just leaving it here for reference
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { From: SenderNumber, NumMedia, MessageSid } = body;

  console.log("BODY", body);
  const mediaItems: { mediaUrl: string; contentType: string }[] = [];

  for (let i = 0; i < NumMedia; i++) {
    const mediaUrl = body[`MediaUrl${i}`];
    const contentType = body[`MediaContentType${i}`];

    console.log(mediaUrl, contentType);
    mediaItems.push({ mediaUrl, contentType });
  }

  const twilioMessage = new MessagingResponse();
  twilioMessage.message(
    {
      to: SenderNumber,
      from: TWILIO_PHONE_NUMBER,
    },

    JSON.stringify(mediaItems, null, 2),
  );

  if (mediaItems[0]) {
    twilioMessage.media(mediaItems[0].mediaUrl);
  }

  return new NextResponse(twilioMessage.toString());
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true }, { status: 200 });
}
