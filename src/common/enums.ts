export enum CheckFrequency {
  OnLoad = 'On Load',
  Hourly = 'Hourly',
  Daily = 'Daily',
  Weekly = 'Weekly',
  BiWeekly = 'Bi-Weekly',
}

export enum CheckFrequencyMilliseconds {
  HourlySchedule = 3600000,
  DailySchedule = 86400000,
  WeeklySchedule = 604800000,
  BiWeeklySchedule = 1209600000,
}

export enum UpgradeVersion {
  Latest = 'Latest',
  Next = 'Next',
}
