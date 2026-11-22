export const computeUpdatedStreak = (lastActiveDate, currentStreak = 1) => {
  if (!lastActiveDate) {
    return 1;
  }

  const now = new Date();
  const last = new Date(lastActiveDate);

  const nowDay = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const lastDay = Math.floor(last.getTime() / (1000 * 60 * 60 * 24));
  const diffDays = nowDay - lastDay;

  if (diffDays === 0) {
    // Already recorded activity today, maintain streak
    return Math.max(1, currentStreak);
  } else if (diffDays === 1) {
    // Consecutive activity on next day, increment streak
    return Math.max(1, currentStreak + 1);
  } else {
    // Streak broken after inactive day, reset to 1
    return 1;
  }
};
