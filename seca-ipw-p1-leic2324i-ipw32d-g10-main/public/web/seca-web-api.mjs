import express from 'express';
import { getFullEventInfo, getPopularEvents, searchEventByName} from '../../modules/tm-events-data.mjs';
import passport from 'passport';
import {
    addEventToGroup,
    addGroup,
    addUser,
    deleteGroup,
    editGroup,
    getGroupDetails,
    removeEventFromGroup,
    showGroups
} from "../../modules/seca-services.mjs";

import { readGroups, readUsers } from "../../modules/es-data-mem.mjs";


const apiRouter = express.Router();
apiRouter.use(express.json());

/**
 * This is a middleware function that checks if the user already exists
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function checkUser(req,res,next) {
    const username = req.body.username;
    const users = await readUsers();
    const exists = Object.values(users).some(user => user.username === username);
    if (exists) {
        res.status(400).json({ error: "User already exists" });
    }
    else {
        next();
    }
}

/**
 * This is a middleware function that verifies whether the user is authenticated or not
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function authenticateUser(req, res, next) {
    // check if the user is authenticated
    try {
        const bearerToken = req.headers.authorization.split(' ')[1];

        if (bearerToken) {
            // check if there is a user in user-data.json with a UUID equal to the bearerToken
            const user = Object.values(await readUsers()).find(user => user.UUID === bearerToken);

            if (user) {
                next();
            } else {
                res.status(401).json({error: "Unauthorized"});
            }
        } else {
            res.status(401).json({error: "Unauthorized"});
        }
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ error: "Unauthorized" });
    }
}

/**
 * This is a middleware function that checks if the group already exists
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
function checkGroup(req, res, next) {
    const { name, description } = req.body;
    if (name && description) {
        const check = Object.values(readGroups()).some(group => group.name === name);
        if (check) {
            res.status(400).json({ error: "Group already exists" });
        }
        else {
            next();
        }
    }
    else {
        res.status(400).json({ error: "Name and description are required" });
    }
}

/**
 * This is an api route that returns the popular events
 */

apiRouter.get('/events/popular-events', async (req, res) => {

    const size = req.query.size || "30";
    const page = req.query.page || "1";
    const events = await getPopularEvents(size, page);
    if (events)  {
        res.status(201).json(events);
    }
    else {
        res.status(400).json({ error: 'Error fetching data from API' });
    }
});

/**
 * This is an api route that returns the events that match the keyword
 */

apiRouter.get('/events/search', async (req, res) => {
    const size = req.query.size || "30";
    const page = req.query.page || "1";
    const keyword = req.query.keyword;
    const events = await searchEventByName(size, page, keyword)
    if (events)  {
        res.status(201).json(events);
    }
    else {
        res.status(400).json({ error: 'Error fetching data from API' });
    }
});


/**
 * This is an api route that returns the event details based of a given event id
 */
apiRouter.get('/event', async (req, res) => {
    const eventId = req.query.eventId;
    const eventInfo = await getFullEventInfo(eventId);
    if (eventInfo) {
        res.status(201).json(eventInfo);
    }
    else {
        res.status(400).json({ error: 'Error fetching event details' });
    }
});

/**
 * This is an api route that creates a user in the database
 */
apiRouter.post('/users/create',checkUser, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await addUser(username, password);
    if (user) {
        res.status(201).json({message: user.message, UUID: user.UUID});
    }
    else {
        res.status(400).json({ error: 'Error creating user' });
    }
});

/**
 * This is an api route that authenticates a user
 */
apiRouter.post('/users/authenticate', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!user) {
            // Authentication failed
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Authentication successful
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            return res.status(201).json({ message: 'User authenticated', UUID: user.UUID });
        });
    })(req, res, next);
});

/**
 * This is an api route that creates a group in the database
 */
