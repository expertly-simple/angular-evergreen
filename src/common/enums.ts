export enum CheckFrequency {
  OnLoad = 'On Load',
  Hourly = 'Hourly',
  Daily = 'Daily',
  Weekly = 'Weekly',
  BiWeekly = 'Bi-Weekly',
}

export enum CheckFrequencyMilliseconds {
  OnLoadSchedule = -1,
  HourlySchedule = 3600000,
  DailySchedule = 86400000,
  WeeklySchedule = 604800000,
  BiWeeklySchedule = 1209600000,
}

export enum UpgradeChannel {
  Latest = 'Latest',
  Next = 'Next',
}
