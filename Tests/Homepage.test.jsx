import { render, screen } from '@testing-library/react';
import HomePage from '../Frontend/src/pages/Homepage';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';

const today = new Date().toISOString().slice(0,10);

const server = setupServer(
  rest.get('http://localhost:4000/api/tasks', (_, res, ctx) =>
    res(ctx.json([
      { id:1,title:'Past',deadline:'2000-01-01',description:'',type:'task',completed:false },
      { id:2,title:'Future',deadline:'3025-01-01',description:'',type:'task',completed:false }
    ]))
  ),
  rest.get('http://localhost:4000/api/streak', (_, res, ctx) =>
    res(ctx.json({ streak: 0, bestStreak: 0 }))
  )
);

beforeAll(()=>server.listen());
afterAll(()=>server.close());

test('shows red highlight for overdue tasks', async () => {
  render(<BrowserRouter><HomePage /></BrowserRouter>);

  const overdueCard = await screen.findByText('Past');
  expect(overdueCard.closest('.timeline-item')).toHaveClass('past-due');

  const futureCard = screen.getByText('Future');
  expect(futureCard.closest('.timeline-item')).not.toHaveClass('past-due');
});
