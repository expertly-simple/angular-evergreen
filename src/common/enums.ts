export enum CheckFrequency {
  EveryMinute = 'Every Minute',
  Hourly = 'Hourly',
  Daily = 'Daily',
  Weekly = 'Weekly',
  BiWeekly = 'Bi-Weekly',
}

export enum CheckFrequencyMilliseconds {
  EveryMinuteSchedule = 60000,
  HourlySchedule = 3600000,
  DailySchedule = 86400000,
  WeeklySchedule = 604800000,
  BiWeeklySchedule = 1209600000,
}
