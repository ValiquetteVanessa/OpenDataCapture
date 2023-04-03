import React from 'react';

import { TextFormField } from '@ddcp/common';
import { clsx } from 'clsx';

import { FormFieldContainer } from './FormFieldContainer';
import { BaseFieldProps } from './types';

import { useFormField } from '@/hooks/useFormField';

type TextFieldProps = BaseFieldProps<TextFormField>;

export const TextField = ({ description, name, label, variant }: TextFieldProps) => {
  const { error, value, setValue } = useFormField<string>(name);

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    setValue(event.target.value);
  };

  return (
    <FormFieldContainer description={description} error={error}>
      {variant === 'short' || variant === 'password' ? (
        <input
          autoComplete="off"
          className="field-input peer"
          name={name}
          type={variant === 'short' ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
        />
      ) : (
        <textarea autoComplete="off" className="field-input peer" rows={5} value={value} onChange={handleChange} />
      )}
      <label
        className={clsx('field-label field-label-floating peer-focus:field-label-floating--active', {
          'field-label-floating--active': value
        })}
        htmlFor={name}
      >
        {label}
      </label>
    </FormFieldContainer>
  );
};
