document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    window.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 400
    });

    // Add high-priority notes to calendar
    heap.heap.forEach(note => {
        if(note.priorityClass === 'high-priority') {
            window.calendar.addEvent({
                title: note.title,
                start: new Date(),
                description: note.content
            });
        }
    });

    window.calendar.render();
});
