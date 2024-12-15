import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Config } from "./config";

const s3Client = new S3Client({
  region: Config.AWS_REGION,
  credentials: {
    accessKeyId: Config.AWS_ACCESS_KEY_ID,
    secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
  },
});

// TODO maybe delete the image after sending?
export async function uploadToS3(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;

  // Upload the file
  await s3Client.send(
    new PutObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  );

  // Generate a pre-signed URL that's valid for 24 hours
  const command = new GetObjectCommand({
    Bucket: Config.AWS_BUCKET_NAME,
    Key: fileName,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 86400 }); // 24 hours
  return signedUrl;
}

export async function deleteFromS3(fileName: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: fileName,
    }),
  );
}
