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
            <p>
              Name: {item.name}({filesize(item.size ?? 0)})
            </p>
            <p>IssuerName: {item.issuerName}</p>

            <p>IssuerPath:</p>
            <div className="pl-2 border-l-4">
              {(item.issuerPath ?? []).map((issuer, i) => (
                <p key={i} title={issuer.identifier}>
                  {issuer.name ?? issuer.identifier}
                </p>
              ))}
            </div>

            <p>Reasons:</p>
            <div className="pl-2 border-l-4">
              {(item.reasons ?? []).map((reason, i) => (
                <p key={i}>
                  {`${reason.moduleName}:${reason.loc} (${reason.userRequest})`}
                </p>
              ))}
            </div>

            {Array.isArray(item.optimizationBailout) &&
              item.optimizationBailout.length > 0 && (
                <>
                  <p>Tip:</p>
                  <div className="pl-2 border-l-4">
                    {(item.optimizationBailout ?? []).map((tip, i) => (
                      <p key={i}>{tip}</p>
                    ))}
                  </div>
                </>
              )}

            {Array.isArray(item.usedExports) &&
              item.usedExports.length === 0 && (
                <p className="warning">No export used, maybe has side effect</p>
              )}
          </div>
        </Collapse.Item>
      ))}
    </Collapse>
  );
});
ModulesList.displayName = 'ModulesList';
