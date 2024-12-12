"use client";

import { handleCommitterVerify } from "@/lib/goals/goal.actions";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./common/button";

export default function CommitterVerifyForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSworn, setIsSworn] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  // TODO add loading state
  // TODO handle errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("token", token);
    formData.append("message", message);
    if (images[0]) {
      formData.append("image", images[0]);
    }

    await handleCommitterVerify(formData);
    setIsSubmitted(true);
  };

  return (
    <>
      {isSubmitted ? (
        <div>
          {/* TODO improve copy here. maybe dont use verification in header */}
          <h1 className="mb-6 text-2xl font-bold">Verification Submitted!</h1>
          <p>
            Congrats on committing to your goal! Your partner will receive an
            email to verify your commitment shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="mb-6 text-2xl font-bold">Verify Your Commitment</h1>
          <div className="mb-2">
            <label htmlFor="swear" className="mb-4 block">
              With utmost gravity and unwavering truthfulness, I hereby certify
              this deed done.
            </label>
            <input
              type="checkbox"
              id="swear"
              required
              checked={isSworn}
              onChange={(e) => setIsSworn(e.target.checked)}
              className="h-6 w-6 cursor-pointer accent-blue-500"
            />
          </div>

          {isSworn && (
            <>
              <div>
                <label htmlFor="message" className="mb-2 block">
                  A message for your partner (optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border p-2"
                  rows={4}
                  placeholder="The deed is done"
                />
              </div>

              <div>
                <label htmlFor="images" className="mb-2 block">
                  Add photo evidence (optional)
                </label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative h-40">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </>
          )}
        </form>
      )}
    </>
  );
}
