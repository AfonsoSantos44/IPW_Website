import * as services from '../modules/seca-services.mjs';
import * as chai from "chai";
import * as mocha from "mocha";

const userUUID = (await services.addUser("testUSER")).UUID;


describe('Test the user creation', () => {
    mocha.it('should add user on success', async () => {

        let username = "testuser";
        let result = await services.addUser(username);
        chai.expect(result).to.not.be.undefined;

        username = "";
        result = await services.addUser(username);
        chai.expect(result).to.be.undefined;
    });
});


describe('Test the group creation', () => {
    it('should return 201 on success', async () => {


        let groupName = "groupName";
        let groupDescription = "groupDescription";

        // Call the addGroup function
        let result = await services.addGroup(groupName, groupDescription, userUUID);

        chai.expect(result).to.not.be.undefined;

        groupName = "";
        result = await services.addGroup(groupName, groupDescription, userUUID);
        chai.expect(result).to.be.undefined;

        groupName = "groupName";
        groupDescription = "";
        result = await services.addGroup(groupName, groupDescription, userUUID);
        chai.expect(result).to.be.undefined;
    });
});

describe('Test the group deletion', () => {
   it ('should return 200 on success', async () => {
       let groupName = "groupName";
       let groupDescription = "groupDescription";
       await services.addGroup(groupName, groupDescription, userUUID);

       let result = await services.deleteGroup(groupName, userUUID);
       chai.expect(result).to.not.be.undefined;

       groupName = "";
       result = await services.deleteGroup(groupName, userUUID);
       chai.expect(result).to.be.undefined;

   });
});

describe('Test the group edition', () => {
   it('should return 200 on success', async () => {
         let groupName = "groupName";
         let groupDescription = "groupDescription";
         await services.addGroup(groupName, groupDescription, userUUID);

         let newGroupName = "newGroupName";
         let newGroupDescription = "newGroupDescription";

         let result = await services.editGroup(groupName, newGroupName, newGroupDescription, userUUID);
         chai.expect(result).to.not.be.undefined;

         let previousName = newGroupName;
         newGroupName = "";
         result = await services.editGroup(previousName, newGroupName, newGroupDescription, userUUID);
         chai.expect(result).to.be.undefined;

         newGroupName = "groupName";
         newGroupDescription = "";
         result = await services.editGroup(newGroupName, newGroupName, newGroupDescription, userUUID);
         chai.expect(result).to.be.undefined;
   });
});

describe('Test the group listing', () => {
   it('should return 200 on success', async () => {
         let result = await services.showGroups(userUUID);
         chai.expect(result).to.not.be.undefined;
   });
});

describe('Test the group details', () => {
    it('should return 200 on success', async () => {
        const groupName = "groupName";
        const groupDescription = "groupDescription";
        await services.addGroup(groupName, groupDescription, userUUID);

        let result = await services.getGroupDetails(groupName, userUUID);
        chai.expect(result).to.not.be.undefined;

        result = await services.getGroupDetails("", userUUID);
        chai.expect(result).to.be.undefined;
    });
});

describe('Test the event addition to group', () => {
    it('should return 200 on success', async () => {
        const groupName = "groupName";
        const groupDescription = "groupDescription";
        await services.addGroup(groupName, groupDescription, userUUID);

        let result = await services.addEventToGroup(groupName, "G5v0Z9Yc3P8Mr", userUUID);
        chai.expect(result).to.not.be.undefined;

        result = await services.addEventToGroup("", "G5v0Z9Yc3P8Mr", userUUID);
        chai.expect(result).to.be.undefined;

        result = await services.addEventToGroup(groupName, "", userUUID);
        chai.expect(result).to.be.undefined;
    });
});

describe('Test the event removal from group', () => {
    it('should return 200 on success', async () => {
        const groupName = "groupName";
        const groupDescription = "groupDescription";
        await services.addGroup(groupName, groupDescription, userUUID);
        await services.addEventToGroup(groupName, "G5v0Z9Yc3P8Mr", userUUID);

        let result = await services.removeEventFromGroup(groupName, "G5v0Z9Yc3P8Mr", userUUID);
        chai.expect(result).to.not.be.undefined;

        result = await services.removeEventFromGroup("", "G5v0Z9Yc3P8Mr", userUUID);
        chai.expect(result).to.be.undefined;

        result = await services.removeEventFromGroup(groupName, "", userUUID);
        chai.expect(result).to.be.undefined;
    });
});


