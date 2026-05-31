/**
 * Generate a realistic distribution of commit timestamps across a date range.
 *
 * Algorithm:
 * - Weekdays receive ~70% of commits, weekends ~30%
 * - Random daily commit count variation (0–8 per day)
 * - Some days intentionally left empty for realistic gaps
 * - Commits within a day are spread across 9 AM – 11 PM
 * - Occasional burst days with higher commit counts
 * - Results are sorted chronologically
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
  const days = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  if (days.length === 0) {
    return [];
  }

  // Assign raw weights to each day
  const weights = days.map((day) => {
    const dayOfWeek = day.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // ~20% chance of an empty day (realistic gaps)
    if (Math.random() < 0.2) {
      return 0;
    }

    // Base weight based on profile
    let weight = 0;
    if (profile === '9-to-5') {
      weight = isWeekend ? 0.05 : 0.95;
    } else if (profile === 'weekend-warrior') {
      weight = isWeekend ? 0.8 : 0.2;
    } else { // balanced or night-owl
      weight = isWeekend ? 0.3 : 0.7;
    }

    // ~10% chance of a burst day (2–3x normal)
    if (Math.random() < 0.1) {
      weight *= 2 + Math.random();
    }

    // Add random variation (±50%)
    weight *= 0.5 + Math.random();

    return weight;
  });

  // Normalize weights so they sum to totalCommits
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // If all weights are 0 (extremely unlikely), distribute evenly
  if (totalWeight === 0) {
    const perDay = Math.ceil(totalCommits / days.length);
    weights.fill(perDay);
  }

  // Distribute commits proportionally, capping at 8 per day
  let commitsPerDay = weights.map((w) => {
    const raw = Math.round((w / totalWeight) * totalCommits);
    return Math.min(raw, 8);
  });

  // Adjust to match totalCommits exactly
  let assigned = commitsPerDay.reduce((sum, c) => sum + c, 0);
  let diff = totalCommits - assigned;

  // Add or remove commits to match the target
  while (diff !== 0) {
    for (let i = 0; i < commitsPerDay.length && diff !== 0; i++) {
      if (diff > 0 && commitsPerDay[i] < 8) {
        commitsPerDay[i]++;
        diff--;
      } else if (diff < 0 && commitsPerDay[i] > 0) {
        commitsPerDay[i]--;
        diff++;
      }
    }
  }

  // Generate timestamps for each day's commits
  const timestamps = [];

  for (let i = 0; i < days.length; i++) {
    const count = commitsPerDay[i];
    if (count === 0) continue;

    const day = days[i];

    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Determine working hours based on profile
    let startHour = 9;
    let endHour = 23;

    if (profile === '9-to-5') {
      startHour = 9;
      endHour = 18;
    } else if (profile === 'weekend-warrior') {
      if (isWeekend) {
        startHour = 10;
        endHour = 23;
      } else {
        startHour = 19; // 7 PM
        endHour = 23;
      }
    } else if (profile === 'night-owl') {
      startHour = 22; // 10 PM
      endHour = 28; // 4 AM next day
    }

    const totalMinutes = (endHour - startHour) * 60;

    for (let j = 0; j < count; j++) {
      // Evenly space commits with some jitter
      const baseOffset = (totalMinutes / (count + 1)) * (j + 1);
      const jitter = (Math.random() - 0.5) * 30; // ±15 minutes of jitter
      const minuteOffset = Math.max(0, Math.min(totalMinutes, baseOffset + jitter));

      const commitDate = new Date(day);
      let hour = startHour + Math.floor(minuteOffset / 60);
      const minute = Math.floor(minuteOffset % 60);
      const second = Math.floor(Math.random() * 60);

      // Handle night-owl rollover past midnight
      if (hour >= 24) {
        hour -= 24;
        commitDate.setDate(commitDate.getDate() + 1);
      }

      commitDate.setHours(hour, minute, second, 0);
      timestamps.push(commitDate.toISOString());
    }
  }

  // Sort chronologically
  timestamps.sort((a, b) => new Date(a) - new Date(b));

  return timestamps;
}
