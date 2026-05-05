
const doneStatuses = ['COMPLETED', 'DONE', 'CLEANING', 'FEEDBACK'];

function check(items, rawStatus) {
    const itemsStarted = items.some(i => i.status && i.status !== 'WAITING');
    
    const derivedStatusRaw = (rawStatus === 'NEW' || rawStatus === 'PREPARING') && itemsStarted
        ? 'IN_PROGRESS'
        : rawStatus === 'NEW' ? 'PREPARING' 
        : rawStatus === 'COMPLETED' ? 'CLEANING'
        : rawStatus;

    const allRated = items.length > 0 && items.every(i => i.itemRating !== null && i.itemRating !== undefined);
    const state = (derivedStatusRaw === 'DONE' && !allRated) ? 'FEEDBACK' : derivedStatusRaw;

    console.log(`Input: rawStatus=${rawStatus}, items=${JSON.stringify(items.map(i=>i.status))}`);
    console.log(`Derived State: ${state}`);

    const allCompleted = items.length > 0 && items.every(i =>
        ['COMPLETED', 'DONE', 'CLEANING', 'FEEDBACK'].includes(i.status || '')
    );
    console.log(`allCompleted: ${allCompleted}`);

    const isShowServiceList = (state === 'IN_PROGRESS' || state === 'COMPLETED' || state === 'CLEANING' || state === 'FEEDBACK');
    console.log(`isShowServiceList: ${isShowServiceList}`);
    
    if (isShowServiceList && allCompleted) {
        console.log("Action: Transition to CHECK_BELONGINGS");
    } else if (isShowServiceList) {
        console.log("Action: Show TIMER (00:00 if timer finished)");
    }
}

console.log("--- Scenario 1: KTV finished, backend set booking to CLEANING and items to CLEANING ---");
check([{status: 'CLEANING', itemRating: null}], 'CLEANING');

console.log("\n--- Scenario 2: Legacy - backend set booking to COMPLETED and items to COMPLETED ---");
check([{status: 'COMPLETED', itemRating: null}], 'COMPLETED');

console.log("\n--- Scenario 3: Mixed - booking CLEANING but one item stuck IN_PROGRESS ---");
check([{status: 'CLEANING', itemRating: null}, {status: 'IN_PROGRESS', itemRating: null}], 'CLEANING');

console.log("\n--- Scenario 4: User finished rating but booking still CLEANING (realtime lag) ---");
check([{status: 'DONE', itemRating: 5}], 'CLEANING');

console.log("\n--- Scenario 5: User finished rating, booking is DONE ---");
check([{status: 'DONE', itemRating: 5}], 'DONE');

console.log("\n--- Scenario 6: Booking is FEEDBACK (from Lễ tân) ---");
check([{status: 'CLEANING', itemRating: null}], 'FEEDBACK');
