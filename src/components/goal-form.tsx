"use client";

import { createGoal } from "@/actions/home.action";
import { useFormState } from "react-dom";

export const GoalForm = () => {
  const [errorMessage, dispatch] = useFormState(createGoal, undefined);

  return (
    <form className="flex flex-col gap-4 w-[400px]" action={dispatch}>
      <div className="flex flex-col gap-1">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          autoComplete="off"
          type="text"
          className="p-2 rounded-md border border-gray-300"
          placeholder="e.g. Finish blog post"
        />
      </div>
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="stakeAmount">Stake Amount ($)</label>
          <input
            id="stakeAmount"
            name="stakeAmount"
            type="number"
            className="p-2 rounded-md border border-gray-300"
            placeholder="e.g. 20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="p-2 rounded-md border border-gray-300"
            placeholder="Due Date"
          />
        </div>
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
