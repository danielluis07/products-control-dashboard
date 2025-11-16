"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

export const SelectFilters = ({
  items,
  placeholder,
  value,
  onChange,
}: {
  items: Array<{ id: string; name: string }>;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger className="w-[200px] py-[19px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos(as)</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
