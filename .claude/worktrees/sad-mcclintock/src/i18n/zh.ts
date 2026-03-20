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
  'form.cancel': '取消',
  'form.saved': '已保存！',
  'form.invalidNumber': '请输入有效数字',
  'form.bpm': 'bpm',
  'form.mmHg': 'mmHg',

  // Entry List
  'list.title': '历史记录',
  'list.empty': '暂无记录，请在上方添加第一条数据！',
  'list.edit': '编辑',
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
};

export default zh;
