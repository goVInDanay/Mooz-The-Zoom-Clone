'use server';

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient, UserRequest } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const secretKey = process.env.STREAM_SECRET_KEY;
export const tokenProvider= async() =>{
    const user = await currentUser();
    if(!user) throw new Error('Log in to Access');
    if(!apiKey) throw new Error('No Api Key');
    if(!secretKey) throw new Error('No Secret Key');
    const client = new StreamClient(apiKey, secretKey);
    const newUser: UserRequest = {
        id: user.id,
        role: 'user',
        custom: {
          color: 'red',
        },
        name: user?.fullName || 'user', 
        image: user.imageUrl,
      };
    await client.upsertUsers([newUser]);
    const token = client.generateUserToken({ user_id: user.id });
    return token;
} 