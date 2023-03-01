import React from 'react';

import { Stats } from 'common';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { SubjectsAPI } from '../api/subjects.api';

import { PageHeader, Spinner, Table } from '@/components/core';
import { LineGraph } from '@/components/graph';

export const SubjectPage = () => {
  const params = useParams();

  const { data } = useQuery('Instrument Record Titles for Subject', () =>
    SubjectsAPI.geAvailableInstrumentRecords(params.id!)
  );

  if (!data) {
    return null;
  }

  return (
    <div>
      <PageHeader title={`Instruments for Subject: ${params.id!.slice(0, 6)}`} />
      <Table
        columns={[
          { name: 'Title', field: 'title' },
          { name: 'Number of Records', field: 'count' }
        ]}
        data={data}
        entryLinkFactory={(entry) => `records/${entry.title}`}
      />
    </div>
  );

  /*
  const { data, isLoading } = useQuery('Subject', () => SubjectsAPI.getSubjectInstrumentRecords(params.id!));

  if (isLoading) {
    return <Spinner />;
  }

  const graphData = data?.map((record) => ({
    label: record.dateCollected.split('T')[0],
    mean: Stats.mean(Object.values(record.data), 2),
    std: Stats.std(Object.values(record.data), 2)
  }));

  return data ? (
    <div>
      <PageHeader title={`Instruments for Subject: ${params.id!.slice(0, 6)}`} />
      <div>
        <h3 className="mt-5 text-center">Brief Psychiatric Rating Scale</h3>
        <LineGraph data={graphData!} xAxis={{ label: 'Timepoint' }} yAxis={{ label: 'Total Score' }} />
      </div>
    </div>
  ) : null;
  */
};

export default SubjectPage;
