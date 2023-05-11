// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import common from './public/locales/en/common.json';
import overview from './public/locales/en/overview.json';
import subjects from './public/locales/en/subjects.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      overview: typeof overview;
      subjects: typeof subjects;
    };
  }
}
