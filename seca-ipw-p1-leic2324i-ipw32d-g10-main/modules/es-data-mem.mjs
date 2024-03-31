const elasticsearchUrl = 'http://localhost:9200';

const elasticUsername = process.env.ELASTIC_USERNAME;
const elasticPassword = process.env.ELASTIC_PASSWORD;

/**
 * Creates an index in ElasticSearch with the given name
 * @param index
 */
async function createIndex(index) {
    try {
        const currentIndexes = await getIndexes();
        if (index in currentIndexes) {
            console.error(`${index} already exists`);
            return undefined;
        }
        await fetch(`${elasticsearchUrl}/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            authentication:{
                username: elasticUsername,
                password: elasticPassword
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}

/**
 * Removes an index from ElasticSearch with the given name
 * @param index
 */
async function removeIndex(index) {
    try {
        const currentIndexes = await getIndexes();
        if (!(index in currentIndexes)) {
            console.error(`${index} does not exist`);
            return undefined;
        }
        await fetch(`${elasticsearchUrl}/${index}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            authentication: {
                username: elasticUsername,
                password: elasticPassword
            }
        });
    }
    catch(error) {
        console.error(error);
    }
}

/**
 * Adds a document to an existing index in ElasticSearch
 * @param index
 * @param docId
 * @param jsonDocument
 */
async function addDocumentToIndex(index, docId, jsonDocument) {
    try {
        await fetch(`${elasticsearchUrl}/${index}/_doc/${docId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            authentication: {
                username: elasticUsername,
                password: elasticPassword
            },
            body: jsonDocument
        });
    }
    catch (error) {
        console.error(error);
    }
}

/**
 * Updates an index in ElasticSearch
 * @param index
 * @param UUID
 * @param jsonDocument
 */
async function updateIndex(index, UUID, jsonDocument) {
    try {
        await fetch(`${elasticsearchUrl}/${index}/_doc/${UUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            authentication: {
                username: elasticUsername,
                password: elasticPassword
            },
            body: jsonDocument
        });
    }
    catch (error) {
        console.error(error);
    }
}

/**
 * Gets all the indexes from ElasticSearch
 * @returns {Promise<any>}
 */
async function getIndexes()  {
    try {
        const response = await fetch(`${elasticsearchUrl}/_all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            authentication: {
                username: elasticUsername,
                password: elasticPassword
            }
        });
        return await response.json();
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * Returns the data of a given index
 * @param index
 * @returns {Promise<any>}
 */
async function getIndexData(index) {
    try {
        const response = await fetch(`${elasticsearchUrl}/${index}/_search`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            authentication: {
                username: elasticUsername,
                password: elasticPassword
            }
        });
        const data = await response.json();
        return data.hits.hits;
    } catch (error) {
        console.error('Error retrieving documents:', error);
    }
}

/**
 * Returns all the groups stored in ElasticSearch
 * @returns {Promise<{}>}
 */
async function readGroups() {
    try {
        const data = await getIndexData('groups');
        const allGroups = {};

        data.forEach(item => {
            allGroups[item._id] = {
                groups: item._source.groups
            }
        })
        return allGroups;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Writes the groups to ElasticSearch
 * @param groupInfo
 * @param UUID
 * @returns {Promise<void>}
 */
async function writeGroups(groupInfo, UUID) {
    try {
        const data = await getIndexData('groups');
        const exists = data.some(group => group._id === UUID);
        if (exists) {
            await updateIndex('groups', UUID, JSON.stringify(groupInfo));
        } else {
            await addDocumentToIndex('groups', UUID, JSON.stringify(groupInfo));
        }
    } catch (error) {
        console.error(error);
    }
}

async function readUsers() {
    const data = await getIndexData('users');
    const allUsers = {};
    data.forEach(item => {
        allUsers[item._source.username] = {
            username: item._source.username,
            UUID: item._source.UUID
        }
    })
    return allUsers;
}

/**
 * Writes the users to ElasticSearch
 * @param userInfo
 * @returns {Promise<void>}
 */
async function writeUsers(userInfo) {
    try {
        await addDocumentToIndex('users', userInfo.username, JSON.stringify(userInfo))
    }
    catch (error) {
        console.error(error)
    }
}

/**
 * Returns the user's password
 * @param username
 * @returns {Promise<undefined|*>}
 */
async function getUserPassword(username) {
    try {
        if (!username) {
            throw new Error("Username is required");
        }
        const data = await getIndexData('users');
        const user = data.find(user => user._source.username === username);
        if (!user) {
            throw new Error("User not found");
        }
        return user._source.password;
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

/**
 * Returns the user's data
 * @param username
 * @returns {Promise<*|null>}
 */
export async function getUser(username) {
    try {
        if (!username) {
            return null;
        }
        const data = await getIndexData('users');
        const user = data.find(user => user._source.username === username);
        if (!user) {
            throw new Error("User not found");
        }
        return user._source;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Generates mock data in order to test the program
 * @returns {Promise<void>}
 */
async function genMockData() {
    try {
        await createIndex('users');
        await createIndex('groups');
        await writeUsers({ username: 'admin', password: '123', UUID: '1234' });
    }
    catch (error) {
        console.error(error);
    }
}

// Run this function to generate mock data
// await genMockData();

export {
    readGroups,
    writeGroups,
    readUsers,
    writeUsers,
    createIndex,
    addDocumentToIndex,
    getIndexData,
    getUserPassword
}