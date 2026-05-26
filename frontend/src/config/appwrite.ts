import { appwriteConstants } from '@/constants/appwrite';
import {Account, Avatars, Client, Databases, Storage} from 'appwrite'

export const client = new Client();
client.setProject('67d87b4f0009cb5121c7');
client.setEndpoint('https://cloud.appwrite.io/v1');

export const account = new Account(client);
export const storage = new Storage(client);
export const database = new Databases(client);
export const avatars = new Avatars(client);
