"use client";

import { useState } from "react";
import { Button } from "./common/button";
import { Modal } from "./common/modal";
import { GoalForm } from "./goal-form";

export function ShowGoalFormButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Commitment</Button>
      <Modal
        title="Add Commitment"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <GoalForm />
      </Modal>
    </>
  );
}
