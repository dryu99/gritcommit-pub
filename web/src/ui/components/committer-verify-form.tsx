"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CommitterVerifyForm() {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement form submission
    // action should check db for verification token.
    console.log("Submitting:", { token, message, images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message" className="mb-2 block">
          How did you complete your commitment?
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border p-2"
          rows={4}
          placeholder="Describe how you completed your goal..."
        />
      </div>

      <div>
        <label htmlFor="images" className="mb-2 block">
          Add photos (optional)
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

      <button
        type="submit"
        className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Submit Verification
      </button>
    </form>
  );
}