apiRouter.post('/groups/create', authenticateUser, checkGroup, async (req, res) => {
    if (req.isAuthenticated()) {
        const name = req.body.name;
        const description = req.body.description;
        const token = req.headers.authorization.split(' ')[1];
        const group = await addGroup(name, description, token);
        if (group) {
            res.status(201).json({message: group.message});
        } else {
            res.status(400).json({error: 'Error creating group'});
        }
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

/**
 * This is an api route that deletes a group from the database
 */
apiRouter.post('/groups/delete', authenticateUser, async (req, res) => {
    if (req.isAuthenticated()) {
        const groupId = req.query.name;
        const UUID = req.headers.authorization.split(' ')[1];
        const wasDeleted = await deleteGroup(groupId, UUID);
        if (wasDeleted) {
            res.status(201).json({ message: wasDeleted.message });
        } else {
            res.status(400).json({ error: 'Error deleting group' });
        }
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

/**
 * This is an api route that edits a group in the database
 */
apiRouter.post('/groups/edit', authenticateUser, async (req, res) => {
    const groupName = req.query.name;
    const newName = req.body.name;
    const newDescription = req.body.description;
    const UUID = req.headers.authorization.split(' ')[1];
    const wasEdited = await editGroup(groupName, newName, newDescription, UUID);
    if (wasEdited) {
        res.status(201).json({ message: wasEdited.message });
    }
    else {
        res.status(400).json({ error: 'Error editing group' });
    }
});

/**
 * This is an api route that returns the user's groups
 */
apiRouter.get('/groups/list', authenticateUser, async (req, res) => {
    if (req.isAuthenticated()) {
        const UUID = req.headers.authorization.split(' ')[1];
        const groupsInfo = await showGroups(UUID);
        if (groupsInfo) {
            res.status(201).json(groupsInfo);
        } else {
            res.status(400).json({error: 'Error listing groups'});
        }
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

/**
 * This is an api route that returns a certain group's details
 */
apiRouter.get('/groups/details', authenticateUser, async (req, res) => {
    if (req.isAuthenticated()) {
        const groupName = req.query.name;
        const UUID = req.headers.authorization.split(' ')[1];
        const details = await getGroupDetails(groupName, UUID);
        if (details) {
            res.status(201).json(details);
        } else {
            res.status(400).json({error: 'Error fetching group details'});
        }
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

/**
 * This is an api route that adds an event to a group
 */
apiRouter.post('/groups/add-event', authenticateUser, async (req, res) => {
    if (req.isAuthenticated()) {
        const groupName = req.query.name;
        const eventId = req.body.eventId;
        const UUID = req.headers.authorization.split(' ')[1];
        const addedEvent = await addEventToGroup(groupName, eventId, UUID);
        if (addedEvent) {
            res.status(201).json({message: addedEvent.message});
        } else {
            res.status(400).json({error: 'Error adding event to group'});
        }
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

/**
 * This is an api route that removes an event from a group
 */
apiRouter.post('/groups/remove-event', authenticateUser, async (req, res) => {
    if (req.isAuthenticated()) {
        const groupName = req.query.name;
        const eventId = req.body.eventId;
        const UUID = req.headers.authorization.split(' ')[1];
        const wasRemoved = await removeEventFromGroup(groupName, eventId, UUID);
        if (wasRemoved) {
            res.status(201).json({message: wasRemoved.message});
        } else {
            res.status(400).json({error: 'Error removing event from group'});
        }
    } else {
        res.status(401).json({error: 'Unauthorized'});
    }
});

/**
 * This is an api route that returns the user's bearer token
 */
apiRouter.get('/users/token', async (req, res) => {
    try {
        const username = req.query.username;
        const users = await readUsers();
        res.status(201).json({ token: Object.values(users).find(user => user.username === `${username}`).UUID});
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error fetching token' });
    }
})

apiRouter.get('/users/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        return res.status(201).json({ message: 'User logged out' });
    });
});


export { apiRouter };