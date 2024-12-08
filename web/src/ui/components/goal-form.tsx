"use client";

import { Day, DAYS } from "@/lib/days";
import { useEffect, useState } from "react";
import { createGoal, RawGoal } from "../../lib/goals/goals.actions";

const GOAL_PLACEHOLDERS = [
  "Finish blog post",
  "Apply to 5 jobs",
  "Exercise 3 times a week",
  "Read everyday",
];

export const GoalForm = ({ onClose }: { onClose: () => void }) => {
  const [error, setError] = useState("");
  const [goalPlaceholder, setGoalPlaceholder] = useState("");
  const [currGoalPlaceholderIndex, setCurrGoalPlaceholderIndex] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Day[]>(DAYS);
  const [dueDate, setDueDate] = useState("");

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
            (prev) => (prev + 1) % GOAL_PLACEHOLDERS.length,
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

  // TODO add validation to prevent empty selectedDays list from appearing
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(
      new FormData(e.currentTarget),
    ) as unknown as RawGoal;
    data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    data.scheduleDays = isRecurring
      ? selectedDays.map((d) => d.index)
      : undefined;

    try {
      if (!isRecurring) {
        createGoal(data);
        return;
      }

      const todayIndex = new Date().getDay();
      if (selectedDays.find((d) => d.index === todayIndex)) {
        const startToday = window.confirm(
          "Do you want to start this commitment today?",
        );
        data.startToday = startToday;
      }

      createGoal(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      onClose();
    }
  };

  return (
    <form
      className="flex w-full flex-col gap-5 text-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="font-medium">
          Your Commitment
        </label>
        <input
          id="description"
          name="description"
          autoComplete="off"
          type="text"
          className="rounded-md border p-2"
          placeholder={goalPlaceholder}
          required
        />
      </div>
      <div className="flex justify-between gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="stakeAmount" className="font-medium">
            Stake Amount ($)
          </label>
          <input
            id="stakeAmount"
            name="stakeAmount"
            type="number"
            min="0"
            className="w-full rounded-md border p-2"
            placeholder="20"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="partnerEmail" className="font-medium">
            Partner Email
          </label>
          <input
            id="partnerEmail"
            name="partnerEmail"
            type="email"
            className="w-full rounded-md border p-2"
            placeholder="partner@example.com"
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => {
            setIsRecurring(e.target.checked);
          }}
          className="h-4 w-4"
        />
        <label htmlFor="isRecurring">Recurring commitment?</label>
      </div>
      <div className="flex flex-col gap-2">
        {!isRecurring && (
          <div className="flex flex-col gap-1">
            <label htmlFor="dueDate" className="font-medium">
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={dueDate}
                className="w-[194px] rounded-md border p-2"
                onChange={(e) => {
                  setDueDate(e.target.value);
                }}
                required
              />
              {dueDate && (
                <span className="text-xs text-gray-500">Due @ 11:59pm</span>
              )}
            </div>
          </div>
        )}

        {isRecurring && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="frequencyType" className="font-medium">
                Due Dates
              </label>
              <div className="flex flex-col gap-2">
                <p>
                  {selectedDays.length === 0 ? (
                    <>Never</>
                  ) : selectedDays.length === 7 ? (
                    <>
                      Everyday{" "}
                      <span className="text-xs text-gray-500">
                        (Due @ 11:59pm)
                      </span>
                    </>
                  ) : (
                    <>
                      Every {selectedDays.map((d) => d.short).join(", ")}{" "}
                      <span className="text-xs text-gray-500">
                        (Due @ 11:59pm)
                      </span>
                    </>
                  )}
                </p>
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day.short}
                      type="button"
                      onClick={() => {
                        setSelectedDays((prev) => {
                          return prev.find((d) => d.short === day.short)
                            ? prev.filter((d) => d.short !== day.short)
                            : prev
                                .concat(day)
                                .sort(
                                  (a, b) => a.displayIndex - b.displayIndex,
                                );
                        });
                      }}
                      className={`h-8 w-8 rounded-full text-sm font-medium ${
                        selectedDays.find((d) => d.short === day.short)
                          ? "bg-brand text-white"
                          : "bg-gray-100 text-gray-600"
                      } transition-colors hover:opacity-80`}
                    >
                      {day.narrow}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="mt-6 rounded-md bg-brand p-2 text-white transition-colors hover:bg-brandHover"
      >
        Commit
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};
