const zh: Record<string, string> = {
  // App
  'app.title': 'HealthTrack',
  'app.subtitle': '健康指标追踪',

  // Disclaimer
  'disclaimer.text':
    '本应用仅用于个人健康记录，不提供医疗建议、诊断或治疗方案。如有健康问题，请咨询专业医疗人员。',

  // Entry Form
  'form.title': '记录数据',
  'form.editTitle': '编辑记录',
  'form.date': '日期',
  'form.morningBP': '晨间血压',
  'form.eveningBP': '晚间血压',
  'form.systolic': '收缩压',
  'form.diastolic': '舒张压',
  'form.restingHR': '静息心率',
  'form.weight': '体重',
  'form.notes': '备注',
  'form.save': '保存',
  'form.update': '更新记录',
  'form.cancel': '取消',
  'form.saved': '已保存！',
  'form.editingDate': '正在更新{date}的记录',
  'form.invalidNumber': '请输入有效数字',
  'form.bpm': 'bpm',
  'form.mmHg': 'mmHg',

  // Entry List
  'list.title': '历史记录',
  'list.empty': '暂无记录，请在上方添加第一条数据！',
  'list.edit': '编辑',
  'list.editHint': '输错了？点击任意一天即可修改。',
  'list.tapToEdit': '编辑',
  'list.delete': '删除',
  'list.confirmDelete': '确认删除此记录？',
  'list.morningBP': '晨间血压',
  'list.eveningBP': '晚间血压',
  'list.hr': '心率',
  'list.weight': '体重',

  // Charts
  'charts.title': '趋势图表',
  'charts.bp': '血压',
  'charts.hr': '静息心率',
  'charts.weight': '体重',
  'charts.morning': '晨间',
  'charts.evening': '晚间',
  'charts.systolic': '收缩压',
  'charts.diastolic': '舒张压',
  'charts.noData': '数据不足，无法显示趋势。',
  'charts.7d': '7天',
  'charts.30d': '30天',
  'charts.90d': '90天',
  'charts.noteLegend': '带圆圈的点表示有备注，点击该日期即可查看',

  // Export
  'export.csv': '导出 CSV',
  'export.backup': '导出备份',
  'import.backup': '导入备份',
  'import.merge': '合并导入',
  'import.mergeDesc': '导入数据，覆盖相同日期的记录',
  'import.replace': '全部替换',
  'import.replaceDesc': '清除所有数据并导入备份',
  'import.cancel': '取消',
  'import.success': '已导入 {count} 条记录！',
  'import.error': '导入备份文件失败',
  'import.selectMode': '请选择导入方式：',

  // Settings
  'settings.title': '设置',
  'settings.language': '语言',
  'settings.weightUnit': '体重单位',

  // Backup & Restore
  'backup.sectionTitle': '你的数据',
  'backup.lastBackup': '上次备份',
  'backup.lastBackupConfirmed': '上次确认备份',
  'backup.never': '从未备份',
  'backup.newEntries': '自上次备份以来有 {count} 条新记录',
  'backup.attemptStatus': '备份文件已于{date}创建。请确认你已将其保存到"文件"或 iCloud 云盘。',
  'backup.reminderNever': '你还没有备份过数据。立即备份以保护你的记录安全。',
  'backup.reminderStale': '自上次备份以来，你有 {count} 条新记录。',
  'backup.backupButton': '备份我的数据',
  'backup.backupDesc': '保存所有记录的副本',
  'backup.restoreButton': '从备份恢复',
  'backup.restoreDesc': '选择一个备份文件来恢复你的记录',
  'backup.exportCSV': '导出为表格 (CSV)',

  // How backup works
  'backup.howTitle': '备份方式说明',
  'backup.howStep1': '点击下方的"备份我的数据"',
  'backup.howStep2': '在提示时保存文件',
  'backup.howStep2ios': '点击"分享"，然后选择"存储到文件"',
  'backup.howStep3': '如需恢复记录，点击"从备份恢复"',

  // Post-backup messages
  'backup.sharedSuccess': '备份已成功保存！',
  'backup.downloadReady': '备份文件已准备好。',
  'backup.downloadHint': '请在下载文件夹中查找备份文件。',
  'backup.downloadHintIOS': '文件通常会出现在"文件"App中。如果没有看到，请点击分享并选择"存储到文件"。',
  'backup.cancelled': '备份未保存。请再次点击"备份我的数据"重试。',

  // Restore
  'backup.confirmTitle': '从备份恢复？',
  'backup.confirmWarning': '这将用备份数据替换你当前的所有记录。此操作无法撤销。',
  'backup.confirmDetail': '你目前有 {currentCount} 条记录。备份中包含 {backupCount} 条记录。',
  'backup.confirmYes': '确认恢复我的数据',
  'backup.confirmNo': '取消',
  'backup.restoreSuccess': '成功恢复了 {count} 条记录！',
  'backup.restoreErrorBadFile': '这个文件不是 HealthTrack 的备份文件，请选择正确的文件。',
  'backup.restoreErrorFailed': '恢复过程中出现问题，你的数据未被更改。',
};

export default zh;
