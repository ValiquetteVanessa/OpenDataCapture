import React from 'react';

import { FormInstrumentSummary } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Button, Modal } from '@/components';

interface ArchiveInstrumentModalProps {
  instrument: FormInstrumentSummary;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onArchive: (instrument: FormInstrumentSummary) => Promise<void>;
}
export const ArchiveInstrumentModal = ({ isOpen, setIsOpen, instrument, onArchive }: ArchiveInstrumentModalProps) => {
  const { t } = useTranslation('instruments');

  return (
    <Modal open={isOpen} title={t('manageInstruments.deleteModal.title')} onClose={() => setIsOpen(false)}>
      <div>
        <span className="block">
          {t('manageInstruments.deleteModal.name')}: {instrument.name}
        </span>
        <span className="block">
          {t('manageInstruments.deleteModal.language')}: {instrument.details.language}
        </span>
        <span className="block">
          {t('manageInstruments.deleteModal.version')}: {instrument.version}
        </span>
      </div>
      <div className="mt-5 flex gap-3">
        <Button
          label={t('manageInstruments.deleteModal.delete')}
          type="button"
          variant="red"
          onClick={() => {
            setIsOpen(false);
            void onArchive(instrument);
          }}
        />
        <Button
          label={t('manageInstruments.deleteModal.cancel')}
          type="button"
          variant="light"
          onClick={() => setIsOpen(false)}
        />
      </div>
    </Modal>
  );
};
