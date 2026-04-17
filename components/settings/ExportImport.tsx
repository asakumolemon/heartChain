'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { downloadFile, readFile, formatDate } from '@/lib/utils';
import { Download, Upload, Trash2, AlertCircle } from 'lucide-react';

export function ExportImport() {
  const [importStatus, setImportStatus] = useState<string>('');
  const [cleanupStatus, setCleanupStatus] = useState<string>('');

  const handleExport = async () => {
    try {
      const data = await db.exportAll();
      const jsonStr = JSON.stringify(data, null, 2);
      const filename = `prompt-chain-backup-${formatDate(new Date()).replace(/[/:]/g, '-')}.json`;
      downloadFile(jsonStr, filename);
      setImportStatus('导出成功!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      setImportStatus(`导出失败: ${error}`);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await readFile(file);
      const data = JSON.parse(text);

      if (!confirm(`导入将覆盖现有数据，确定继续吗？\n\n包含:\n- ${data.chains?.length || 0} 个提示链\n- ${data.executions?.length || 0} 条执行记录`)) {
        return;
      }

      await db.importAll(data);
      setImportStatus('导入成功! 页面即将刷新...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setImportStatus(`导入失败: ${error}`);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('确定要删除 30 天前的执行记录吗？此操作不可恢复。')) {
      return;
    }

    try {
      const count = await db.cleanupOldExecutions(30);
      setCleanupStatus(`已清理 ${count} 条旧记录`);
      setTimeout(() => setCleanupStatus(''), 3000);
    } catch (error) {
      setCleanupStatus(`清理失败: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">数据管理</h2>

      {/* 导出 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">导出数据</h3>
            <p className="text-sm text-gray-500 mt-1">
              将所有提示链和执行记录导出为 JSON 文件，用于备份或迁移
            </p>
            <button
              onClick={handleExport}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              导出备份
            </button>
          </div>
        </div>
      </div>

      {/* 导入 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Upload className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">导入数据</h3>
            <p className="text-sm text-gray-500 mt-1">
              从备份文件恢复数据，将覆盖现有数据
            </p>
            <div className="mt-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                选择备份文件
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 清理 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">清理旧数据</h3>
            <p className="text-sm text-gray-500 mt-1">
              删除 30 天前的执行记录，释放存储空间
            </p>
            <button
              onClick={handleCleanup}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              清理旧数据
            </button>
          </div>
        </div>
      </div>

      {/* 状态提示 */}
      {(importStatus || cleanupStatus) && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            importStatus?.includes('成功') || cleanupStatus?.includes('已清理')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          {importStatus || cleanupStatus}
        </div>
      )}

      {/* 隐私说明 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">数据隐私说明</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 所有数据仅存储在您的浏览器本地 (IndexedDB)</li>
          <li>• 数据不会上传到任何服务器</li>
          <li>• 清除浏览器数据将导致数据丢失，请定期备份</li>
          <li>• 导入/导出的 JSON 文件请妥善保管</li>
        </ul>
      </div>
    </div>
  );
}
