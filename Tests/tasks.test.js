/**
 * Functional-requirement tests (Goal creation & Streak tracking)
 *
 * ├─ Backend/server.js   ← exports the Express app
 * ├─ Backend/tasks.json  ← mocked in-memory
 * └─ Backend/streak.json ← mocked in-memory
 *
 * supertest spins the Express app in-memory, no “npm start” needed.
 */
const request = require('supertest');
const fs      = require('fs');
const path    = require('path');

const serverPath  = path.join(__dirname, '..', 'Backend', 'server.js');
const TASKS_FILE  = path.join(__dirname, '..', 'Backend', 'tasks.json');
const STREAK_FILE = path.join(__dirname, '..', 'Backend', 'streak.json');

/* ------------------------------------------------------------------ */
/* In-memory “files”                                                  */
/* ------------------------------------------------------------------ */
let tasksStore  = [];
let streakStore = { current: 0, best: 0, lastDate: null };

/* Helpers ---------------------------------------------------------- */
const todayISO = (shift = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + shift);
  return d.toISOString();
};

/* ------------------------------------------------------------------ */
/* Jest hooks                                                         */
/* ------------------------------------------------------------------ */
let app;                                // Express instance

beforeEach(() => {
  jest.resetModules();
  tasksStore  = [];
  streakStore = { current: 0, best: 0, lastDate: null };

  /* save real fs fns so we can fall back for all other paths */
  const realRead   = fs.readFileSync.bind(fs);
  const realWrite  = fs.writeFileSync.bind(fs);
  const realExists = fs.existsSync.bind(fs);

  /* readFileSync stub – intercept only our two JSON “files” */
  jest
    .spyOn(fs, 'readFileSync')
    .mockImplementation((file, ...args) => {
      if (file === TASKS_FILE)  return JSON.stringify(tasksStore,  null, 2);
      if (file === STREAK_FILE) return JSON.stringify(streakStore, null, 2);
      return realRead(file, ...args);                // delegate anything else
    });

  /* writeFileSync stub */
  jest
    .spyOn(fs, 'writeFileSync')
    .mockImplementation((file, data, ...args) => {
      if (file === TASKS_FILE)       tasksStore  = JSON.parse(data);
      else if (file === STREAK_FILE) streakStore = JSON.parse(data);
      else return realWrite(file, data, ...args);    // delegate
    });

  /* existsSync stub – report “present” only for our fake files */
  jest
    .spyOn(fs, 'existsSync')
    .mockImplementation(file => {
      if (file === TASKS_FILE || file === STREAK_FILE) return true;
      return realExists(file);                       // delegate
    });

  /* Maths: make payment succeed unless a test overrides */
  jest.spyOn(Math, 'random').mockReturnValue(0.05);

  /* load the server last (with fs & Math already stubbed) */
  app = require(serverPath);
});

afterEach(() => {
  fs.readFileSync.mockRestore();
  fs.writeFileSync.mockRestore();
  fs.existsSync.mockRestore();
  Math.random.mockRestore();
});

/* ------------------------------------------------------------------ */
/* FR-1 : Goal creation & deposit rules                               */
/* ------------------------------------------------------------------ */
describe('Goal Creation (POST /api/tasks)', () => {
  it('creates an EASY goal (no deposit)', async () => {
    const payload = {
      title: 'Read 30 pages',
      deadline: '2025-05-03',
      description: 'Part of 52-book challenge',
      type: 'shortTermGoal',
      mode: 'easy'
    };

    const { status, body } = await request(app).post('/api/tasks').send(payload);

    expect(status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        deposit: null,
        depositPaid: false,
        completed: false,
        ...payload
      })
    );
    expect(tasksStore).toHaveLength(1);
  });

  it('rejects MEDIUM goal without deposit', async () => {
    const { status } = await request(app)
      .post('/api/tasks')
      .send({ title: 'Gym', deadline: '2025-05-03', mode: 'medium' });

    expect(status).toBe(400);
  });

  it('handles payment failure path for HARD mode', async () => {
    /* force payment failure */
    Math.random.mockReturnValueOnce(0.95);

    const res = await request(app).post('/api/tasks').send({
      title: 'Cold shower',
      deadline: '2025-05-03',
      mode: 'hard',
      deposit: 10
    });

    expect(res.status).toBe(402);
    expect(tasksStore).toHaveLength(0);   // nothing persisted
  });
});

/* ------------------------------------------------------------------ */
/* FR-2 : Completion & persistent streak                              */
/* ------------------------------------------------------------------ */
describe('Task completion & streak logic', () => {
  it('marks complete → streak.current = 1, best = 1', async () => {
    const { body: task } = await request(app).post('/api/tasks').send({
      title: 'Write tests', deadline: todayISO(1), mode: 'easy'
    });

    await request(app).patch(`/api/tasks/${task.id}`).send({ completed: true });

    const { body } = await request(app).get('/api/streak');
    expect(body).toEqual({ streak: 1, bestStreak: 1 });
  });

  it('second consecutive day bumps streak & best', async () => {
    streakStore = {
      current: 1,
      best: 1,
      lastDate: new Date(todayISO(-1)).toLocaleDateString(
        'en-US',
        { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }
      )
    };

    const { body: task } = await request(app)
      .post('/api/tasks')
      .send({ title: 'Day-2', deadline: todayISO(1), mode: 'easy' });

    await request(app).patch(`/api/tasks/${task.id}`).send({ completed: true });

    const { body } = await request(app).get('/api/streak');
    expect(body).toEqual({ streak: 2, bestStreak: 2 });
  });

  it('gap resets current streak but keeps best', async () => {
    streakStore = {
      current: 2,
      best: 5,
      lastDate: new Date(todayISO(-2)).toLocaleDateString(
        'en-US',
        { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }
      )
    };

    const { body } = await request(app).get('/api/streak');
    expect(body).toEqual({ streak: 0, bestStreak: 5 });
  });
});
