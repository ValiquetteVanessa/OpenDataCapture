import React, { useContext, useRef } from 'react';

import {
  Card,
  DownloadButton,
  Dropdown,
  LanguageToggle,
  ThemeToggle,
  useDownload,
  useNotificationsStore
} from '@douglasneuroinformatics/ui';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { EditorPane, type EditorPaneRef } from '@open-data-capture/editor';
import { useTranslation } from 'react-i18next';

import { EditorContext } from '@/context/EditorContext';

import { InstrumentViewer, type InstrumentViewerRef } from './InstrumentViewer';

const sourceBanner = `/**
 * Please note that if you open this instrument in your IDE without the appropriate global type declarations,
 * you will see errors. This is expected so do not panic!
 */
`;

export const DesktopEditor = React.forwardRef<EditorPaneRef>(function DesktopEditor(_, ref) {
  const ctx = useContext(EditorContext);
  const download = useDownload();
  const notifications = useNotificationsStore();
  const viewerRef = useRef<InstrumentViewerRef>(null);
  const { i18n } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between p-2">
        <div className="flex w-min items-center gap-2">
          <span className="whitespace-nowrap">Selected Instrument: </span>
          <Dropdown
            className="text-sm [&_*]:text-sm"
            options={ctx.exampleOptions}
            size="sm"
            title={ctx.selectedExample.label}
            variant="secondary"
            onSelection={ctx.onChangeSelection}
          />
        </div>
        <div className="flex items-center gap-2">
          <DownloadButton
            onClick={() => {
              if (ctx.state.status !== 'built') {
                notifications.addNotification({
                  message: `Cannot download instrument when transpilation status is '${ctx.state.status}'`,
                  type: 'error'
                });
                return;
              } else if (ctx.source === null) {
                notifications.addNotification({
                  message: `Cannot download instrument when source is null'`,
                  type: 'error'
                });
                return;
              }
              const source = sourceBanner.concat(ctx.source);
              void download('instrument.tsx', () => source);
            }}
          />
          <ThemeToggle />
          {/* Once an Icon component is implemented in UI lib, use that instead */}
          <button
            className="rounded-md p-2 transition-transform hover:backdrop-brightness-95 dark:hover:backdrop-brightness-150"
            type="button"
            onClick={() => {
              viewerRef.current?.forceRefresh();
            }}
          >
            <ArrowPathIcon height={24} width={24} />
          </button>
          <LanguageToggle className="bg-slate-100" i18n={i18n} options={['en', 'fr']} />
        </div>
      </div>
      <div className="flex h-full min-h-0 gap-8 p-2">
        <div className="flex flex-grow flex-col">
          <Card className="flex-grow p-0.5">
            <EditorPane
              className="h-full min-h-0"
              defaultValue={ctx.selectedExample.value}
              path={ctx.selectedExample.path}
              ref={ref}
            />
          </Card>
        </div>
        <div className="flex h-full min-h-0 w-[640px] flex-shrink-0 flex-col">
          <Card className="z-10 flex h-full w-full flex-col justify-center p-4">
            <InstrumentViewer ref={viewerRef} state={ctx.state} />
          </Card>
        </div>
      </div>
    </div>
  );
});
