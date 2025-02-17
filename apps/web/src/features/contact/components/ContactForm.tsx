import { Form } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export type ContactFormData = {
  contactReason: 'bug' | 'feedback' | 'other' | 'request';
  message: string;
};

export type ContactFormProps = {
  onSubmit: (data: ContactFormData) => void;
};

export const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const { t } = useTranslation('contact');
  return (
    <Form<ContactFormData>
      content={{
        contactReason: {
          kind: 'options',
          label: t('reason'),
          options: {
            bug: t('reasons.bug'),
            feedback: t('reasons.feedback'),
            other: t('reasons.other'),
            request: t('reasons.request')
          }
        },
        message: {
          kind: 'text',
          label: t('message'),
          variant: 'long'
        }
      }}
      validationSchema={z.object({
        contactReason: z.enum(['bug', 'feedback', 'other', 'request']),
        message: z.string()
      })}
      onSubmit={onSubmit}
    />
  );
};
