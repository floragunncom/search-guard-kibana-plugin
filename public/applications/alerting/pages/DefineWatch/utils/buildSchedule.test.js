/** @jest-environment jsdom */
import buildSchedule from './buildSchedule';
import { SCHEDULE_DEFAULTS, ADVANCED_TIME_PERIOD_UNIT } from './constants';

describe('buildSchedule', () => {
  it('can build interval', () => {
    expect(buildSchedule({
      frequency: 'interval',
      period: {
        interval: 12,
        unit: 'h',
        advInterval: SCHEDULE_DEFAULTS.period.advInterval,
      },
      timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          interval: ['12h'],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });

  it('can build advanced interval', () => {
    expect(buildSchedule({
      frequency: 'interval',
      period: {
        interval: 12,
        unit: ADVANCED_TIME_PERIOD_UNIT,
        advInterval: '1h30m',
      },
      timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          interval: ['1h30m'],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });

  it('can build daily', () => {
    expect(buildSchedule({
      frequency: 'daily',
      daily: 8,
      timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          daily: [{ at: '8:00' }],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });

  describe('weekly', () => {
    it('can build weekly', () => {
      expect(buildSchedule({
        frequency: 'weekly',
        weekly: { ...SCHEDULE_DEFAULTS.weekly, fri: true },
        daily: 8,
        timezone: [{ label: 'Europe/Berlin' }]
      })).toEqual({
        trigger: {
          schedule: {
            weekly: [{ on: ['fri'], at: '8:00' }],
            timezone: 'Europe/Berlin'
          }
        }
      });
    });

    it('can build weekly if multiple days', () => {
      expect(buildSchedule({
        frequency: 'weekly',
        weekly: { ...SCHEDULE_DEFAULTS.weekly, fri: true, sat: true },
        daily: 8,
        timezone: [{ label: 'Europe/Berlin' }]
      })).toEqual({
        trigger: {
          schedule: {
            weekly: [{ on: ['fri', 'sat'], at: '8:00' }],
            timezone: 'Europe/Berlin'
          }
        }
      });
    });

    it('can build weekly if day was not selected', () => {
      expect(buildSchedule({
        frequency: 'weekly',
        weekly: { ...SCHEDULE_DEFAULTS.weekly },
        daily: 8,
        timezone: [{ label: 'Europe/Berlin' }]
      })).toEqual({
        trigger: {
          schedule: {
            weekly: [{ on: ['mon'], at: '8:00' }],
            timezone: 'Europe/Berlin'
          }
        }
      });
    });
  });

  it('can build monthly', () => {
    expect(buildSchedule({
      frequency: 'monthly',
      monthly: { ...SCHEDULE_DEFAULTS.monthly, day: 23 },
      daily: 8,
      timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          monthly: [{ on: 23, at: '8:00' }],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });

  it('can build cron', () => {
    expect(buildSchedule({
      frequency: 'cron',
      cron: '0 */5 * * *',
      timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          cron: ['0 */5 * * *'],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });

  it('can build multiple cron expressions', () => {
    expect(buildSchedule({
      frequency: 'cron',
      cron: '0 0/2 * ? * MON-FRI\n0 1-59/2 * ? * SAT-SUN',
      timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          cron: ['0 0/2 * ? * MON-FRI', '0 1-59/2 * ? * SAT-SUN'],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });
});
