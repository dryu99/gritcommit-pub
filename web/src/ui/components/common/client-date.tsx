"use client";

import { toFormattedDateText } from "@/lib/days";
import { useEffect, useState } from "react";

// need to do it like this to avoid hydration errors
export function ClientDate({ date }: { date: Date | string }) {
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    const formattedDate = toFormattedDateText(date);
    setClientDate(formattedDate);
  }, [date]);

  return <span title={new Date(clientDate).toUTCString()}>{clientDate}</span>;
}
