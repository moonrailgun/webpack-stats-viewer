import type { StatsChunk, StatsModule } from 'webpack';
import { TableColumnProps, Input } from '@arco-design/web-react';
import type { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { IconSearch } from '@arco-design/web-react/icon';
import { get, includes } from 'lodash-es';

export function renderArray(col: any) {
  return Array.isArray(col) ? col.join('|') : col;
}

export function buildSearchFilter(
  inputRef: React.MutableRefObject<RefInputType | null>,
  fieldPath: string | ((chunk: StatsChunk, val: string) => boolean)
): Pick<
  TableColumnProps<StatsChunk>,
  'filterIcon' | 'onFilter' | 'onFilterDropdownVisibleChange' | 'filterDropdown'
> {
  return {
    filterIcon: <IconSearch />,
    filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => {
      return (
        <div>
          <Input.Search
            ref={inputRef}
            searchButton
            style={{ width: 240 }}
            placeholder="Input Text"
            allowClear={true}
            value={filterKeys?.[0] || ''}
            onChange={(value) => {
              setFilterKeys?.(value ? [value] : []);
            }}
            onSearch={() => {
              confirm?.();
            }}
            onBlur={() => {
              confirm?.();
            }}
          />
        </div>
      );
    },
    onFilter: (value, row) => {
      if (typeof fieldPath === 'function') {
        return fieldPath(row, value);
      }

      return value ? includes(String(get(row, fieldPath)), value) : true;
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    },
  };
}

/**
 * Expand all modules
 */
export function getAllModules(modules: StatsModule[]): StatsModule[] {
  const list: StatsModule[] = [];
  modules.forEach((module) => {
    if (module.modules) {
      list.push(...module.modules);
    } else {
      list.push(module);
    }
  });

  return list;
}
