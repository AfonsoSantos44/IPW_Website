import fs from "fs";

// Unused module since ElasticSearch is being used instead of a JSON file.
const groupsDataFilePath = 'C:\\Uni\\IPW\\seca-ipw-p1-leic2324i-ipw32d-g10\\data\\groups-data.json';
const usersDataFilePath = 'C:\\Uni\\IPW\\seca-ipw-p1-leic2324i-ipw32d-g10\\data\\users-data.json';

/**
 * This function reads the data from the groups JSON file and returns it.
 * @returns {any|{}}
 */
export function readGroups() {
    try {
        let rawData = fs.readFileSync(groupsDataFilePath, 'utf-8');
        return rawData ? JSON.parse(rawData) : {};
    } catch (error) {
        console.error('Error reading groups:', error);
        throw error;
    }
}


/**
 * This function writes the data to the groups JSON file.
 * @param groups
 * @returns {void}
 */
export function writeGroups(groups) {
    try {
        let data = JSON.stringify(groups,null,2);
        fs.writeFileSync(groupsDataFilePath, data);
    } catch (error) {
        console.error('Error writing groups:', error);
        throw error;
    }
}

/**
 * This function reads the data from the users JSON file and returns it.
 * @returns {any|{}}
 */
export function readUsers() {
    try {
        let rawData = fs.readFileSync(usersDataFilePath, 'utf-8');
        return rawData ? JSON.parse(rawData) : {};
    } catch (error) {
        console.error('Error reading users:', error);
        throw error;
    }
}

/**
 * This function writes the data to the users JSON file.
 * @param users
 * @returns {void}
 */
export function writeUsers(users) {
    try {
        let data = JSON.stringify(users,null,2);
        fs.writeFileSync(usersDataFilePath, data);
    } catch (error) {
        console.error('Error writing users:', error);
        throw error;
    }
}

