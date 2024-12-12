import { NextRequest, NextResponse } from "next/server";

// enum EmailVerifyState {
//   WaitingForDueDate = "WAITING_FOR_DUE_DATE", // goal creation OR partner response for RECURRING goals triggers this
//   WaitingForCommitterResponse = "WAITING_FOR_COMMITTER_RESPONSE", // daily cron job triggers this
//   WaitingForPartnerResponse = "WAITING_FOR_PARTNER_RESPONSE", // committer response triggers this
//   Completed = "COMPLETED", // partner response triggers this for goal with end date
//   Failed = "FAILED", // partner response triggers this for SINGLE goals OR no response from committer
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // determine if this is COMMITTER_DUE email or PARTNER_RESPONSE email (check subject)
    //   if not, exit

    // determine that email is being received in correct order (WaitingForCommitterResponse or WaitingForPartnerResponse)
    //   if not, exit

    // determine if they've sent a valid response yet (check db for flag or sth)
    //   if yes, exit

    // determine if their NEW email message (not prev replies) contains expected output (yes, ye, y, no, n)
    //   if no, exit

    // based on email message contents + email subject type, send appropriate email
    //   COMMITTER_DUE (have to update db state to WAITING_FOR_PARTNER_RESPONSE)
    //   - yes: send partner verify email
    //   - no: send partner fail email
    //
    //   PARTNER_RESPONSE
    //   - yes: send committer success email
    //   - no: send committer fail email

    // await sendEmail({
    //   recipientEmail: "carol@example.com",
    //   subject: "THIS IS A TEST",
    //   emailHtml: `
    //     <pre style="
    //       background-color: #f5f5f5;
    //       padding: 15px;
    //       border-radius: 5px;
    //       font-family: monospace;
    //       white-space: pre-wrap;
    //       word-wrap: break-word;
    //     ">
    //       ${JSON.stringify(body, null, 2)}
    //     </pre>
    //   `,
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
