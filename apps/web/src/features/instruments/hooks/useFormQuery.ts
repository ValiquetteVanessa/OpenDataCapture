import type { Language } from '@open-data-capture/common/core';
import { type FormInstrument } from '@open-data-capture/common/instrument';
import { type InstrumentBundle, evaluateInstrument } from '@open-data-capture/common/instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { resolveFormInstrument } from '@/utils/translate-instrument';

export function useFormQuery(id: string) {
  const { i18n } = useTranslation();
  return useQuery({
    queryFn: () => {
      return axios
        .get<InstrumentBundle>(`/v1/instruments/${id}`, {
          params: {
            kind: 'form'
          }
        })
        .then((response) => {
          const instrument = evaluateInstrument<FormInstrument>(response.data.bundle);
          return resolveFormInstrument(instrument, i18n.resolvedLanguage as Language);
        });
    },
    queryKey: ['form', id, i18n.resolvedLanguage],
    throwOnError: true
  });
}
