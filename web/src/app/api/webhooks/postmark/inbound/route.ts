import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("WOOO", body);

    // const subject = body.Subject;

    // if (subject.includes("Commitment Completed")) {
    //   const goalId = body.HtmlBody.match(/goalId=(\d+)/)?.[1];
    // } else if (subject.includes("Commitment Due")) {
    //   const goalId = body.HtmlBody.match(/goalId=(\d+)/)?.[1];
    // }

    // sendEmail({
    //   recipientEmail: body.From,
    //   subject: body.Subject,
    //   emailHtml: body.HtmlBody,
    // });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true }, { status: 200 });
}
