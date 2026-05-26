import { account, database } from "@/config/appwrite";
import { appwriteConstants } from "@/constants/appwrite";
import { uploadDocuments } from "@/storage/upload-docs";
import { CreateBotServerTypes } from "@/types/bot-types";
import { AppErrServer } from "@/utils/app-err";
import { ID, Query } from "appwrite";

export async function CreateBots(values : CreateBotServerTypes) : Promise<string | undefined> {    
    try {
        const appwriteFileURl : string[] = [];
        console.log("payload in api: \n", values);
        values.fileUrl.forEach(async function (file) {
            const fileURl = await uploadDocuments(file);
            if (!fileURl) {
                throw new Error("file URl not obtained");
            };

            appwriteFileURl.push(fileURl);
        });
        console.log(appwriteFileURl);

        const payload = {
            title : values.title,
            description : values.description,
            userId : values.userId,
            fileUrl : appwriteFileURl
        };
        console.log("payload converted:\n", payload);

        const promise = await database.createDocument(
            appwriteConstants.databaseId,
            appwriteConstants.botsCollectionId,
            ID.unique(),
            payload
        );
        console.log(promise);

        if (!promise.$id) {
            throw new Error("Bot not Created properly");
        }

        return promise.$id;
    } catch (error) {
        AppErrServer(error);
    }
};

export async function updateBots(values : {
    botId : string;
    title : string;
    description : string;
}) : Promise<string | undefined> {
    try {
        console.log(values);
        return
    } catch (error) {
        AppErrServer(error);
    }
};

export async function DeleteBot(botId : string) {
    try {
        await database.deleteDocument(
            appwriteConstants.databaseId,
            appwriteConstants.botsCollectionId,
            botId
        );
    } catch (error) {
        AppErrServer(error);
    }
}

export async function ListBotsbyUser() {
    try {
        const userInfo = await account.get();
        if (!userInfo.$id) {
            throw new Error("User not Authenticated");
        };

        const promise = await database.listDocuments(
            appwriteConstants.databaseId,
            appwriteConstants.botsCollectionId,
            [
                Query.equal('userId', userInfo.$id)
            ]
        );

        return promise.documents;
    } catch (error) {
        AppErrServer(error);
    }
}