document.addEventListener("DOMContentLoaded", function () {
    const activitySection = document.getElementById('activitySection');
    const addActivityButton = document.getElementById('addActivity');
    const previewButton = document.getElementById('previewButton');
    const previewContent = document.getElementById('previewContent');
    const timesheetForm = document.getElementById('timesheetForm');
    const submitButton = document.getElementById('submit');

    fetchDropdownData();

    addActivityButton.addEventListener('click', function () {
        let newActivityRow = document.createElement('div');
        newActivityRow.classList.add('activity-row', 'mb-3');
        
        newActivityRow.innerHTML = `
            <div class="row">
                <div class="col">
                    <label for="project">Project</label>
                    <select class="form-control projectDropdown">
                        <option value="" disabled selected>Select Project</option>
                    </select>
                </div>
                <div class="col">
                    <label for="subProject">Sub-Project</label>
                    <select class="form-control subProjectDropdown">
                        <option value="" disabled selected>Select Sub-Project</option>
                    </select>
                </div>
                <div class="col">
                    <label for="batch">Batch</label>
                    <select class="form-control batchDropdown">
                        <option value="" disabled selected>Select Batch</option>
                    </select>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col">
                    <label for="hoursNeeded">Hours Needed</label>
                    <input type="time" class="form-control" required>
                </div>
                <div class="col">
                    <label for="activityDescription">Activity Description</label>
                    <textarea class="form-control" rows="2"></textarea>
                </div>
            </div>
            <button type="button" class="btn btn-danger mt-3 removeActivity">Delete Activity</button>
        `;

        activitySection.appendChild(newActivityRow);

        fetchDropdownData(newActivityRow);
    });

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('removeActivity')) {
            event.target.closest('.activity-row').remove();
        }
    });

    previewButton.addEventListener('click', function () {
        let date = document.getElementById('date').value;
        let onLeave = document.getElementById('onLeave').value;
        let activities = document.querySelectorAll('.activity-row');
        let previewHtml = `<p><strong>Date:</strong> ${date}</p><p><strong>On Leave:</strong> ${onLeave}</p><ul>`;

        activities.forEach(function (activity, index) {
            let project = activity.querySelector('.projectDropdown').value;
            let subProject = activity.querySelector('.subProjectDropdown').value;
            let batch = activity.querySelector('.batchDropdown').value;
            let hoursNeeded = activity.querySelector('input[type="time"]').value;
            let activityDescription = activity.querySelector('textarea').value;

            previewHtml += `<li><strong>Activity ${index + 1}:</strong><br>Project: ${project}, Sub-Project: ${subProject}, Batch: ${batch}, Hours Needed: ${hoursNeeded}, Description: ${activityDescription}</li>`;
        });

        previewHtml += '</ul>';
        previewContent.innerHTML = previewHtml;
    });

    function fetchDropdownData(parent = document) {
        const projectDropdowns = parent.querySelectorAll('.projectDropdown');
        const subProjectDropdowns = parent.querySelectorAll('.subProjectDropdown');
        const batchDropdowns = parent.querySelectorAll('.batchDropdown');

        fetch('https://localhost:7263/api/Project')
            .then(response => response.json())
            .then(data => {
                projectDropdowns.forEach(dropdown => populateDropdown(dropdown, data));
            })
            .catch(error => console.error('Error fetching projects:', error));

        fetch('https://localhost:7263/api/SubProject')
            .then(response => response.json())
            .then(data => {
                subProjectDropdowns.forEach(dropdown => populateDropdown(dropdown, data));
            })
            .catch(error => console.error('Error fetching subprojects:', error));

        fetch('https://localhost:7263/api/Batch')
            .then(response => response.json())
            .then(data => {
                batchDropdowns.forEach(dropdown => populateDropdown(dropdown, data));
            })
            .catch(error => console.error('Error fetching batches:', error));
    }

    function populateDropdown(dropdown, data) {
        dropdown.innerHTML = '<option value="" disabled selected>Select</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;  
            option.textContent = item.name;  
            dropdown.appendChild(option);
        });
    }


    submitButton.addEventListener('click', function () {
        timesheetForm.dispatchEvent(new Event('submit'));
    });
    
    timesheetForm.addEventListener('submit', function (event) {
        event.preventDefault();
    
        let date = document.getElementById('date').value;
        let onLeave = document.getElementById('onLeave').value === 'Yes'; 
        let activities = document.querySelectorAll('.activity-row');
        let timesheetData = {
            date: date,
            onLeave: onLeave,
            activities: Array.from(activities).map(activity => {
                return {
                    project: activity.querySelector('.projectDropdown').value,
                    subProject: activity.querySelector('.subProjectDropdown').value,
                    batch: activity.querySelector('.batchDropdown').value,
                    hoursNeeded: activity.querySelector('input[type="time"]').value,
                    description: activity.querySelector('textarea').value.trim() 
                };
            }).filter(activity => activity.description) 
        };
    
        console.log('Timesheet Data:', timesheetData);
    
        fetch('https://localhost:7263/api/Timesheet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            },
            body: JSON.stringify(timesheetData),
        })
        .then(response => {
            if (response.ok) {
                return response.text().then(text => {
                    if (text) {
                        return JSON.parse(text);
                    }
                    return {};
                });
            } else {
                return response.json().then(error => {
                    console.error('Response Error:', error);
                    throw new Error(error.title || 'Unknown error');
                });
            }
        })
        .then(data => {
            alert('Timesheet submitted successfully!');
            timesheetForm.reset();
            activitySection.innerHTML = ''; 
            location.reload(); 
        })
        .catch(error => console.error('Error submitting timesheet:', error));
    });
});
