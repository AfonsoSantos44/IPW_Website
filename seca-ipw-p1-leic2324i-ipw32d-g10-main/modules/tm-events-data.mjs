import fetch from 'node-fetch';

const API_KEY = "HgwGunJxf4UlJlCilrkAtNm9w2CrnPAz"
const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

/**
 * This is an auxiliary function that filters the data returned from the Ticketmaster API
 * @param response
 * @returns {{segment: (*|null), name, genre: (*|null), id}}
 */
function filterEventData(response) {
    return {
        id: response.id,
        name: response.name,
        segment: response.segment || null,
        genre: response.genre || null
    }
}

/**
 * This function gets the popular events from the Ticketmaster API
 * @param {String} size
 * @param {String} page
 * @returns
 */
export async function getPopularEvents(size, page) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&sort=relevance,desc&max-size=${size}&page=${page}`);

        if (response.ok) {
            // Return the data
            const eventData = await response.json();
            return eventData._embedded.events.map(filterEventData);
        }
        else {
            // If the request was not successful, handle the error
            throw new Error('Error fetching data from API');
        }
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * This function searches events by name from the Ticketmaster API
 * @param {String} size
 * @param {String} page
 * @param {String} keyword
 * @returns {Promise<void>}
 */
export async function searchEventByName(size, page, keyword) {
    try {
        if (keyword) {
            const response = await fetch(`${API_URL}?apikey=${API_KEY}&keyword=${keyword}&sort=relevance,desc&max-size=${size}&page=${page}`);

            if (response.ok) {
                // Return the data
                const eventData = await response.json();
                return eventData._embedded.events.map(filterEventData);
            }
            else {
                // If the request was not successful, handle the error
                console.error('Error fetching data from API:', response.statusText);
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
 * This function gets the details of an event based on a given id
 * @param id
 */
export async function getEventById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}?apikey=${API_KEY}`);

        if (response.ok) {
            // Return the data
            const eventData = await response.json();
            return filterEventData(filterEventData(eventData));
        }
        else {
            // If the request was not successful, handle the error
            console.error('Error fetching data from API:', response.statusText);
            return undefined;
        }
    }
    catch (error) {
        console.error('Error fetching data from API: ', error.message);
        return undefined;
    }
}

export async function getFullEventInfo(eventId) {
    try {
        const response = await fetch(`${API_URL}/${eventId}?apikey=${API_KEY}`);

        if (response.ok) {
            // Return the data
            return await response.json();
        }
        else {
            // If the request was not successful, handle the error
            console.error('Error fetching data from API:', response.statusText);
            return undefined;
        }
    }
    catch (error) {
        console.error('Error fetching data from API: ', error.message);
        return undefined;
    }
}
