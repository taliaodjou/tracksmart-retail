import React from 'react';
import { Input } from '@/components/ui/input';
import { rayonKeys } from '@/lib/productUtils';

export default function RayonInput({ value, onChangeValue, className, placeholder, listId = 'rayon-options' }) {
  return (
    <>
      <Input
        list={listId}
        value={value || ''}
        onChange={(event) => onChangeValue(event.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {Object.entries(rayonKeys).map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue} label={label} />
        ))}
      </datalist>
    </>
  );
}