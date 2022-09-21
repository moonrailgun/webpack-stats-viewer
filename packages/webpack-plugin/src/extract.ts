import type { StatsCompilation } from 'webpack';

/**
 * 提取数据
 */
export function extractData(source: StatsCompilation) {
  /**
   * 入口文件
   */
  const entrypoints = Object.values(source.entrypoints ?? {});
  const chunks = source.chunks ?? [];

  return { entrypoints, chunks };
}
