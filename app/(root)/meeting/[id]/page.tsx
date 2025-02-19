'use client'
import MeetingRoom from '@/components/MeetingRoom';
import MeetingSetup from '@/components/MeetingSetup';
import { useGetCallById } from '@/hooks/useGetCallById';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { Loader } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

const Meeting= () => {
  const params = useParams();
  if(!params) return params
  const id = params?.id;
  if(!id){
    throw new Error("No ID");
  }
  const { user, isLoaded} = useUser();
  const {call, isCallLoading} = useGetCallById(id);
  const [setupComplete, setsetupComplete] = useState(false);
  if(!isLoaded || isCallLoading) return <Loader/>
  return (
    <main className='w-full h-screen'>
      <StreamCall call={call}>
        <StreamTheme>
          {!setupComplete ? (<MeetingSetup setsetUpComplete = {setsetupComplete}/>) : (<MeetingRoom/>)}
        </StreamTheme>
      </StreamCall>
    </main>
  )
}

export default Meeting
