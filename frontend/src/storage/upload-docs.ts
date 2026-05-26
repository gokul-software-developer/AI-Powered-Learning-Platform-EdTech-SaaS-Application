import { storage } from "@/config/appwrite";
import { appwriteConstants } from "@/constants/appwrite";
import { AppErrServer } from "@/utils/app-err";
import { ID } from "appwrite";

export async function uploadDocuments(file : File) : Promise<string | undefined> {
    try {
        const promise = await storage.createFile(
            appwriteConstants.documentBucket,
            ID.unique(),
            file
        );
        console.log("File:\n", file);

        if (!promise.$id) {
            throw new Error("Document not uploaded");
        }

        const fileUrl = await storage.getFileView(
            appwriteConstants.documentBucket,
            promise.$id
        );
        console.log("File URL: ", fileUrl);

        return fileUrl; 
    } catch (error) {
        AppErrServer(error);  
    }
}