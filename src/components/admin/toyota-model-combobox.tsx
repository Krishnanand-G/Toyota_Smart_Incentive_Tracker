"use client";

import { SearchableCombobox } from "@/components/admin/searchable-combobox";
import { useEffect, useState } from "react";

type ToyotaModelComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function ToyotaModelCombobox({ value, onChange, required }: ToyotaModelComboboxProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (value.trim()) params.set("q", value.trim());
        const res = await fetch(`/api/admin/toyota-models?${params}`);
        if (res.ok) {
          const data = (await res.json()) as { models: string[] };
          setOptions(data.models);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <SearchableCombobox
      value={value}
      onChange={onChange}
      options={options}
      loading={loading}
      placeholder="Search Toyota models..."
      required={required}
      emptyMessage="No models found"
    />
  );
}
