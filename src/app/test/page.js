"use client";
import { useState } from "react";
import EstimationModal from "./components/EstimationModal";

export default function TestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const jobCardId = 1; // Example jobCardId

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <EstimationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jobCardId={jobCardId}
      />
    </div>
  );
}
