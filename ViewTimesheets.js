document.addEventListener('DOMContentLoaded', function () {
    fetch('https://localhost:7263/api/Timesheet', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('#timesheetsTable tbody');
        tableBody.innerHTML = '';

        const groupedTimesheets = data.reduce((acc, timesheet) => {
            const date = new Date(timesheet.date).toLocaleDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(timesheet);
            return acc;
        }, {});

        Object.keys(groupedTimesheets).forEach(date => {
            const dateTimesheets = groupedTimesheets[date];
            const firstTimesheet = dateTimesheets[0];

            tableBody.innerHTML += `
            <tr class="date-row">
                <td>${firstTimesheet.id}</td>
                <td>${date}</td>
                <td>${firstTimesheet.onLeave ? 'Yes' : 'No'}</td>
                <td colspan="6">${firstTimesheet.onLeave ? 'No Activities (On Leave)' : ''}</td>
            </tr>
            `;

            if (!firstTimesheet.onLeave) {
                dateTimesheets.forEach(timesheet => {
                    const activitiesHtml = timesheet.activities.map(activity => `
                        <tr class="activity-row">
                            <td colspan="3"></td> <!-- Empty cells for ID, Date, and On Leave -->
                            <td>${activity.project}</td>
                            <td>${activity.subProject}</td>
                            <td>${activity.batch}</td>
                            <td>${activity.hoursNeeded}</td>
                            <td>${activity.description}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="editActivity(${timesheet.id}, ${activity.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteActivity(${timesheet.id},${activity.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                    tableBody.innerHTML += activitiesHtml;
                });
            }
        });
    })
    .catch(error => console.error('Error fetching timesheets:', error));

    document.getElementById('logoutButton').addEventListener('click', function () {
        localStorage.removeItem('jwtToken');
        window.location.href = 'login.html';
    });
});

function showEditModal(timesheetId, activityId, activity) {
    document.getElementById('editProject').value = activity.project;
    document.getElementById('editSubProject').value = activity.subProject;
    document.getElementById('editBatch').value = activity.batch;
    document.getElementById('editHoursNeeded').value = activity.hoursNeeded;
    document.getElementById('editDescription').value = activity.description;

    const saveBtn = document.getElementById('saveEditBtn');
    saveBtn.setAttribute('data-timesheet-id', timesheetId);
    saveBtn.setAttribute('data-activity-id', activityId);

    new bootstrap.Modal(document.getElementById('editActivityModal')).show();
}
async function deleteActivity(timesheetId, activityId) {
    if (confirm('Are you sure you want to delete this activity?')) {
        try {
            const response = await fetch(`https://localhost:7263/api/Timesheet/${timesheetId}/${activityId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            });

            if (response.ok) {
                const activityRow = document.querySelector(`#timesheetsTable tbody tr[data-activity-id="${activityId}"]`);
                if (activityRow) {
                    activityRow.remove();
                }

                alert('Activity deleted successfully!');
            } else {
                const error = await response.json();
                throw new Error(`Failed to delete activity: ${error.message}`);
            }
        } catch (error) {
            console.error(error.message);
            alert('Failed to delete activity.');
        }
    }
}


async function saveActivityChanges() {
    const timesheetId = document.getElementById('saveEditBtn').getAttribute('data-timesheet-id');
    const activityId = document.getElementById('saveEditBtn').getAttribute('data-activity-id');

    const updatedActivity = {
        project: document.getElementById('editProject').value,
        subProject: document.getElementById('editSubProject').value,
        batch: document.getElementById('editBatch').value,
        hoursNeeded: document.getElementById('editHoursNeeded').value,
        description: document.getElementById('editDescription').value,
    };

    try {
        const response = await fetch(`https://localhost:7263/api/Timesheet/${timesheetId}/activities/${activityId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            },
            body: JSON.stringify(updatedActivity)
        });

        if (response.ok) {
            const row = document.querySelector(`#timesheetTable tbody tr[data-activity-id="${activityId}"]`);
            if (row) {
                row.querySelector('.project-cell').textContent = updatedActivity.project;
                row.querySelector('.subProject-cell').textContent = updatedActivity.subProject;
                row.querySelector('.batch-cell').textContent = updatedActivity.batch;
                row.querySelector('.hoursNeeded-cell').textContent = updatedActivity.hoursNeeded;
                row.querySelector('.description-cell').textContent = updatedActivity.description;
            }

            alert('Activity updated successfully!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editActivityModal'));
            modal.hide(); 
        } else {
            const error = await response.json();
            throw new Error(`Failed to update activity: ${error.message}`);
        }
    } catch (error) {
        console.error(error.message);
        alert('Failed to update activity.');
    }
}
