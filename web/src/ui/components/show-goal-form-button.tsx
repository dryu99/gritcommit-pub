"use client";

import { useState } from "react";
import { Button } from "./common/button";
import { Modal } from "./common/modal";
import { GoalForm } from "./goal-form";

export function ShowGoalFormButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="h-7 px-3 text-xs" onClick={() => setIsOpen(true)}>
        New Commitment
      </Button>
      <Modal
        title="New Commitment"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <GoalForm onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
