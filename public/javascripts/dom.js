document.getElementById('beginner-start').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('#', {
        method: 'POST',
        body: JSON.stringify({ level: 'Beginner' })
    });
});

document.getElementById('intermediate-start').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('#', {
        method: 'POST',
        body: JSON.stringify({ level: 'Intermediate' })
    });
});

document.getElementById('advanced-start').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('#', {
        method: 'POST',
        body: JSON.stringify({ level: 'Advanced' })
    });
});

document.getElementById('workout-start').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('#', {
        method: 'GET'
    });
});