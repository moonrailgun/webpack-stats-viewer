import React, { useState } from 'react';
import type { StatsChunk } from 'webpack';
import { Collapse } from '@arco-design/web-react';
import { getAllModules } from '../utils';
import Highlighter from 'react-highlight-words';
import filesize from 'filesize';

export const ModulesList: React.FC<{
  col: StatsChunk['modules'];
  searchWords: string[];
}> = React.memo((props) => {
  const [activeKey, setActiveKey] = useState<string[]>([]);

  return (
    <Collapse
      activeKey={activeKey}
      onChange={(key, keys) => setActiveKey(keys)}
      bordered={false}
      accordion={false}
    >
      {getAllModules(props.col ?? []).map((item, i) => (
        <Collapse.Item
          key={i}
          name={String(i)}
          header={
            <Highlighter
              className="whitespace-nowrap"
              searchWords={props.searchWords}
              autoEscape={true}
              textToHighlight={`${item.name}(${filesize(item.size ?? 0)})`}
            />
          }
        >
          <div className="whitespace-nowrap overflow-auto">
            <p>IssuerName: {item.issuerName}</p>
            <p>Reasons:</p>
            <div className="pl-2 border-l-4">
              {(item.reasons ?? []).map((reason, i) => (
                <p key={i}>
                  {reason.moduleName}:{reason.loc}({reason.userRequest})
                </p>
              ))}
            </div>
          </div>
        </Collapse.Item>
      ))}
    </Collapse>
  );
});
ModulesList.displayName = 'ModulesList';
