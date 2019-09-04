import buildFormikSchedule from './buildFormikSchedule';
import { SCHEDULE_DEFAULTS } from './constants';

describe('buildFormikSchedule', () => {
  describe('interval', () => {
    it('can build interval', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            interval: ['12h'],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'interval',
        _period: { interval: 12, unit: 'h' },
        _timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build interval defaults if interval is not array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            interval: {}
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'interval',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });
  });

  describe('daily', () => {
    it('can build daily', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: [{ at: '8:00' }],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'daily',
        _daily: 8,
        _timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build daily defaults if daily is not array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: {}
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'daily',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build daily defaults if daily at is not string', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: [{ at: [] }]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'daily',
        _timezone: [{ label: 'Europe/Berlin' }]
      });

      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            daily: [{ at: {} }]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'daily',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });
  });

  describe('weekly', () => {
    it('can build weekly', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: [{ on: 'fri', at: '8:00' }],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly, fri: true },
        _daily: 8,
        _timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build weekly if full day name', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: [{ on: 'friday', at: '8:00' }]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly, fri: true },
        _daily: 8,
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build weekly if multiple days', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: [{ on: ['fri', 'sat'], at: '8:00' }]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly, fri: true, sat: true },
        _daily: 8,
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build weekly if multiple full days', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: [{ on: ['tuesday', 'thursday'], at: '8:00' }]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'weekly',
        _weekly: { ...SCHEDULE_DEFAULTS._weekly, tue: true, thu: true },
        _daily: 8,
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build weekly defaults if weekly is not array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: ''
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'weekly',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build weekly defaults if weekly at and on are not strings', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            weekly: [
              { on: [], at: [] }
            ]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'weekly',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });
  });

  describe('monthly', () => {
    it('can build monthly', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: [{ on: 23, at: '8:00' }],
            timezone: 'Europe/Rome'
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'monthly',
        _monthly: { ...SCHEDULE_DEFAULTS._monthly, day: 23 },
        _daily: 8,
        _timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build monthly defaults if monthly is not array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: ''
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'monthly',
        _timezone: [{ label: 'Europe/Berlin' }]
      });

      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: {}
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'monthly',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });

    it('can build monthly defaults if monthly at and on are not strings', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            monthly: [{ at: [], on: [] }]
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'monthly',
        _timezone: [{ label: 'Europe/Berlin' }]
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
        _frequency: 'cron',
        _cron: '0 */5 * * *',
        _timezone: [{ label: 'Europe/Rome' }]
      });
    });

    it('can build cron defaults if cron is not array', () => {
      expect(buildFormikSchedule({
        trigger: {
          schedule: {
            cron: ''
          }
        }
      })).toEqual({
        ...SCHEDULE_DEFAULTS,
        _frequency: 'cron',
        _timezone: [{ label: 'Europe/Berlin' }]
      });
    });
  });
});
