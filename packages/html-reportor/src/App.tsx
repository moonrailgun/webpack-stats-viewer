import { useState } from 'react';
import { Upload, Button, Spin } from '@arco-design/web-react';
import { UploadItem } from '@arco-design/web-react/es/Upload/index';
import { useMemoizedFn } from 'ahooks';
import filesize from 'filesize';
import type { StatsCompilation } from 'webpack';
import { Reportor } from './Reportor';

export function App() {
  const [stats, setStats] = useState<StatsCompilation | null>(null);

  const handleFiles = useMemoizedFn((_, _file: UploadItem) => {
    const file = _file.originFile;
    if (!_file || !file) {
      console.warn('Not select any file');
      return;
    }

    console.log('File size:', filesize(file.size));

    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        try {
          resolve(JSON.parse(String(this.result)));
        } catch (err) {
          reject(err);
        }
      };
    }).then((json) => {
      setStats(json as StatsCompilation);
      console.log(json);
    });
  });

  return (
    <div>
      {stats ? (
        <Reportor stats={stats} />
      ) : (
        <div className="m-auto w-8/12 text-center">
          <div className="text-lg p-4">Upload your stats.json file</div>
          <Button
            className="mb-4"
            type="primary"
            href="https://webpack.js.org/api/stats/"
            target="_blank"
          >
            How to generate stats.json
          </Button>
          <Upload
            directory={false}
            limit={1}
            drag={true}
            renderUploadList={(fileList) =>
              fileList.length > 0 ? <Spin dot={true} /> : null
            }
            onChange={handleFiles}
          />
        </div>
      )}
    </div>
  );
}
