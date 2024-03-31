let currentUserBearerToken = '';
let currentEventId =  null;
const eventsRequest = await fetch('api/events/popular-events', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
});

const eventsArray = await eventsRequest.json();

const compiledTemplateLogin = await compileTemplate('login');
const compiledTemplateMain = await compileTemplate('main-page');
const compiledTemplateCreateUser = await compileTemplate('create-user');
const compiledTemplateCreateGroup = await compileTemplate('create-group');
const compiledTemplateDeleteGroup = await compileTemplate('delete-group');
const compiledTemplateEditGroup = await compileTemplate('edit-group');
const compiledTemplateGroupList = await compileTemplate('group-list');
const compiledTemplateEventInfo = await compileTemplate('event-info');


async function compileTemplate(templateName) {
    // let template = await fetch(`../views/${templateName}.hbs`);
    let template = await fetch(`views/${templateName}.hbs`);
    let text = await template.text();
    return Handlebars.compile(text);
}

async function renderTemplate(compiledTemplate, data) {
    $('#main-container').html(compiledTemplate(data));
}

function toggleSearchGroup() {
    $('#search-group').toggle();
}

function toggleGroupDetails() {
    $('#group-details').toggle();
}

$(document).ready(async function () {
    await renderTemplate(compiledTemplateLogin);

    // Login page create user button
    $(document).on('click', '#create-user-button', async function (event) {
        event.preventDefault();
        await renderTemplate(compiledTemplateCreateUser);
    });

    // Login page submit credentials for login button
    $(document).on('click', '#login-button', async function (event) {
        event.preventDefault();

        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const req = await fetch('api/users/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (req.status === 201) {
                const bearerTokenReq = await fetch(`api/users/token?username=${encodeURIComponent(username)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const tokenResponse = await bearerTokenReq.json();
                currentUserBearerToken = tokenResponse.token;

                const templateData = {
                    events: eventsArray
                };

                await renderTemplate(compiledTemplateMain, templateData);

            } else {
                await renderTemplate(compiledTemplateLogin);
            }

        } catch (error) {
            console.error(error);
        }

    });

    // Function to display the event info when clicking on the event info button
    $(document).on('click', '#event-info-button', async function (){
        const eventId = $(this).data('event-id');
        try {
            const req = await fetch(`api/event?eventId=${eventId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const eventInfo = await req.json();
            const presentedInfo = {
                name: eventInfo.name,
                salesStart: eventInfo.sales.public.startDateTime,
                salesEnd: eventInfo.sales.public.endDateTime ,
                eventStart: eventInfo.dates.start.localDate,
                segment: eventInfo.classifications[0].segment.name,
                genre: eventInfo.classifications[0].genre.name,
                subGenre: eventInfo.classifications[0].subGenre.name,
                image: eventInfo.images[0].url,
            }

            await renderTemplate(compiledTemplateEventInfo, presentedInfo);
        }
        catch (error) {
            console.error(error);
        }
    });

    // Create user page submit credentials for user creation button
    $(document).on('click', '#submit-create-user', async function (event) {
        event.preventDefault()

        const form = document.getElementById('create-user-form');
        const formData = new FormData(form);
        const username = formData.get('new-user-username');
        const password = formData.get('new-user-password');

        try {
            const req = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            if (req.status === 201) {
                await renderTemplate(compiledTemplateLogin);
            } else {
                await renderTemplate(compiledTemplateCreateUser);
            }
        } catch (error) {
            console.error(error);
        }

    });

    // Function to create a group when clicking on the create group button
    $(document).on('click', '#submit-create-group', async function (event) {
        event.preventDefault();

        const form = document.getElementById('create-group-form');
        const formData = new FormData(form);
        const groupName = formData.get('new-group-name');
        const groupDescription = formData.get('new-group-description');

        try {
            const req = await fetch('/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                },
                body: JSON.stringify({
                    name: groupName,
                    description: groupDescription
                })
            });
            if (req.status === 201) {
                const templateData = {
                    events: eventsArray
                };
                await renderTemplate(compiledTemplateMain, templateData);
            }
            else {
                await renderTemplate(compiledTemplateCreateGroup);
            }
        }
        catch(error) {
            console.error(error);
        }
    });

    // Function to delete a group when clicking on the delete group button
    $(document).on('click', '#submit-delete-group', async function (event) {
        event.preventDefault();

        const form = document.getElementById('delete-group-form');
        const formData = new FormData(form);
        const groupName = formData.get('delete-group-name');

        try {
            const req = await fetch(`/api/groups/delete?name=${groupName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                }
            })
            if (req.status === 201) {
                const templateData = {
                    events: eventsArray
                };
                await renderTemplate(compiledTemplateMain, templateData);
            }
            else {
                await renderTemplate(compiledTemplateDeleteGroup);
            }
        }
        catch(error) {
            console.error(error);
        }
    });

    // Function to edit a group when clicking on the edit group button
    $(document).on('click', '#submit-edit-group', async function (event) {
        event.preventDefault();

        const form = document.getElementById('edit-group-form');
        const formData = new FormData(form);
        const groupName = formData.get('edit-group-name');
        const newName = formData.get('edit-new-group-name');
        const newDescription = formData.get('edit-new-group-description');

        try {
            const req = await fetch(`/api/groups/edit?name=${groupName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                },
                body: JSON.stringify({
                    name: newName,
                    description: newDescription
                })
            });
            if (req.status === 201) {
                const templateData = {
                    events: eventsArray
                };
                await renderTemplate(compiledTemplateMain, templateData);
            }
            else {
                await renderTemplate(compiledTemplateEditGroup);
            }
        }
        catch(error) {
            console.error(error);
        }
    });

    // Function to return to login page when click return to login button
    $(document).on('click', '#reset-return-to-login', async function (event) {
        event.preventDefault();
        await renderTemplate(compiledTemplateLogin);
    });

    // Function to display the search event bar when clicking on the search event button
    $(document).on('click', '#search-event-button', async function(event) {
        event.preventDefault();
        try {
            const form = document.getElementById('search-event-form')
            const formData = new FormData(form);
            const eventName = formData.get('search-event-name');

            const req = await fetch(`/api/events/search?keyword=${encodeURIComponent(eventName.toString())}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const searchResult = await req.json();
            const templateData = {
                events: searchResult
            }
            await renderTemplate(compiledTemplateMain, templateData);
        }
        catch (error) {
            console.error(error);
        }
    });

    // Function to return to login page when click on the logout button
    $(document).on('click', '#logout-button', async function (event) {
        event.preventDefault();

        try {
            currentUserBearerToken = '';
            const req = await fetch('/api/users/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            // Render the login page
            await renderTemplate(compiledTemplateLogin);
        }
        catch (error) {
            console.error(error);
        }
    });

    // Function to display the searched group when clicking on the search group button
    $(document).on('click','#search-group-button', async function (event) {
        event.preventDefault();
        try {
            const form = document.getElementById('search-group-form')
            const formData = new FormData(form);
            const groupName = formData.get('search-group-name');

            const req = await fetch(`/api/groups/search?keyword=${encodeURIComponent(groupName.toString())}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                }
            });

            const searchResult = await req.json();

            const templateData = {
                events: searchResult
            };

            await renderTemplate(compiledTemplateMain, templateData);
        }
        catch (error) {
            console.error(error);
        }
    });

    // Function to display the available groups when focus on the search bar
    $(document).on('focus', '#search-groups', async function (event) {
        event.preventDefault();
        try {
            const req = await fetch('/api/groups/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                }
            });

            if (!req.ok) {
                throw new Error(`Error fetching available groups: ${req.statusText}`);
            }

            const searchResult = await req.json();


            // Assuming you have a container element to display the groups
            const container = $('#available-groups');

            // Clear existing content
            container.empty();

            // Iterate through the groups and append them to the container
            searchResult.forEach(group => {
                const groupItem = $('<div class="group-item"></div>');
                groupItem.text(group.name);
                container.append(groupItem);
            });

            // Show the available groups container
            container.show();
        } catch (error) {
            console.error(error);
        }
    });

    // Function to display the group list page when click on the group list button
    $(document).on('click','#list-group-button', async function (event) {
        event.preventDefault();

        try {
            const req = await fetch('/api/groups/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                }
            });

            const searchResult = await req.json();

            const templateData =  {
                groups: searchResult
            }

            await renderTemplate(compiledTemplateGroupList, templateData);
        }catch (error) {
            console.error(error);
        }
    });

    $(document).on('click', '.view-details-button', function () {
        const groupName = $(this).data('group-name');
        $('#group-details-' + groupName).toggle();
    });

    // Function to display the create group page when click on the create group button
    $(document).on('click', '#create-group-button', async function () {
        await renderTemplate(compiledTemplateCreateGroup);
    });

    // Function to display the delete group page when click on the delete group button
    $(document).on('click', '#delete-group-button', async function () {
        await renderTemplate(compiledTemplateDeleteGroup);
    });

    // Function to display the edit group page when click on the edit group button
    $(document).on('click', '#edit-groups-button', async function () {
        await renderTemplate(compiledTemplateEditGroup);
    });

    // Function to return to the main page when clicking on a specific button
    $(document).on('click', '#create-group-to-main, #delete-group-to-main, #group-details-to-main, #edit-group-to-main, #event-info-to-main' , async function () {
        const templateData = {
            events: eventsArray
        };
        await renderTemplate(compiledTemplateMain, templateData);
    });

    // Function to display the search group bar when clicking on the add event button
    $(document).on('click','#add-event-to-group-button-plus', async function () {
        currentEventId = $(this).data('event-id');
        await toggleSearchGroup('search-group');
    });

    // Function to remove an event from a group when clicking on the remove event button
    $(document).on('click', '#remove-event-from-group-button-minus', async function () {
        currentEventId = $(this).data('event-id');
        const currentGroupName = $(this).data('group-name');

        const req = await fetch(`/api/groups/remove-event?name=${currentGroupName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${currentUserBearerToken}`
            },
            body: JSON.stringify({
                eventId: currentEventId
            })
        });

        if (req.status === 201) {
            const req = await fetch('/api/groups/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                }
            });

            const searchResult = await req.json();

            const templateData =  {
                groups: searchResult
            }

            await renderTemplate(compiledTemplateGroupList, templateData);
        }
        else {
            console.error("Error removing event from group");
        }
    });

    // Function to add an event to a group when clicking on the add event button
    $(document).on('click','#add-event-to-group-button', async function (event) {
        event.preventDefault()
        const form = document.getElementById('search-group-form')

        try {
            const formData = new FormData(form);

            const groupName = formData.get('search-group-name');
            const req = await fetch(`/api/groups/add-event?name=${groupName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${currentUserBearerToken}`
                },
                body: JSON.stringify({
                    eventId: currentEventId,
                })
            });
            if (req.status === 400) {
                throw new Error('Error adding event to group');
            }
        }
        catch(error) {
            console.error(error);
        }
    });
    // Function to hide the available groups container when clicking outside of it
    $(document).on('mousedown', function (event) {
        if (!$(event.target).closest('#search-groups').length &&
            !$(event.target).closest('#available-groups').length) {
            // Click occurred outside the search bar and the groups container, hide the container
            $('#available-groups').hide();
        }
    });

    // Function to set the group name in the search bar when clicking on a group item
    $(document).on('click', '.group-item', function () {
        // Get the group name from the clicked group item
        const groupName = $(this).text();

        // Set the group name in the search bar
        $('#search-groups').val(groupName);

        // Hide the available groups container
        $('#available-groups').hide();
    });
});


