const en: Record<string, string> = {
  // App
  'app.title': 'HealthTrack',
  'app.subtitle': 'Health Metrics Tracker',

  // Disclaimer
  'disclaimer.text':
    'This app is for personal health tracking only and does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.',

  // Entry Form
  'form.title': 'Log Entry',
  'form.editTitle': 'Edit Entry',
  'form.date': 'Date',
  'form.morningBP': 'Morning Blood Pressure',
  'form.eveningBP': 'Evening Blood Pressure',
  'form.systolic': 'Systolic',
  'form.diastolic': 'Diastolic',
  'form.restingHR': 'Resting Heart Rate',
  'form.weight': 'Weight',
  'form.notes': 'Notes',
  'form.save': 'Save',
  'form.update': 'Update Entry',
  'form.cancel': 'Cancel',
  'form.saved': 'Entry saved!',
  'form.editingDate': 'Updating entry for {date}',
  'form.invalidNumber': 'Please enter a valid number',
  'form.bpm': 'bpm',
  'form.mmHg': 'mmHg',

  // Entry List
  'list.title': 'Recent Entries',
  'list.empty': 'No entries yet. Add your first entry above!',
  'list.editHint': 'Need to fix a number? Tap any day to edit it.',
  'list.tapToEdit': 'Edit',
  'list.delete': 'Delete',
  'list.confirmDelete': 'Delete this entry?',
  'list.morningBP': 'AM BP',
  'list.eveningBP': 'PM BP',
  'list.hr': 'HR',
  'list.weight': 'Wt',

  // Charts
  'charts.title': 'Trends',
  'charts.bp': 'Blood Pressure',
  'charts.hr': 'Resting Heart Rate',
  'charts.weight': 'Weight',
  'charts.morning': 'Morning',
  'charts.evening': 'Evening',
  'charts.systolic': 'Systolic',
  'charts.diastolic': 'Diastolic',
  'charts.noData': 'Not enough data to show trends.',
  'charts.7d': '7D',
  'charts.30d': '30D',
  'charts.90d': '90D',
  'charts.noteLegend': 'has notes — tap to preview',

  // Export
  'export.csv': 'Export CSV',
  'export.backup': 'Export Backup',
  'import.backup': 'Import Backup',
  'import.merge': 'Merge',
  'import.mergeDesc': 'Import entries, overwriting existing dates',
  'import.replace': 'Replace All',
  'import.replaceDesc': 'Clear all data and import backup',
  'import.cancel': 'Cancel',
  'import.success': 'Imported {count} entries!',
  'import.error': 'Failed to import backup file',
  'import.selectMode': 'How would you like to import?',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.weightUnit': 'Weight Unit',

  // Backup & Restore
  'backup.sectionTitle': 'Your Data',
  'backup.lastBackup': 'Last backup',
  'backup.lastBackupConfirmed': 'Last confirmed backup',
  'backup.never': 'Never backed up',
  'backup.newEntries': '{count} new entries since last backup',
  'backup.attemptStatus': 'Backup file created on {date}. Make sure you saved it to Files or iCloud Drive.',
  'backup.reminderNever': "You haven't backed up your data yet. Back up now to keep your records safe.",
  'backup.reminderStale': 'You have {count} new entries since your last backup.',
  'backup.backupButton': 'Back Up My Data',
  'backup.backupDesc': 'Save a copy of all your records',
  'backup.restoreButton': 'Restore from Backup',
  'backup.restoreDesc': 'Choose a backup file to restore your records',
  'backup.exportCSV': 'Export as spreadsheet (CSV)',

  // How backup works
  'backup.howTitle': 'How backup works',
  'backup.howStep1': 'Tap Back Up My Data below',
  'backup.howStep2': 'Save the file when prompted',
  'backup.howStep2ios': 'Tap Share, then choose Save to Files',
  'backup.howStep3': 'Use Restore from Backup if you ever need your records back',

  // Post-backup messages
  'backup.sharedSuccess': 'Backup saved successfully!',
  'backup.downloadReady': 'Your backup file is ready.',
  'backup.downloadHint': 'Check your Downloads folder for the backup file.',
  'backup.downloadHintIOS': 'On iPhone, tap the Share button and choose Save to Files.',
  'backup.cancelled': 'Backup was not saved. Tap Back Up My Data to try again.',

  // Restore
  'backup.confirmTitle': 'Restore from backup?',
  'backup.confirmWarning': 'This will replace all your current records with the backup data. This cannot be undone.',
  'backup.confirmDetail': 'You currently have {currentCount} records. The backup contains {backupCount} records.',
  'backup.confirmYes': 'Yes, Restore My Data',
  'backup.confirmNo': 'Cancel',
  'backup.restoreSuccess': 'Restored {count} records successfully!',
  'backup.restoreErrorBadFile': 'This file does not look like a HealthTrack backup. Please choose the correct file.',
  'backup.restoreErrorFailed': 'Something went wrong while restoring. Your data was not changed.',
};

export default en;
