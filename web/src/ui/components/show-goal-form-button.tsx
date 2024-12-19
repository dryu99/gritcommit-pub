"use client";

import { useState } from "react";
import { Button } from "./common/button";
import { Modal } from "./common/modal";
import { GoalForm } from "./goal-form";

export function ShowGoalFormButton({
  title = "New Commitment",
}: {
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="h-7 px-3 text-xs" onClick={() => setIsOpen(true)}>
        {title}
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
