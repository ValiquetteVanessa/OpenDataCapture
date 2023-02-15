import React, { useState } from 'react';

import { clsx } from 'clsx';
import { useController } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FormDataType } from '../types';

import { DatePicker } from './DatePicker';

import { TransitionOpacity } from '@/components/transitions';

export interface DateFieldProps {
  kind: 'date';
  name: string;
  label: string;
}

export const DateField = ({ name, label }: DateFieldProps) => {
  const { field, formState } = useController<FormDataType>({ name, defaultValue: '' });
  const [value, setValue] = useState(field.value);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    field.onChange(event.target.value);
    setValue(event.target.value);
  };

  const handleDatePickerSelection = (date: Date) => {
    setValue(date.toISOString());
  };

  const handleInputFocus: React.FocusEventHandler = () => {
    setShowDatePicker(true);
  };

  const handleInputBlur: React.FocusEventHandler = () => {
    setShowDatePicker(false);
  };

  return (
    <React.Fragment>
      <div className="field-container">
        <input
          autoComplete="off"
          className="field-input peer"
          value={value}
          onBlur={handleInputBlur}
          onChange={onChange}
          onFocus={handleInputFocus}
        />
        <label
          className={clsx('field-label peer-focus:field-label-floating', {
            'field-label-floating': value
          })}
          htmlFor={name}
        >
          {label}
        </label>
        <ErrorMessage error={formState.errors[name]} />
        <TransitionOpacity show={showDatePicker}>
          <DatePicker onSelection={handleDatePickerSelection} />
        </TransitionOpacity>
      </div>
    </React.Fragment>
  );
};
