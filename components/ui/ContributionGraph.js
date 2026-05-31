'use client';

import { useMemo, useState } from 'react';
import styles from './ContributionGraph.module.css';

/**
 * ContributionGraph — GitHub-style contribution heatmap.
 *
 * @param {object}  props
 * @param {Array<{date: string, count: number}>} [props.data] — Array of { date: 'YYYY-MM-DD', count }.
 * @param {boolean} [props.animated=false]   — Enable staggered cell fill animation.
 * @param {string}  [props.className]        — Additional class names.
 * @param {string}  [props.id]               — Optional DOM id.
 */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Map a contribution count to a color level (0–4).
 */
function getLevel(count) {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Format a date string into a human-readable label.
 */
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Build the 52×7 grid data from a sparse data array.
 * Returns { weeks, monthLabels, totalContributions }.
 */
function buildGrid(data) {
  // Build a lookup map from date string → count
  const dataMap = new Map();
  if (data) {
    for (const entry of data) {
      dataMap.set(entry.date, entry.count);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We want 52 full weeks ending on today's weekday position
  const dayOfWeek = today.getDay(); // 0=Sun
  // End date is today, start date is ~364 days back adjusted to start on Sunday
  const endDate = new Date(today);
  const totalDays = 52 * 7 + dayOfWeek + 1; // include today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  const weeks = [];
  let currentWeek = [];
  let totalContributions = 0;

  // Track months for labeling
  const monthPositions = [];
  let lastMonth = -1;

  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const dateStr =
      cursor.getFullYear() +
      '-' +
      String(cursor.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(cursor.getDate()).padStart(2, '0');

    const count = dataMap.get(dateStr) || 0;
    totalContributions += count;

    const month = cursor.getMonth();
    if (month !== lastMonth) {
      monthPositions.push({
        weekIndex: weeks.length,
        label: MONTHS[month],
      });
      lastMonth = month;
    }

    currentWeek.push({
      date: dateStr,
      count,
      level: getLevel(count),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // Push any remaining partial week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return { weeks, monthPositions, totalContributions };
}

export default function ContributionGraph({
  data,
  animated = false,
  className = '',
  id,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { weeks, monthPositions, totalContributions } = useMemo(
    () => buildGrid(data),
    [data],
  );

  // Calculate month label positions with proper widths
  const monthHeaders = useMemo(() => {
    const headers = [];
    for (let i = 0; i < monthPositions.length; i++) {
      const start = monthPositions[i].weekIndex;
      const end =
        i + 1 < monthPositions.length
          ? monthPositions[i + 1].weekIndex
          : weeks.length;
      const span = end - start;
      // Only show label if span is >= 2 columns
      if (span >= 2) {
        headers.push({
          label: monthPositions[i].label,
          width: span * 14, // 11px cell + 3px gap
        });
      } else {
        headers.push({
          label: '',
          width: span * 14,
        });
      }
    }
    return headers;
  }, [monthPositions, weeks.length]);

  // Day labels — only show Mon, Wed, Fri
  const dayLabelsRendered = DAY_LABELS.map((label, i) => {
    const show = i === 1 || i === 3 || i === 5; // Mon, Wed, Fri
    return (
      <div
        key={i}
        className={`${styles.dayLabel} ${!show ? styles.dayLabelHidden : ''}`}
      >
        {show ? label : ''}
      </div>
    );
  });

  let cellIndex = 0;

  return (
    <div
      id={id || 'contribution-graph'}
      className={`${styles.wrapper} ${className}`}
      aria-label={`Contribution graph: ${totalContributions} contributions in the last year`}
    >
      <div className={styles.graph}>
        {/* Month labels row */}
        <div className={styles.monthsRow}>
          {monthHeaders.map((m, i) => (
            <span
              key={i}
              className={styles.monthLabel}
              style={{ width: m.width }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid + day labels */}
        <div className={styles.gridContainer}>
          <div className={styles.dayLabels}>{dayLabelsRendered}</div>

          <div className={styles.grid}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className={styles.column}>
                {week.map((cell, dayIdx) => {
                  const idx = cellIndex++;
                  const levelClass = styles[`level${cell.level}`];
                  const animStyle =
                    animated
                      ? { animationDelay: `${idx * 3}ms` }
                      : undefined;

                  return (
                    <div
                      key={dayIdx}
                      className={`${styles.cell} ${levelClass} ${animated ? styles.animated : ''}`}
                      style={animStyle}
                      data-date={cell.date}
                      data-count={cell.count}
                      data-level={cell.level}
                      onMouseEnter={() => setHoveredCell(`${weekIdx}-${dayIdx}`)}
                      onMouseLeave={() => setHoveredCell(null)}
                      aria-label={`${formatDate(cell.date)}: ${cell.count} contribution${cell.count !== 1 ? 's' : ''}`}
                    >
                      {hoveredCell === `${weekIdx}-${dayIdx}` && (
                        <div className={styles.tooltip}>
                          <span className={styles.tooltipCount}>
                            {cell.count === 0
                              ? 'No contributions'
                              : `${cell.count} contribution${cell.count !== 1 ? 's' : ''}`}
                          </span>
                          <br />
                          {formatDate(cell.date)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Legend */}
        <div className={styles.summary}>
          <span className={styles.totalCount}>
            <span className={styles.totalCountValue}>
              {totalContributions.toLocaleString()}
            </span>{' '}
            contributions in the last year
          </span>

          <div className={styles.legend}>
            <span className={styles.legendLabel}>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`${styles.legendCell} ${styles[`level${level}`]}`}
              />
            ))}
            <span className={styles.legendLabel}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
