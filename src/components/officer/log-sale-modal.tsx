"use client";

import { LogSaleForm, type LogSaleSuccessResult } from "@/components/officer/log-sale-form";
import type { CarModelOption } from "@/components/officer/car-model-picker";
import { GlassModal } from "@/components/glass";

type LogSaleModalProps = {
  open: boolean;
  onClose: () => void;
  monthKey: string;
  cars: CarModelOption[];
  onSuccess: (result: LogSaleSuccessResult) => void;
};

export function LogSaleModal({ open, onClose, monthKey, cars, onSuccess }: LogSaleModalProps) {
  function handleSuccess(result: LogSaleSuccessResult) {
    onSuccess(result);
    onClose();
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Log a sale">
      <LogSaleForm key={`${open}-${monthKey}`} monthKey={monthKey} cars={cars} onSuccess={handleSuccess} />
    </GlassModal>
  );
}
