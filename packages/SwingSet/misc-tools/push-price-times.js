// @ts-nocheck
import sqlite3 from 'better-sqlite3';

const db = sqlite3('mezzanine.sqlite');
let one = `SELECT DISTINCT blockNum,runNum FROM delivery WHERE kd_json LIKE '%PushPrice%'`;
// one = one + ' LIMIT 10';
one = db.prepare(one);
const two = db.prepare(
  `SELECT * FROM run WHERE blockNum=@blockNum AND runNum=@runNum`,
);
const times = [];
for (const row of one.iterate()) {
  const brow = two.get({ blockNum: row.blockNum, runNum: row.runNum });
  // console.log(brow.blockNum, brow.runNum, brow.time, brow.usedBeans);
  times.push(brow.time);
}

times.sort();

const sum = times.reduce((a, b) => a + b);
console.log(`count:`, times.length);
console.log(`avg  :`, sum / times.length);
console.log(`med  :`, times[Math.floor(0.5 * times.length)]);
console.log(`90p  :`, times[Math.floor(0.9 * times.length)]);
console.log(`95p  :`, times[Math.floor(0.95 * times.length)]);
console.log(`99p  :`, times[Math.floor(0.9 * times.length)]);
