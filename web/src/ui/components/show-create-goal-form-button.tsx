"use client";

import { useState } from "react";
import { Modal } from "./common/modal";
import { GoalForm } from "./goal-form";

export function ShowCreateGoalFormButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create Goal</button>
      <Modal
        title="Create Goal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <GoalForm />
      </Modal>
    </>
  );
}
