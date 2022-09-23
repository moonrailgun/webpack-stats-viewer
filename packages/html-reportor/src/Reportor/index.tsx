import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { StatsCompilation, StatsChunk } from 'webpack';
import {
  Table,
  TableColumnProps,
  Popover,
  Button,
  Space,
  Typography,
  Message,
} from '@arco-design/web-react';
import type { RefInputType } from '@arco-design/web-react/es/Input/interface';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCodeBlock,
  IconHome,
} from '@arco-design/web-react/icon';
import filesize from 'filesize';
import { useMemoizedFn, useHistoryTravel } from 'ahooks';
import Highlighter from 'react-highlight-words';
import { buildSearchFilter, getAllModules, renderArray } from './utils';
import { ModulesList } from './components/ModulesList';
import { isEmpty } from 'lodash-es';
import './index.less';

export const Reportor: React.FC<{
  stats: StatsCompilation;
}> = React.memo((props) => {
  const inputRef = useRef<RefInputType>(null);
  const [pageSize, setPageSize] = useState(20);
  const {
    value: filtered = {},
    setValue: setFiltered,
    forward,
    back,
    forwardLength,
    backLength,
  } = useHistoryTravel<Partial<Record<string, string[]>>>({});

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
        filteredValue: filtered['files'],
        ...buildSearchFilter(inputRef, (chunk, val) => {
          return (chunk.files ?? []).some((item) => String(item).includes(val));
        }),
      },
      {
        title: 'size',
        dataIndex: 'size',
        sorter: (a, b) => a.size - b.size,
        width: 100,
        render: (col) => filesize(col),
        defaultSortOrder: 'descend',
        filteredValue: filtered['size'],
        filterMultiple: false,
        filters: [
          {
            text: '> 2MB',
            value: 2 * 1024 * 1024,
          },
          {
            text: '> 1MB',
            value: 1 * 1024 * 1024,
          },
          {
            text: '> 512KB',
            value: 512 * 1024,
          },
          {
            text: '> 256KB',
            value: 256 * 1024,
          },
        ],
        onFilter: (value, row) => row.size > value,
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
        title: 'siblings',
        dataIndex: 'siblings',
        width: 240,
        render: (col: StatsChunk['siblings']) => {
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
              content={
                <ModulesList
                  col={col}
                  searchWords={filtered['modules'] ?? []}
                />
              }
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
    ] as TableColumnProps<StatsChunk>[];
  }, [filtered]);

  const data = useMemo<StatsChunk[]>(
    () => Array.from(props.stats.chunks ?? []),
    [props.stats.chunks]
  );

  const chunkMap = useMemo(() => {
    const map: Record<string | number, StatsChunk> = {};
    data.forEach((item) => {
      if (item.id) {
        map[item.id] = item;
      }
    });

    return map;
  }, [data]);

  return (
    <div>
      <div className="p-1 flex items-center">
        <div className="flex-1 text-lg">All Chunks</div>
        <Space>
          <Button
            icon={<IconCodeBlock />}
            onClick={() => {
              Message.info('Chunk Map has printed in devtool console');
              console.log(chunkMap);
            }}
          />
          <Button
            icon={<IconHome />}
            disabled={isEmpty(filtered)}
            onClick={() => setFiltered({})}
          />
          <Button
            icon={<IconArrowLeft />}
            disabled={backLength === 0}
            onClick={back}
          />
          <Button
            icon={<IconArrowRight />}
            disabled={forwardLength === 0}
            onClick={forward}
          />
        </Space>
      </div>
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
