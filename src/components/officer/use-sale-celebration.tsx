"use client";

import { CelebrationDialog } from "@/components/incentive";
import type { LogSaleSuccessResult } from "@/components/officer/log-sale-form";
import { formatUtcDate } from "@/lib/date-picker-utils";
import { useState } from "react";

export function useSaleCelebration() {
  const [saleSuccessOpen, setSaleSuccessOpen] = useState(false);
  const [tierCelebrationOpen, setTierCelebrationOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [tierMessage, setTierMessage] = useState({ title: "", message: "" });

  function handleSaleSuccess(result: LogSaleSuccessResult) {
    const soldDate = formatUtcDate(result.entry.soldAt);
    setSuccessMessage({
      title: "Sale logged",
      message: `Recorded ${result.entry.carName} sold on ${soldDate}.`,
    });
    setSaleSuccessOpen(true);

    if (result.tierUnlocked && result.tierLabel) {
      setTierMessage({
        title: `New tier: ${result.tierLabel}`,
        message: `You're now earning ₹${result.payout.perUnitAmount.toLocaleString()} per unit. Estimated payout: ₹${result.payout.totalPayout.toLocaleString()}.`,
      });
    } else {
      setTierMessage({ title: "", message: "" });
    }
  }

  function closeSaleSuccess() {
    setSaleSuccessOpen(false);
    if (tierMessage.title) {
      setTierCelebrationOpen(true);
    }
  }

  function closeTierCelebration() {
    setTierCelebrationOpen(false);
    setTierMessage({ title: "", message: "" });
  }

  const dialogs = (
    <>
      <CelebrationDialog
        open={saleSuccessOpen}
        title={successMessage.title}
        message={successMessage.message}
        confirmLabel="OK"
        onClose={closeSaleSuccess}
      />
      <CelebrationDialog
        open={tierCelebrationOpen}
        title={tierMessage.title}
        message={tierMessage.message}
        confirmLabel="Awesome"
        onClose={closeTierCelebration}
      />
    </>
  );

  return { handleSaleSuccess, dialogs };
}
