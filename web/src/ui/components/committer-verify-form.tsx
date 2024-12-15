"use client";

import { GoalEntry } from "@/database/db-generated-types";
import { Selectable } from "kysely";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./common/button";
import { Link } from "./common/link";

export default function CommitterVerifyForm({
  token,
  goalEntry,
}: {
  token: string;
  goalEntry: Pick<Selectable<GoalEntry>, "dueAt">;
}) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSworn, setIsSworn] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [timeLeft, setTimeLeft] = useState("");

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const dueDate = new Date(goalEntry.dueAt).getTime();
    const difference = dueDate - now;

    if (difference <= 0) {
      return "Due date passed!";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [goalEntry.dueAt]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitStatus("loading");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const formData = new FormData();
      formData.append("token", token);
      formData.append("message", message);
      if (images[0]) {
        formData.append("image", images[0]);
      }

      // await handleCommitterVerify(formData);
      setSubmitStatus("success");
    } catch (e) {
      setSubmitStatus("error");
    }
  };

  if (timeLeft === "Due date passed!") {
    return (
      <div>
        <p>Due date passed!</p>
      </div>
    );
  }

  return (
    <>
      {submitStatus === "success" && (
        <div>
          {/* TODO improve copy here. maybe dont use verification in header */}
          <h2 className="mb-6 text-2xl font-bold">Verification Submitted!</h2>
          <p className="mb-6">
            Congrats on committing to your goal! Your partner will receive an
            email to verify your commitment shortly.
          </p>
          <Link className="text-brand" href="/dashboard">
            Go back home
          </Link>
        </div>
      )}

      {submitStatus === "error" && (
        <div>
          <p>Oops! Something went wrong. Please try again.</p>
        </div>
      )}

      {submitStatus === "loading" && (
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        </div>
      )}

      {submitStatus === "idle" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-600">Time remaining:</p>
            <p className="min-h-[1.75rem] text-xl font-bold text-orange-500">
              {timeLeft}
            </p>
          </div>
          <div></div>
          <h2 className="mb-6 text-2xl font-bold">Verify Your Commitment</h2>
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
