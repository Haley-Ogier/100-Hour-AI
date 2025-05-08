import { renderHook, act } from '@testing-library/react';
import { StreakProvider, useStreak } from '../Frontend/src/context/StreakContext';

test('increments streak in context', () => {
  const wrapper = ({ children }) => <StreakProvider>{children}</StreakProvider>;
  const { result } = renderHook(() => useStreak(), { wrapper });

  act(()=> result.current.setStreak(5));
  expect(result.current.streak).toBe(5);
});
