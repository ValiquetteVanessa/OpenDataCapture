import { useEffect, useState } from 'react';

import { SearchBar, SelectDropdown } from '@douglasneuroinformatics/ui';
import type { SelectOption } from '@douglasneuroinformatics/ui';
import type { UnilingualInstrumentSummary } from '@open-data-capture/common/instrument';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useInstrumentSummariesQuery } from '@/hooks/useInstrumentSummariesQuery';

import { InstrumentCard } from '../InstrumentCard';

export const InstrumentsShowcase = () => {
  const instrumentSummariesQuery = useInstrumentSummariesQuery();
  const navigate = useNavigate();
  const { t } = useTranslation(['core', 'instruments']);
  const [filteredInstruments, setFilteredInstruments] = useState<UnilingualInstrumentSummary[]>([]);
  const [tagOptions, setTagOptions] = useState<SelectOption[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<SelectOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<SelectOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const languageOptions = [
    {
      key: 'en',
      label: t('languages.english')
    },
    {
      key: 'fr',
      label: t('languages.french')
    }
  ];

  useEffect(() => {
    setFilteredInstruments(
      instrumentSummariesQuery.data.filter((summary) => {
        const matchesSearch = summary.details.title.toUpperCase().includes(searchTerm.toUpperCase());
        const matchesLanguages =
          selectedLanguages.length === 0 || selectedLanguages.find(({ key }) => key === summary.language);
        const matchesTags =
          selectedTags.length === 0 || summary.tags.some((tag) => selectedTags.find(({ key }) => key === tag));
        return matchesSearch && matchesLanguages && matchesTags;
      })
    );
  }, [instrumentSummariesQuery.data, searchTerm, selectedLanguages, selectedTags]);

  useEffect(() => {
    setTagOptions(
      Array.from(new Set(filteredInstruments.flatMap((item) => item.tags))).map((item) => ({
        key: item,
        label: item
      }))
    );
  }, [filteredInstruments]);

  return (
    <div>
      <div className="my-5 flex flex-col justify-between gap-5 lg:flex-row">
        <SearchBar
          size="md"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
        <div className="flex flex-grow gap-2 lg:flex-shrink">
          <div className="flex flex-grow" data-cy="tags-btn-dropdown">
            <SelectDropdown
              options={tagOptions}
              selected={selectedTags}
              setSelected={setSelectedTags}
              title={t('tags')}
            />
          </div>
          <div className="flex flex-grow" data-cy="language-btn-dropdown">
            <SelectDropdown
              options={languageOptions}
              selected={selectedLanguages}
              setSelected={setSelectedLanguages}
              title={t('language')}
            />
          </div>
        </div>
      </div>
      <div className="relative grid grid-cols-1 gap-5">
        {filteredInstruments.map((instrument, i) => {
          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              initial={{ opacity: 0, y: 80 }}
              key={instrument.id}
              transition={{ bounce: 0.2, delay: 0.15 * i, duration: 1.2, type: 'spring' }}
            >
              <InstrumentCard
                instrument={instrument}
                onClick={() => {
                  navigate(`/instruments/render/${instrument.id}`, { state: { summary: instrument } });
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
