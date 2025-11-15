"use client";

import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/kibo-ui/tags";
import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const SelectTag = ({
  items,
  placeholder,
  value,
  onChange,
}: {
  items: Array<{
    id: string;
    name: string;
  }>;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const handleRemove = (v: string) => {
    if (!value.includes(v)) {
      return;
    }
    onChange(value.filter((item) => item !== v));
  };

  const handleSelect = (v: string) => {
    if (value.includes(v)) {
      handleRemove(v);
      return;
    }
    onChange([...value, v]);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Tags className="max-w-[300px]">
      <TagsTrigger placeholder={placeholder}>
        {value.map((tag) => (
          <TagsValue key={tag} onRemove={() => handleRemove(tag)}>
            {items.find((t) => t.id === tag)?.name}
          </TagsValue>
        ))}
      </TagsTrigger>
      <TagsContent>
        <TagsInput placeholder={placeholder} />
        <TagsList>
          <TagsEmpty />
          <TagsGroup>
            {items.map((tag) => (
              <TagsItem key={tag.id} onSelect={handleSelect} value={tag.id}>
                {tag.name}
                {value.includes(tag.id) && (
                  <CheckIcon className="text-muted-foreground" size={14} />
                )}
              </TagsItem>
            ))}
          </TagsGroup>
        </TagsList>
      </TagsContent>
    </Tags>
  );
};
