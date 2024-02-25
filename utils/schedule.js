const moment = require('moment');
const log = require('../utils/log');
const logger = log.getLogger('workouts.log');

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const levelsWorkoutOrder = new Map();
levelsWorkoutOrder.set('Beginner', ['Cardio', 'Arms', 'Chest', 'Legs', 'Cardio']);
levelsWorkoutOrder.set('Intermediate', ['Chest', 'Arms', 'Back', 'Legs', 'Cardio']);
levelsWorkoutOrder.set('Advanced', ['Arms', 'Chest', 'Legs', 'Back', 'Abs']);

function getWorkoutForDay(day, level) {
    logger.info(levelsWorkoutOrder.get(level));
    const index = day % levelsWorkoutOrder.get(level).length;
    return levelsWorkoutOrder.get(level)[index];
};

function getWorkoutEvents(level) {
    const startDate = moment().startOf('day');
    const events = [];

    for (let i = 0; i < 30; i++) {
        const date = startDate.clone().add(i, 'days');
        const dayOfWeek = date.day();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
        }
        const category = getWorkoutForDay(i + 1, level);
        const title = `${level} ${category} workout`;
        events.push({ title, date: date.format('YYYY-MM-DD') });
    }
    return events;
};

module.exports = { levels, levelsWorkoutOrder, getWorkoutForDay, getWorkoutEvents }