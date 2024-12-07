"use client";

import { useActionState, useEffect, useState } from "react";
import { createGoal } from "../../actions/home.action";
import { cn } from "../classnames";

enum RecurringType {
  Daily = "daily",
  CustomDays = "custom-days",
  XPerWeek = "x-per-week",
}

const GOAL_PLACEHOLDERS = [
  "Finish blog post",
  "Send job applications",
  "Exercise 3 times this week",
  "Read 20 pages daily",
];

type Day = {
  narrow: string;
  short: string;
};

const DAYS: Day[] = [
  { narrow: "M", short: "Mon" },
  { narrow: "T", short: "Tue" },
  { narrow: "W", short: "Wed" },
  { narrow: "T", short: "Thu" },
  { narrow: "F", short: "Fri" },
  { narrow: "S", short: "Sat" },
  { narrow: "S", short: "Sun" },
];

export const GoalForm = () => {
  const [errorMessage, dispatch] = useActionState(createGoal, undefined);
  const [goalPlaceholder, setGoalPlaceholder] = useState("");
  const [currGoalPlaceholderIndex, setCurrGoalPlaceholderIndex] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasDate, setHasDate] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>(
    RecurringType.Daily
  );
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState(3);

  useEffect(() => {
    let currentText = GOAL_PLACEHOLDERS[currGoalPlaceholderIndex];
    let currentChar = 0;
    let typingInterval: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;

    const typeText = () => {
      typingInterval = setInterval(() => {
        if (currentText && currentChar <= currentText.length) {
          setGoalPlaceholder(currentText.slice(0, currentChar));
          currentChar++;
        } else {
          clearInterval(typingInterval);

          pauseTimeout = setTimeout(eraseText, 2000);
        }
      }, 100);
    };

    const eraseText = () => {
      typingInterval = setInterval(() => {
        if (currentText && currentChar >= 0) {
          setGoalPlaceholder(currentText.slice(0, currentChar));
          currentChar--;
        } else {
          clearInterval(typingInterval);

          // Move to next example
          setCurrGoalPlaceholderIndex(
            (prev) => (prev + 1) % GOAL_PLACEHOLDERS.length
          );

          // Start typing the next example
          currentChar = 0;
          currentText =
            GOAL_PLACEHOLDERS[
              (currGoalPlaceholderIndex + 1) % GOAL_PLACEHOLDERS.length
            ];
          typeText();
        }
      }, 50);
    };

    typeText();

    return () => {
      clearInterval(typingInterval);
      clearTimeout(pauseTimeout);
    };
  }, [currGoalPlaceholderIndex]);

  return (
    <form className="flex flex-col gap-5 w-[400px] text-sm" action={dispatch}>
      <div className="flex flex-col gap-1">
        <label htmlFor="description">Your Commitment</label>
        <input
          id="description"
          name="description"
          autoComplete="off"
          type="text"
          className="p-2 rounded-md border"
          placeholder={goalPlaceholder}
        />
      </div>
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="stakeAmount">Stake Amount ($)</label>
          <input
            id="stakeAmount"
            name="stakeAmount"
            type="number"
            className="p-2 rounded-md border"
            placeholder="20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="partnerEmail">Partner Email</label>
          <input
            id="partnerEmail"
            name="partnerEmail"
            type="email"
            className="p-2 rounded-md border"
            placeholder="partner@example.com"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          // TODO would be nice to persist dates on change
          onChange={(e) => {
            setIsRecurring(e.target.checked);
            setHasDate(false);
          }}
          className="w-4 h-4"
        />
        <label htmlFor="isRecurring">Recurring commitment?</label>
      </div>
      <div className="flex flex-col gap-2">
        {!isRecurring && (
          <div className="flex flex-col gap-1">
            <label htmlFor="dueDate">Due Date</label>
            <div className="flex items-center gap-2">
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className="p-2 rounded-md border w-1/2"
                onChange={(e) => setHasDate(!!e.target.value)}
              />
              {hasDate && <span className="text-gray-500">11:59pm</span>}
            </div>
          </div>
        )}

        {isRecurring && (
          <div className="flex flex-col gap-2">
            <select
              name="recurringType"
              className={cn(
                "p-2 rounded-md border appearance-none mb-3",

                // we do this since default select arrow has weird padding
                "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]",
                "bg-[length:0.7em] bg-[right_0.7rem_center] bg-no-repeat pr-8"
              )}
              value={recurringType}
              onChange={(e) =>
                setRecurringType(e.target.value as typeof recurringType)
              }
            >
              <option value={RecurringType.Daily}>Every day</option>
              <option value={RecurringType.CustomDays}>Custom days</option>
              <option value={RecurringType.XPerWeek}>X days a week</option>
            </select>

            {recurringType === RecurringType.CustomDays && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day.short}
                      type="button"
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.find((d) => d.short === day.short)
                            ? prev.filter((d) => d.short !== day.short)
                            : prev.concat(day)
                        );
                      }}
                      className={`
                      w-8 h-8 rounded-full text-sm font-medium
                      ${
                        selectedDays.find((d) => d.short === day.short)
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                      hover:opacity-80 transition-colors
                    `}
                    >
                      {day.narrow}
                    </button>
                  ))}
                </div>
                {selectedDays.length > 0 && (
                  <p className="font-medium">
                    Every{" "}
                    {selectedDays
                      .sort(
                        (a, b) =>
                          DAYS.findIndex((d) => d.short === a.short) -
                          DAYS.findIndex((d) => d.short === b.short)
                      )
                      .map((d) => d.short)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

            {recurringType === RecurringType.XPerWeek && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDaysPerWeek(num)}
                      className={`
                        w-8 h-8 rounded-full text-sm font-medium
                        ${
                          daysPerWeek === num
                            ? "bg-orange-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }
                        hover:opacity-80 transition-colors
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{daysPerWeek} days a week</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700"
      >
        Create Commitment
      </button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </form>
  );
};
