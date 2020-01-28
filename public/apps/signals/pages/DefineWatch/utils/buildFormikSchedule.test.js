import buildFormikSchedule from './buildFormikSchedule';
import { SCHEDULE_DEFAULTS } from './constants';

describe('buildFormikSchedule', () => {
  describe('interval', () => {
    it('can build interval from array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            interval: ['12h'],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'interval',
        period: {
          interval: 12,
          unit: 'h',
          advInterval: SCHEDULE_DEFAULTS.period.advInterval,
        },
        timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build interval from string', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            interval: '12h',
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'interval',
        period: {
          interval: 12,
          unit: 'h',
          advInterval: SCHEDULE_DEFAULTS.period.advInterval,
        },
        timezone: [{ label: 'Europe/Rome' }]
      });
    });
  });

  describe('daily', () => {
    it('can build daily from array of objects', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: [
              { at: '14:00:00' }
            ]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'daily',
        daily: 14,
        timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build daily from array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: {
              at: [
                '14:00:00',
                '17:00:00',
              ]
            }
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'daily',
        daily: 14,
        timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build daily from string', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: {
              at: '14:00:00'
            },
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'daily',
        daily: 14,
        timezone: [{ label: 'Europe/Rome' }]
      });
    });
  });

  describe('weekly', () => {
    it('can build weekly from array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: [
              { on: 'friday', at: '8:00:00' }
            ],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'weekly',
        weekly: { ...SCHEDULE_DEFAULTS.weekly, fri: true },
        daily: 8,
        timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build weekly from object', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: {
              on: ['friday', 'saturday'],
              at: ['8:00:00', '17:00:00'],
            },
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'weekly',
        weekly: { ...SCHEDULE_DEFAULTS.weekly, fri: true, sat: true },
        daily: 8,
        timezone: [{ label: 'Europe/Rome' }]
      });
    });
  });

  describe('cron', () => {
    it('can build cron', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            cron: ['0 */5 * * *'],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'cron',
        cron: '0 */5 * * *',
        timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build cron multiple cron expressions', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            cron: [
              '0 0/2 * ? * MON-FRI',
              '0 1-59/2 * ? * SAT-SUN'
            ]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'cron',
        cron: '0 0/2 * ? * MON-FRI\n0 1-59/2 * ? * SAT-SUN',
        timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build cron from string', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            cron: '0 */5 * * *',
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'cron',
        cron: '0 */5 * * *',
        timezone: [{ label: 'Europe/Rome' }]
      });
    });
  });

  describe('monthly', () => {
    it('can build monthly from object', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: { on: 23, at: '8:00:00' },
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'monthly',
        monthly: { ...SCHEDULE_DEFAULTS.monthly, day: 23 },
        daily: 8,
        timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build monthly from array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: [{ on: 23, at: '8:00:00' }],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'monthly',
        monthly: { ...SCHEDULE_DEFAULTS.monthly, day: 23 },
        daily: 8,
        timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build monthly from object with arrays', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: {
              on: [23, 24],
              at: ['8:00:00', '12:00:00']
            },
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        frequency: 'monthly',
        monthly: { ...SCHEDULE_DEFAULTS.monthly, day: 23 },
        daily: 8,
        timezone: [{ label: 'Europe/Rome' }]
      });
    });
  });
});
