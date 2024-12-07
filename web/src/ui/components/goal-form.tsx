"use client";

import { useActionState, useEffect, useState } from "react";
import { createGoal } from "../../actions/home.action";

const GOAL_PLACEHOLDERS = [
  "Finish blog post",
  "Send job applications",
  "Exercise 3 times this week",
  "Read 20 pages daily",
];

export const GoalForm = () => {
  const [errorMessage, dispatch] = useActionState(createGoal, undefined);
  const [goalPlaceholder, setGoalPlaceholder] = useState("");
  const [currGoalPlaceholderIndex, setCurrGoalPlaceholderIndex] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasDate, setHasDate] = useState(false);

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
        {isRecurring ? (
          <div className="flex flex-col gap-2">
            <select
              name="frequency"
              className="p-2 rounded-md border"
              defaultValue=""
            >
              <option value="" disabled>
                Select frequency
              </option>
              <option value="daily">Every day</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom days</option>
            </select>
          </div>
        ) : (
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
