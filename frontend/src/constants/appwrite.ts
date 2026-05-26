export const appwriteConstants = {
    projectId : import.meta.env.VITE_APPWROTE_PROJECT_ID,
    projectEndpoint : import.meta.env.VITE_APPWRITE_PROJECT_ENDPOINT,
    videoBucket : import.meta.env.VITE_APPWRITE_VIDEO_BUCKET,
    imageBucket : import.meta.env.VITE_APPWRITE_IMAGE_BUCKET,
    documentBucket : import.meta.env.VITE_APPWRITE_AUDIO_BUCKET,
    databaseId : import.meta.env.VITE_APPWRITE_DB_ID,
    botsCollectionId : import.meta.env.VITE_APPWRITE_BOT_COLLECTION_ID,
    scheduleCollectionId : import.meta.env.VITE_APPWRITE_SCHEDULE_COLLECTION_ID,
    testCollectionId : import.meta.env.VITE_APPWRITE_TEST_COLLECTION_ID
}

export const AppConstants = {
    endpoint : import.meta.env.VITE_BACKEND_URL,
    geminiApi : import.meta.env.VITE_GEMINI_API_KEY,
}