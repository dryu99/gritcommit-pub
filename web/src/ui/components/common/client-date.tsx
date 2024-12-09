"use client";

import { useEffect, useState } from "react";

// need to do it like this to avoid hydration errors
export function ClientDate({ date }: { date: Date | string }) {
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    const formatted = new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });

    const prettyDate = formatted.replace(",", "");

    setClientDate(prettyDate);
  }, [date]);

  return <span title={new Date(clientDate).toUTCString()}>{clientDate}</span>;
}
