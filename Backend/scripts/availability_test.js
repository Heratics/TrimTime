function timeToMinutes(t) {
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}
function minutesToTime(m) {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}
function rangesOverlap(aStart,aEnd,bStart,bEnd){
  return aStart < bEnd && aEnd > bStart;
}

function generateSlots({shopOpen, shopClose, schedules, breaks, appointments, duration}){
  const slots = [];
  const excluded = [];
  for(const sched of schedules){
    const segStart = Math.max(timeToMinutes(sched.start), timeToMinutes(shopOpen));
    const segEnd = Math.min(timeToMinutes(sched.end), timeToMinutes(shopClose));
    if(segStart >= segEnd){
      excluded.push({reason:'schedule outside shop hours or no overlap',segment:sched});
      continue;
    }
    let cursor = segStart;
    while(cursor + duration <= segEnd){
      const slotStart = cursor;
      const slotEnd = cursor + duration;
      const overlapsBreak = (breaks||[]).some(b=>rangesOverlap(slotStart,slotEnd,timeToMinutes(b.start),timeToMinutes(b.end)));
      const overlapsAppointment = (appointments||[]).some(a=>rangesOverlap(slotStart,slotEnd,timeToMinutes(a.start),timeToMinutes(a.end)));
      if(!overlapsBreak && !overlapsAppointment){
        slots.push(minutesToTime(slotStart));
      } else {
        const reasons = [];
        if(overlapsBreak) reasons.push('overlaps break');
        if(overlapsAppointment) reasons.push('overlaps appointment');
        excluded.push({slot:minutesToTime(slotStart), reason: reasons.join(' & ') });
      }
      cursor += duration;
    }
    // any remainder that can't fit duration is implicitly excluded
  }
  return {slots, excluded};
}

// Test 1: Normal day
const test1 = {
  shopOpen: '09:00',
  shopClose: '18:00',
  schedules: [ {start:'09:00', end:'17:00'} ],
  breaks: [ {start:'12:00', end:'13:00'} ],
  duration:45
};
console.log('Test 1: Standard day (no time off) - Monday-like');
console.log('Input:');
console.log(JSON.stringify(test1, null, 2));
const r1 = generateSlots(test1);
console.log('\nGenerated slots:');
console.log(JSON.stringify(r1.slots, null, 2));
console.log('\nExcluded reasons (sample):');
console.log(JSON.stringify(r1.excluded.slice(0,20), null, 2));

// Explain why specific slots excluded
console.log('\nExplanation:');
console.log('- No slots before 09:00 because segment starts at 09:00.');
console.log('- No slots after 17:00 because schedule ends at 17:00 and slot must fit fully within schedule.');
console.log('- Slots overlapping 12:00-13:00 removed.');
console.log('- Slot duration is 45 minutes; slots step by 45 minutes.');

// Test 2: Time off entire day
const test2 = JSON.parse(JSON.stringify(test1));
// Simulate time off by empty schedules
test2.schedules = []; // barber off
console.log('\n\nTest 2: Barber full-day time off');
console.log('Input: schedules empty (off)');
const r2 = generateSlots(test2);
console.log('\nGenerated slots:');
console.log(JSON.stringify(r2.slots, null, 2));
if(r2.slots.length===0){
  console.log('\nExpected: No available slots (barber off)');
} else {
  console.log('\nUnexpected slots found');
}

// For clarity, also show what slots would be if breaks removed (to demonstrate break effect)
const noBreaks = generateSlots({...test1, breaks:[]});
console.log('\n\nExtra: slots if no breaks present:');
console.log(JSON.stringify(noBreaks.slots, null, 2));

// Test 3: Existing appointment 09:45 - 10:30 should exclude 09:45 slot
const test3 = JSON.parse(JSON.stringify(test1));
test3.appointments = [ { start: '09:45', end: '10:30' } ];
console.log('\n\nTest 3: With existing appointment 09:45-10:30');
console.log('Input: appointment at 09:45-10:30');
const r3 = generateSlots(test3);
console.log('\nGenerated slots:');
console.log(JSON.stringify(r3.slots, null, 2));
console.log('\nExpected 09:45 excluded.');

process.exit(0);
