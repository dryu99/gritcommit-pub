"use client";

import { useState } from "react";
import { Button } from "./common/button";
import { Modal } from "./common/modal";
import { GoalForm } from "./goal-form";

export function ShowCreateGoalFormButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Create Goal</Button>
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
