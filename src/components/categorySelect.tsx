// components/CategorySelect.tsx
'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import styles from '@/styles/CategorySelect.module.css';

interface CategorySelectProps {
  value: string;
  onValueChange: (val: string) => void;
  options: string[];
}

export default function CategorySelect({ value, onValueChange, options }: CategorySelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className={styles.trigger} aria-label="Category">
        <Select.Value placeholder="Select category" />
        <Select.Icon className={styles.icon}>
          <ChevronDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content} sideOffset={5}>
          <Select.Viewport className={styles.viewport}>
            {options.map((option) => (
              <Select.Item key={option} value={option} className={styles.item}>
                <Select.ItemText>{option}</Select.ItemText>
                <Select.ItemIndicator className={styles.check}>
                  <Check size={18} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
