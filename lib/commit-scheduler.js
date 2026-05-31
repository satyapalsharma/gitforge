/**
 * Generate a realistic distribution of commit timestamps across a date range.
 *
 * Strategy:
 * - Pick a few random "active days" (work sessions) from the date range
 * - Cluster multiple commits on active days (1-4 commits per session)
 * - Add random gaps between active days so it looks organic
 * - Respect the chosen coding style profile for day-of-week and time-of-day
 * - Add realistic jitter to timestamps (not exactly on the hour)
 *
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @param {number} totalCommits - Total number of commits to distribute
 * @param {string} profile - The scheduling profile ('balanced', '9-to-5', 'weekend-warrior', 'night-owl')
 * @returns {string[]} Array of ISO 8601 timestamps sorted chronologically
 */
export function scheduleCommits(startDate, endDate, totalCommits, profile = 'balanced') {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error('startDate must be before endDate');
  }
  if (totalCommits <= 0) {
    return [];
  }

  // Build a list of all days in the range
  const allDays = [];
  const current = new Date(start);
  while (current <= end) {
    allDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  if (allDays.length === 0) {
    return [];
  }

  // Score each day based on profile (higher = more likely to be picked)
  const dayScores = allDays.map((day) => {
    const dow = day.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;

    switch (profile) {
      case '9-to-5':
        return isWeekend ? 0.02 : 1.0;
      case 'weekend-warrior':
        return isWeekend ? 0.9 : 0.15;
      case 'night-owl':
        // Night owls code any day, slight weekday preference
        return isWeekend ? 0.5 : 0.7;
      default: // balanced
        return isWeekend ? 0.25 : 0.75;
    }
  });

  // Pick "active days" — we want fewer active days with more commits each
  // Target: roughly totalCommits / 2.5 active days (avg 2-3 commits per day)
  const targetActiveDays = Math.max(2, Math.ceil(totalCommits / (1.5 + Math.random() * 2)));

  // Weighted random selection of active days (no replacement)
  const activeDayIndices = weightedSample(dayScores, Math.min(targetActiveDays, allDays.length));

  // Distribute commits across active days with natural clustering
  const commitsPerActiveDay = distributeCommitsNaturally(totalCommits, activeDayIndices.length);

  // Generate timestamps
  const timestamps = [];

  for (let i = 0; i < activeDayIndices.length; i++) {
    const dayIndex = activeDayIndices[i];
    const day = allDays[dayIndex];
    const count = commitsPerActiveDay[i];
    if (count === 0) continue;

    const dow = day.getDay();
    const isWeekend = dow === 0 || dow === 6;

    // Get the time window based on profile
    const { startHour, endHour } = getTimeWindow(profile, isWeekend);

    // Generate commit times within the window
    const sessionTimes = generateSessionTimes(count, startHour, endHour);

    for (const { hour, minute } of sessionTimes) {
      const commitDate = new Date(day);
      let h = hour;

      // Handle night-owl rollover past midnight
      if (h >= 24) {
        h -= 24;
        commitDate.setDate(commitDate.getDate() + 1);
      }

      const second = Math.floor(Math.random() * 60);
      commitDate.setHours(h, minute, second, 0);
      timestamps.push(commitDate.toISOString());
    }
  }

  // Sort chronologically
  timestamps.sort((a, b) => new Date(a) - new Date(b));

  return timestamps;
}

/**
 * Weighted random sampling without replacement.
 * Returns indices of selected items.
 */
function weightedSample(weights, count) {
  const indices = [];
  const remaining = weights.map((w, i) => ({ weight: w, index: i }));

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);

    if (totalWeight === 0) {
      // If all remaining weights are 0, pick randomly
      const pick = Math.floor(Math.random() * remaining.length);
      indices.push(remaining[pick].index);
      remaining.splice(pick, 1);
      continue;
    }

    let r = Math.random() * totalWeight;
    let picked = -1;
    for (let j = 0; j < remaining.length; j++) {
      r -= remaining[j].weight;
      if (r <= 0) {
        picked = j;
        break;
      }
    }
    if (picked === -1) picked = remaining.length - 1;

    indices.push(remaining[picked].index);
    remaining.splice(picked, 1);
  }

  return indices.sort((a, b) => a - b);
}

/**
 * Distribute commits across active days naturally.
 * Some days get 1 commit, others get 2-4 (burst days).
 */
function distributeCommitsNaturally(totalCommits, activeDays) {
  const distribution = new Array(activeDays).fill(0);
  let remaining = totalCommits;

  // First pass: give each day at least 1 commit
  for (let i = 0; i < activeDays && remaining > 0; i++) {
    distribution[i] = 1;
    remaining--;
  }

  // Second pass: randomly add extras to simulate bursts
  while (remaining > 0) {
    const dayIndex = Math.floor(Math.random() * activeDays);
    // Cap at 5 per day to stay realistic
    if (distribution[dayIndex] < 5) {
      distribution[dayIndex]++;
      remaining--;
    }
  }

  return distribution;
}

/**
 * Get time window based on profile and day type.
 */
function getTimeWindow(profile, isWeekend) {
  switch (profile) {
    case '9-to-5':
      return { startHour: 9, endHour: 17 };
    case 'weekend-warrior':
      if (isWeekend) {
        return { startHour: 10, endHour: 22 };
      }
      return { startHour: 19, endHour: 23 };
    case 'night-owl':
      return { startHour: 21, endHour: 28 }; // 9 PM to 4 AM
    default: // balanced
      if (isWeekend) {
        return { startHour: 11, endHour: 20 };
      }
      return { startHour: 9, endHour: 22 };
  }
}

/**
 * Generate realistic commit times within a session window.
 * Simulates a developer working in bursts — commits are close together
 * (e.g. 15-60 minutes apart) rather than evenly spread.
 */
function generateSessionTimes(count, startHour, endHour) {
  const times = [];
  const totalMinutes = (endHour - startHour) * 60;

  // Pick a random session start within the window
  const sessionStart = Math.floor(Math.random() * Math.max(1, totalMinutes - count * 30));

  let currentOffset = sessionStart;

  for (let i = 0; i < count; i++) {
    const hour = startHour + Math.floor(currentOffset / 60);
    const minute = Math.floor(currentOffset % 60);
    times.push({ hour, minute });

    // Next commit is 8-75 minutes later (realistic coding gap)
    const gap = 8 + Math.floor(Math.random() * 67);
    currentOffset += gap;

    // Don't exceed the window
    if (currentOffset >= totalMinutes) {
      currentOffset = totalMinutes - Math.floor(Math.random() * 30) - 1;
    }
  }

  return times;
}
