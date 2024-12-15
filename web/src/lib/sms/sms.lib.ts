import { Twilio } from "twilio";
import { Config } from "../config";

export const TWILIO_PHONE_NUMBER = "+12542771936";

const TwilioClient = new Twilio(
  Config.TWILIO_ACCOUNT_SID,
  Config.TWILIO_AUTH_TOKEN,
);

export const sendSms = async ({
  phoneNumber,
  message,
  mediaUrls,
}: {
  phoneNumber: string;
  message: string;
  mediaUrls?: string[];
}) => {
  await TwilioClient.messages.create({
    to: phoneNumber,
    from: TWILIO_PHONE_NUMBER,
    body: message,
    mediaUrl: mediaUrls ? mediaUrls : undefined,
  });
};

// TODO set up webhook
// sendSms({
//   phoneNumber: "+17788829595",
//   message: "Hello, world!",
//   mediaUrls: [
//     "https://raw.githubusercontent.com/dianephan/flask_upload_photos/main/UPLOADS/DRAW_THE_OWL_MEME.png",
//   ],
// })
//   .then((res) => console.log(res))
//   .catch((err) => console.error(err));
