'use server';

import { currentUser } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const secretKey = process.env.STREAM_SECRET_KEY;
export const token= async() =>{
    const user = await currentUser();
    if(!user) throw new Error('Log in to Access');
    if(!apiKey) throw new Error('No Api Key');
    const serverClient = StreamChat.getInstance(apiKey, secretKey);
    const token = serverClient.createToken(user.id);
    return token;
} 