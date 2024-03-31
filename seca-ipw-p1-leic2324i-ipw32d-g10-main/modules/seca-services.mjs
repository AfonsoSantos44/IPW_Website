import {getEventById} from "./tm-events-data.mjs";
import {readGroups, writeGroups, writeUsers, getUserPassword} from "./es-data-mem.mjs";



/**
 * This function checks if the user exists and if the password is correct
 * @param username
 * @param password
 * @returns {Promise<boolean>}
 */
export async function checkCredentials(username, password) {
    try {
        if (!username || !password) {
            throw new Error("Username and password are required");
        }
        const userPassword = await getUserPassword(username);
        if (!userPassword) {
            throw new Error("User not found");
        }
        if (password !== userPassword) {
            throw new Error("Incorrect credentials");
        }
        else {
            return true;
        }
    }
    catch (error) {
        console.error(error.message);
        return false;
    }
}


/**
 * This function creates a new user and adds it to the users object
 * @param username
 * @param password
 * @returns {Promise<{message: string, UUID: string}|undefined>}
 */
export async function addUser(username, password) {
    const UUID = crypto.randomUUID();

    try {

        if (!username) {
            throw new Error("Username is required");
        }

        // Add the new user to the users object
        const newUser = { username:username, password: password, UUID: UUID };

        // Write the updated users object back to the file
        await writeUsers(newUser);

        return { message: "User created", UUID: UUID };
    } catch (error) {
        // Handle errors
        console.error(error.message);
        return undefined;
    }
}

/**
 * This function creates a new group and adds it to the groups object
 * @param name
 * @param description
 * @param token
 * @returns {Promise<{message: string}|undefined>}
 */
export async function addGroup(name, description, token) {
    try {

        let allGroups = await readGroups();

        if (!name || !description) {
            throw new Error("Name and description are required");
        }
        else {
            if (allGroups[token]) {
                let userGroups = allGroups[token].groups;
                userGroups.push({ name: name, description: description, events: [] });
                allGroups[token].groups = userGroups;
            }
            else {
                allGroups[token] = {groups: [{name: name, description: description, events: []}]};
            }
            await writeGroups(allGroups[token], token);

            return { message: "Group created" };
        }
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function deletes a group and removes it from the groups object
 * @param name
 * @param UUID
 * @returns {Promise<{message: string}|undefined>}
 */
export async function deleteGroup(name, UUID) {
    let allGroups = await readGroups();
    try {
        if (allGroups[UUID]) {
            const userGroups = allGroups[UUID].groups;
            const toDeleteIndex = userGroups.findIndex(group => group.name === name);
            if (toDeleteIndex === -1) {
                throw new Error("Group not found");
            }
            userGroups.splice(toDeleteIndex, 1)
            allGroups[UUID].groups = userGroups
            await writeGroups(allGroups[UUID], UUID);
            return { message: "Group deleted" };
        }
        else {
            throw new Error("Group not found");
        }
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function edits a group and updates it in the groups object
 * @param groupName
 * @param newName
 * @param newDescription
 * @param UUID
 * @returns {Promise<{message: string}|undefined>}
 */
export async function editGroup(groupName, newName, newDescription, UUID) {
    try {
        const allGroups = await readGroups();
        if (allGroups[UUID] && newName && newDescription) {
            const userGroups = allGroups[UUID].groups;
            let group = userGroups.find(group => group.name === groupName);
            if (group) {
                group.name = newName;
                group.description = newDescription;
                allGroups[UUID].groups = userGroups;
                await writeGroups(allGroups[UUID], UUID);
                return {message: "Group edited"};
            }
            throw new Error("Group not found");
        }
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function shows the existing groups
 * @returns {Promise<{name: *, description: *, events: *[]}[]|undefined>}
 */
export async function showGroups(UUID) {
    try {
        const allGroups = await readGroups();
        if (!Object.keys(allGroups).find(key => key === UUID)) return [];
        let groupsInfo = [];
        allGroups[UUID].groups.forEach(group => {
            groupsInfo.push({ name: group.name, description: group.description, events: group.events });
        })
        return groupsInfo;
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function gets the details of a group
 * @param name
 * @param UUID
 * @returns {Promise<{name: *, description: *, events: *[]}|undefined>}
 */
export async function getGroupDetails(name, UUID) {
    const allGroups = await readGroups();
    const userGroups = allGroups[UUID];
    try {
        if (userGroups) {
            const group = userGroups.groups.find(group => group.name === name);
            if (group) {
                const eventsInfo = group.events.map(event => ({
                    name: event.name,
                    date: event.date,
                    segment: event.segment || null,
                    genre: event.genre || null
                }));
                return {
                    name: group.name,
                    description: group.description,
                    events: eventsInfo
                };
            }
        }
        else {
            throw new Error("Group not found");
        }
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function adds an event to a group and updates the groups object
 * @param groupName
 * @param eventId
 * @param UUID
 */
export async function addEventToGroup(groupName, eventId, UUID) {
    const allGroups = await readGroups();
    try {
        const userGroups = allGroups[UUID];
        if (!userGroups) {
            throw new Error("Group not found");
        }
        if (!eventId) {
            throw new Error("Event not found");
        }
        else {
            try {
                let userGroups = allGroups[UUID].groups;
                let group = userGroups.find(group => group.name === groupName);

                if (!group) {
                    throw new Error("Group not found");
                }

                const event = await getEventById(eventId);
                if (!event) {
                    throw new Error("Event not found");
                }

                const eventExists = group.events.find(event => event.id === eventId);
                if (eventExists) {
                    throw new Error("Event already exists in group");
                }

                group.events.push(event);
                await writeGroups(allGroups[UUID], UUID);

                return { message: "Event added to group" };
            } catch (error) {
                console.error(error);
                return undefined;
            }
        }
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function removes an event from a group and updates the groups object
 * @param groupName
 * @param eventId
 * @param UUID
 * @returns {Promise<{message: string}|undefined>}
 */
export async function removeEventFromGroup(groupName, eventId, UUID) {
    const allGroups = await readGroups();
    try {
        let userGroups = allGroups[UUID].groups;
        let group = userGroups.find(group => group.name === groupName);
        if (!group) {
            throw new Error("Group not found");
        }
        if (!eventId) {
            throw new Error("Event not found");
        }

        let groupEvents = group.events;

        const event = groupEvents.find(event => event.id === eventId);

        if (!event) {
            throw new Error("Event not found");
        }

        groupEvents.splice(groupEvents.indexOf(event), 1);

        await writeGroups(allGroups[UUID], UUID);

        return { message: "Event removed from group" };

    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}