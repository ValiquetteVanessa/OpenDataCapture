import type { Summary } from '@open-data-capture/types';
import { useTranslation } from 'react-i18next';
import { HiClipboardDocument, HiDocumentText, HiUser, HiUsers } from 'react-icons/hi2';

import { PageHeader, Spinner } from '@/components';
import { useFetch } from '@/hooks/useFetch';
import { useAuthStore } from '@/stores/auth-store';

import { Disclaimer } from '../components/Disclaimer';
import { GroupSwitcher } from '../components/GroupSwitcher';
import { StatisticCard } from '../components/StatisticCard';

export const OverviewPage = () => {
  const { currentGroup, currentUser } = useAuthStore();
  const { t } = useTranslation();
  const pageTitle = currentUser?.firstName
    ? `${t('overview.welcome')}, ${currentUser.firstName}`
    : t('overview.welcome');

  const summary = useFetch<Summary>('/v1/summary', [], {
    access: { action: 'read', subject: 'User' }
  });

  // // If it is the first time loading data
  if (summary.isLoading) {
    return <Spinner />;
  } else if (!summary.data) {
    return null;
  }

  return (
    <div>
      <Disclaimer isRequired={import.meta.env.PROD} />
      <PageHeader title={pageTitle} />
      <section>
        <div className="mb-5">
          <h3 className="text-center text-xl font-medium lg:text-left">{t('overview.summary')}</h3>
          <GroupSwitcher />
        </div>
        <div className="body-font">
          <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-2">
            <StatisticCard icon={<HiUsers />} label={t('overview.totalUsers')} value={summary.data.counts.users} />
            <StatisticCard icon={<HiUser />} label={t('overview.totalSubjects')} value={summary.data.counts.subjects} />
            <StatisticCard
              icon={<HiClipboardDocument />}
              label={t('overview.totalInstruments')}
              value={summary.data.counts.instruments}
            />
            <StatisticCard
              icon={<HiDocumentText />}
              label={t('overview.totalRecords')}
              value={summary.data.counts.records}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
