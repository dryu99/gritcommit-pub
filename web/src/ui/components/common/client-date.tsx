"use client";

import { SafeDate, toFormattedDateText } from "@/lib/date";
import { useEffect, useState } from "react";

// need to do it like this to avoid hydration errors
export function ClientDate({ date }: { date: SafeDate }) {
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    const formattedDate = toFormattedDateText(date);
    setClientDate(formattedDate);
  }, [date]);

  return <span title={new Date(clientDate).toUTCString()}>{clientDate}</span>;
}
