import { sendEmail } from "@/lib/email/email.lib";
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

    sendEmail({
      recipientEmail: "carol@example.com",
      subject: body.Subject,
      emailHtml: `
        <pre style="
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          font-family: monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">
          ${JSON.stringify(body, null, 2)}
        </pre>
      `,
    });

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
