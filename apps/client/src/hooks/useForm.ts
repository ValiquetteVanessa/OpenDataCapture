import { useState } from 'react';

import type { FormFields, FormInstrumentContent, FormInstrumentData } from '@ddcp/common';

import type { FormErrors, FormValues, NullableArrayFieldValue } from '@/components';
import { FormState } from '@/context/FormContext';

const DEFAULT_PRIMITIVE_VALUES = {
  text: '',
  options: '',
  date: '',
  numeric: null,
  binary: null
};

export function useForm<T extends FormInstrumentData>(content: FormInstrumentContent<T>): FormState<T> {
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [values, setValues] = useState<FormValues<T>>(() => {
    const defaultValues: Partial<FormValues<T>> = {};
    const fields = (Array.isArray(content) ? content.map((group) => group.fields) : content) as FormFields<T>;
    for (const fieldName in fields) {
      const field = fields[fieldName];
      if (field.kind === 'array') {
        const defaultItemValues: NullableArrayFieldValue[number] = {};
        for (const subfieldName in field.fieldset) {
          const subfield = field.fieldset[subfieldName];
          defaultItemValues[subfieldName] = DEFAULT_PRIMITIVE_VALUES[subfield.kind];
        }
        defaultValues[fieldName] = [defaultItemValues];
      } else {
        defaultValues[fieldName] = DEFAULT_PRIMITIVE_VALUES[field.kind];
      }
    }
    return defaultValues as FormValues<T>;
  });

  return { errors, setErrors, values, setValues };
}
