import React from 'react';

import { clsx } from 'clsx';

import { useField } from '../hooks/useField';
import { BaseFieldProps } from '../types';

export interface TextFieldProps extends BaseFieldProps {
  kind: 'text';
  variant: 'short' | 'long' | 'password';
}

export const TextField = ({ name, label, variant }: TextFieldProps) => {
  const { value, onChange } = useField<string>(name);

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    onChange(name, event.target.value);
  };

  return (
    <>
      {variant === 'long' ? (
        <textarea autoComplete="off" className="field-input peer" rows={5} value={value} onChange={handleChange} />
      ) : (
        <input autoComplete="off" className="field-input peer" type={variant} value={value} onChange={handleChange} />
      )}
      <label
        className={clsx('field-label peer-focus:field-label-floating', {
          'field-label-floating': value
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </>
  );
};
