import React from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { HiCheck, HiChevronDown } from 'react-icons/hi2';

import { Button } from '../Button';

export interface SelectOption {
  key: string;
  label: string;
}

export interface SelectDropdownProps<T extends SelectOption[]> {
  title: string;
  options: T;
}

export const SelectDropdown = <T extends SelectOption[]>({ options, title }: SelectDropdownProps<T>) => {
  const [selected, setSelected] = React.useState<SelectOption[]>([]);

  return (
    <Listbox multiple as="div" className="relative flex w-full" value={selected} onChange={setSelected}>
      <Listbox.Button
        as={Button}
        className="h-full w-full"
        icon={<HiChevronDown />}
        iconPosition="right"
        label={title}
        style={{ width: '100%' }}
      />
      <Transition
        as="div"
        className="absolute bottom-0 z-10 w-full"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Listbox.Options className="absolute z-10 mt-2 flex w-full flex-col border">
          {options.map((option) => (
            <Listbox.Option
              className="flex w-full items-center bg-slate-50 p-2 hover:bg-slate-200"
              key={option.key}
              value={option}
            >
              <HiCheck className="ui-selected:visible invisible mr-2" />
              <span className="ui-selected:font-medium">{option.label}</span>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
};
