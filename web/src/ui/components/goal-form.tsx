"use client";

import { FrequencyType } from "@/types/enums";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useActionState, useEffect, useState } from "react";
import { createGoal } from "../../actions/goal.action";

const GOAL_PLACEHOLDERS = [
  "Finish blog post",
  "Quit smoking",
  "Apply to 5 jobs",
  "Exercise 3 times a week",
  "Read everyday",
];

type Day = {
  narrow: string;
  short: string;
  index: number;
};

const DAYS: Day[] = [
  { narrow: "M", short: "Mon", index: 0 },
  { narrow: "T", short: "Tue", index: 1 },
  { narrow: "W", short: "Wed", index: 2 },
  { narrow: "T", short: "Thu", index: 3 },
  { narrow: "F", short: "Fri", index: 4 },
  { narrow: "S", short: "Sat", index: 5 },
  { narrow: "S", short: "Sun", index: 6 },
];

export const GoalForm = () => {
  const [errorMessage, dispatch] = useActionState(createGoal, undefined);
  const [goalPlaceholder, setGoalPlaceholder] = useState("");
  const [currGoalPlaceholderIndex, setCurrGoalPlaceholderIndex] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasDate, setHasDate] = useState(false);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    FrequencyType.Daily
  );
  const [selectedDays, setSelectedDays] = useState<Day[]>(DAYS);
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

  // TODO add validation to prevent empty selectedDays list from appearing
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    if (!isRecurring) {
      dispatch(data);
      return;
    }

    if (frequencyType === FrequencyType.Daily) {
      const startToday = window.confirm(
        "Do you want to start this commitment today?"
      );
      data.append("startToday", startToday ? "true" : "false");
      dispatch(data);
      return;
    }

    if (frequencyType === FrequencyType.CustomDays) {
      const todayIndex =
        new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

      if (selectedDays.find((d) => d.index === todayIndex)) {
        const startToday = window.confirm(
          "Do you want to start this commitment today?"
        );
        data.append("startToday", startToday ? "true" : "false");
      }
    }

    dispatch(data);
  };

  return (
    <form
      className="flex flex-col gap-5 w-[400px] text-sm"
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
          className="p-2 rounded-md border"
          placeholder={goalPlaceholder}
          required
        />
      </div>
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="stakeAmount" className="font-medium">
            Stake Amount ($)
          </label>
          <input
            id="stakeAmount"
            name="stakeAmount"
            type="number"
            min="0"
            className="p-2 rounded-md border"
            placeholder="20"
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
            className="p-2 rounded-md border"
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
            <label htmlFor="dueDate" className="font-medium">
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className="w-[194px] p-2 rounded-md border"
                onChange={(e) => setHasDate(!!e.target.value)}
                required
              />
              {hasDate && <span className="text-gray-500">11:59pm</span>}
            </div>
          </div>
        )}

        {isRecurring && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="frequencyType" className="font-medium">
                Frequency
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-[194px]">
                  <select
                    id="frequencyType"
                    name="frequencyType"
                    className="w-full h-10 p-2 rounded-md border appearance-none"
                    value={frequencyType}
                    onChange={(e) =>
                      setFrequencyType(e.target.value as typeof frequencyType)
                    }
                  >
                    <option value={FrequencyType.Daily}>Every day</option>
                    <option value={FrequencyType.CustomDays}>
                      Custom days
                    </option>
                    <option value={FrequencyType.XPerWeek}>
                      X days a week
                    </option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
                <span className="text-gray-500">Due @ 11:59pm</span>
              </div>
            </div>

            {frequencyType === FrequencyType.CustomDays && (
              <div className="flex flex-col gap-3">
                <p>
                  {selectedDays.length === 0 ? (
                    <>Never</>
                  ) : selectedDays.length === 7 ? (
                    <>Every day</>
                  ) : (
                    <>Every {selectedDays.map((d) => d.short).join(", ")}</>
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
                                .sort((a, b) => a.index - b.index);
                        });
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
              </div>
            )}

            {frequencyType === FrequencyType.XPerWeek && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span>
                    {daysPerWeek} day{daysPerWeek === 1 ? "" : "s"} a week
                  </span>
                </div>
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
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="mt-6 bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700"
      >
        Commit
      </button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </form>
  );
};
