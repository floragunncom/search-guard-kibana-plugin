import buildSchedule from './buildSchedule';
import { SCHEDULE_DEFAULTS } from './constants';

describe('buildSchedule', () => {
  it('can build interval', () => {
    expect(buildSchedule({
      _frequency: 'interval',
      _period: { interval: 12, unit: 'h' },
      _timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          interval: ['12h'],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });

  it('can build daily', () => {
    expect(buildSchedule({
      _frequency: 'daily',
      _daily: 8,
      _timezone: [{ label: 'Europe/Berlin' }]
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
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly, fri: true },
        _daily: 8,
        _timezone: [{ label: 'Europe/Berlin' }]
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
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly, fri: true, sat: true },
        _daily: 8,
        _timezone: [{ label: 'Europe/Berlin' }]
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
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly },
        _daily: 8,
        _timezone: [{ label: 'Europe/Berlin' }]
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
      _frequency: 'monthly',
      _monthly: { ...SCHEDULE_DEFAULTS._monthly, day: 23 },
      _daily: 8,
      _timezone: [{ label: 'Europe/Berlin' }]
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
      _frequency: 'cron',
      _cron: '0 */5 * * *',
      _timezone: [{ label: 'Europe/Berlin' }]
    })).toEqual({
      trigger: {
        schedule: {
          cron: ['0 */5 * * *'],
          timezone: 'Europe/Berlin'
        }
      }
    });
  });
});
