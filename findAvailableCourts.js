const fs = require('fs');
const path = require('path');

// 1. Read schedule
const scheduleCsv = fs.readFileSync(path.join(__dirname, 'schedule.csv'), 'utf8');
const scheduleLines = scheduleCsv
  .trim()
  .split('\n')
  .filter(line => line.trim() && !line.toLowerCase().includes('time'));

// 2. Extract & clean booked grounds
const bookedGrounds = new Set(
  scheduleLines
    .map(line => {
      const parts = line.split(',', 2);
      if (parts.length < 2) return null;
      const info = parts[1].trim();
      const atIdx = info.lastIndexOf(' at ');
      if (atIdx === -1) return null;

      // e.g. "Maple Park"
      return info
        .slice(atIdx + 4)
        .trim()
        // strip quotes if any
        .replace(/^"+|"+$/g, '');
    })
    .filter(Boolean)
);

// 3. Read & normalize all grounds (drop the “ (alias)” part)
const groundsCsv = fs.readFileSync(path.join(__dirname, 'grounds.csv'), 'utf8');
const allGrounds = groundsCsv
  .trim()
  .split('\n')
  .map(line => {
    // 1) trim whitespace and stray quotes
    let name = line.trim().replace(/^"+|"+$/g, '');
    // 2) if there’s a parenthetical alias, drop it
    const idx = name.indexOf(' (');
    if (idx > -1) name = name.slice(0, idx).trim();
    return name;
  })
  // skip any header or blank lines
  .filter(line => line && !line.toLowerCase().includes('ground'));

// 4. Find which grounds aren’t booked
const availableGrounds = allGrounds.filter(g => !bookedGrounds.has(g));

// 5. Report
if (availableGrounds.length) {
  console.log('Available grounds for the day:');
  availableGrounds.forEach(g => console.log('–', g));
} else {
  console.log('No grounds are available; all are booked.');
}
