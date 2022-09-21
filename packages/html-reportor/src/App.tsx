import { useState } from 'react';
import { Button } from '@arco-design/web-react';
import { useMemoizedFn } from 'ahooks';
import filesize from 'filesize';
import type { StatsCompilation } from 'webpack';
import { Reportor } from './Reportor';

export function App() {
  const [stats, setStats] = useState<StatsCompilation | null>(null);

  const handleFiles = useMemoizedFn(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) {
        console.warn('not select any file');
        return;
      }
      const file = e.target.files[0];
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
    }
  );

  return (
    <div>
      {stats ? (
        <Reportor stats={stats} />
      ) : (
        <input type="file" onChange={handleFiles} />
      )}
    </div>
  );
}
