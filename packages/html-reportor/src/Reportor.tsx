import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { StatsCompilation, StatsChunk, StatsModule } from 'webpack';
import {
  Table,
  TableColumnProps,
  Input,
  Popover,
  Button,
  Space,
  Typography,
} from '@arco-design/web-react';
import type { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { IconSearch } from '@arco-design/web-react/icon';
import { get, groupBy, includes } from 'lodash-es';
import filesize from 'filesize';
import { useMemoizedFn } from 'ahooks';
import Highlighter from 'react-highlight-words';
import './Reportor.less';

export const Reportor: React.FC<{
  stats: StatsCompilation;
}> = React.memo((props) => {
  const inputRef = useRef<RefInputType>(null);
  const [pageSize, setPageSize] = useState(20);
  const [filtered, setFiltered] = useState<Partial<Record<string, string[]>>>(
    {}
  );

  const renderModuleIds = useMemoizedFn((col: (string | number)[]) => {
    return (
      <Space wrap={true}>
        {(col ?? []).map((item) => (
          <Button
            key={item}
            size="mini"
            type="text"
            onClick={() => setFiltered({ id: [String(item)] })}
          >
            {item}
          </Button>
        ))}
      </Space>
    );
  });

  const columns = useMemo(() => {
    return [
      {
        title: 'id',
        dataIndex: 'id',
        width: 100,
        fixed: 'left',
        filteredValue: filtered['id'],
        ...buildSearchFilter(inputRef, 'id'),
      },
      {
        title: 'names',
        dataIndex: 'names',
        width: 200,
        render: renderArray,
      },
      {
        title: 'files',
        dataIndex: 'files',
        width: 240,
        render: renderArray,
      },
      {
        title: 'parents',
        dataIndex: 'parents',
        width: 240,
        render: (col: StatsChunk['parents']) => {
          return (
            <Popover
              trigger={['click']}
              style={{ maxWidth: '80vw' }}
              content={renderModuleIds(col ?? [])}
            >
              <Button type="text">(Length: {(col ?? []).length})</Button>
            </Popover>
          );
        },
      },
      {
        title: 'children',
        dataIndex: 'children',
        width: 240,
        render: (col: StatsChunk['children']) => {
          return (
            <Popover
              trigger={['click']}
              style={{ maxWidth: '80vw' }}
              content={renderModuleIds(col ?? [])}
            >
              <Button type="text">(Length: {(col ?? []).length})</Button>
            </Popover>
          );
        },
      },
      {
        title: 'origins',
        dataIndex: 'origins',
        width: 120,
        filteredValue: filtered['origins'],
        render: (col: StatsChunk['origins']) => {
          return (
            <Popover
              trigger={['click']}
              style={{ maxWidth: '80vw' }}
              content={(col ?? []).map((item, i) => (
                <div key={i} className="whitespace-nowrap">
                  <Highlighter
                    searchWords={filtered['origins'] ?? []}
                    autoEscape={true}
                    textToHighlight={`${item.moduleName}:${item.loc}(${item.request})`}
                  />
                </div>
              ))}
            >
              <Button type="text">(Click)</Button>
            </Popover>
          );
        },
        ...buildSearchFilter(inputRef, (chunk, val) => {
          return (chunk.origins ?? []).some((item) =>
            String(item.moduleName).includes(val)
          );
        }),
      },
      {
        title: 'modules',
        dataIndex: 'modules',
        width: 120,
        filteredValue: filtered['modules'],
        render: (col: StatsChunk['modules']) => {
          return (
            <Popover
              trigger={['click']}
              style={{ maxWidth: '80vw' }}
              content={getAllModules(col ?? []).map((item, i) => {
                return (
                  <div key={i} className="whitespace-nowrap">
                    <Highlighter
                      searchWords={filtered['modules'] ?? []}
                      autoEscape={true}
                      textToHighlight={`${item.name}(${filesize(
                        item.size ?? 0
                      )})`}
                    />
                  </div>
                );
              })}
            >
              <Button type="text">(Click)</Button>
            </Popover>
          );
        },
        ...buildSearchFilter(inputRef, (chunk, val) => {
          return getAllModules(chunk.modules ?? []).some((item) =>
            String(item.name).includes(val)
          );
        }),
      },
      {
        title: 'entry',
        dataIndex: 'entry',
        width: 80,
      },
      {
        title: 'reason',
        dataIndex: 'reason',
        width: 380,
        render: (col) => (
          <Typography.Paragraph
            ellipsis={{ rows: 1, showTooltip: true, wrapper: 'span' }}
          >
            {col}
          </Typography.Paragraph>
        ),
      },
      {
        title: 'size',
        dataIndex: 'size',
        sorter: (a, b) => a.size - b.size,
        width: 100,
        render: (col) => filesize(col),
      },
    ] as TableColumnProps<StatsChunk>[];
  }, [filtered]);

  const data = useMemo<StatsChunk[]>(
    () => Array.from(props.stats.chunks ?? []),
    [props.stats.chunks]
  );

  useEffect(() => {
    console.log(groupBy(data, (item) => item.id));
  }, [data]);

  return (
    <div>
      <Table
        rowKey="hash"
        data={data}
        columns={columns}
        childrenColumnName="_children"
        pagination={{
          pageSize,
          showMore: true,
          showTotal: true,
          showJumper: false,
          sizeCanChange: true,
          onPageSizeChange: (size) => setPageSize(size),
        }}
        scroll={{ x: true }}
        onChange={(pagination, sorter, filters, extra) => {
          if (extra.action === 'filter') {
            setFiltered(filters);
          }
        }}
      />
    </div>
  );
});
Reportor.displayName = 'Reportor';

function renderArray(col: any) {
  return Array.isArray(col) ? col.join('|') : col;
}

function buildSearchFilter(
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
function getAllModules(modules: StatsModule[]): StatsModule[] {
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
