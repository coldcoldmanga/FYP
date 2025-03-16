import { OneSignal } from "react-native-onesignal";
import { ONESIGNAL_APP_API, ONESIGNAL_NOTIFICATION_API, ONESIGNAL_APP_ID } from "@env";
import { getUser, updateUserToken } from "./userServices";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const assignUserRoleTag = async (user_role: string) => {
    try {
        const playerID = await OneSignal.User.getOnesignalId();
        if(playerID){
            OneSignal.User.addTag(playerID, user_role);
        }
    } catch (error) {
        console.log(error);
    }

}

export const sendNotification = async (message: string, title: string, userRole: string, playerID: string[]) => {
    try {
        let options = {}
        if(userRole !== ""){
            options = {
                method: 'POST',
                url: ONESIGNAL_NOTIFICATION_API,
                headers: {
                  accept: 'application/json',
                  Authorization: `Key ${ONESIGNAL_APP_API}`,
                  'content-type': 'application/json'
                },
                data: {
                  app_id: ONESIGNAL_APP_ID,
                  contents: {en: message},
                  headings: {en: title},
                  filters: [
                    {
                        field: 'tag',
                        key: 'user_role',
                        relation: '=',
                        value: userRole
                    }
                  ],
                }
              };
        }
        else{
            options = {
                method: 'POST',
                url: ONESIGNAL_NOTIFICATION_API,
                headers: {
                  accept: 'application/json',
                  Authorization: `Key ${ONESIGNAL_APP_API}`,
                  'content-type': 'application/json'
                },
                data: {
                  app_id: ONESIGNAL_APP_ID,
                  contents: {en: message},
                  headings: {en: title},
                  include_aliases: {
                    onesignal_id: playerID
                  },
                  target_channel: "push"
                }
            };
        }

          
         const response = await axios.request(options);
         return response.data;
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateNewReport_Admin = async (userID: string, faultType: string, reportID: string) => {

    try {
        const title = `New Report: ${reportID}`;
        const message = `A New ${faultType} Report has been created by ${userID}.`;
        const response = await sendNotification(message, title, "Admin", []);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const updateReportStatus_Admin = async (reportID: string, status: string, workerID: string) => {
    try {
        const title = `${reportID}: Report Status Updated`;
        const message = `The report status has been updated to ${status} by ${workerID}.`;
        const response = await sendNotification(message, title, "Admin", [workerID]);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const updateReportStatus_User = async (reportID: string, status: string, playerID: string[]) => {
    try {
        const title = `${reportID}: Report Status Updated`;
        const message = `The report status has been updated to ${status}.`;
        const response = await sendNotification(message, title, "", playerID);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const updateAssignedTask_Worker = async (playerID: string[], reportID: string) => {
    try {
        const title = `New Task Assigned: ${reportID}`;
        const message = `You have been assigned a new task.`;
        const response = await sendNotification(message, title, "", playerID);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const updateTaskStatus_Worker = async (playerID: string[], reportID: string, status: string) => {
    try {
        const title = `${reportID}: Case Closed`;
        const message = `The task has been closed.`;
        const response = await sendNotification(message, title, "", playerID);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const getUserToken = async () => {

    try {

        const playerID = await OneSignal.User.getOnesignalId();
        if(playerID){
            return playerID;
        }
        return null;

    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const checkPlayerID = async () => {
    try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email){
            const userID = email?.split('@')[0];
            const playerID = await OneSignal.User.getOnesignalId();
            const currentPlayerID = await    getUser(userID);
            if (currentPlayerID &&playerID !== currentPlayerID.player_id){
                await updateUserToken(userID, playerID);
            }
        }
        return null;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
