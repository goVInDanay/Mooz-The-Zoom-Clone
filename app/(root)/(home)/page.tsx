'use client'
import MeetingTypes from '@/components/MeetingTypes';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // If using Next.js, otherwise use react-router-dom
type Meeting = {
  id: string;
  startsAt: Date;
  link: string;
  description: string;
};
const Home = () => {
  const [user, setUser] = useState({});
  const [latestMeeting, setLatestMeeting] = useState<Meeting | null>(null);
  const dateTime = new Date();
  const time = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(dateTime);
  const router = useRouter();
  return (
    <section className='flex size-full flex-col gap-10 text-white'>
      <div className='h-[300px] w-full rounded-[20px] bg-hero bg-cover'>
        <div className='flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11'>
          <div
            className='glassmorphism max-w-[270px] rounded py-2 text-center text-base font-normal cursor-pointer'
            onClick={() => latestMeeting && window.open(latestMeeting.link, '_blank')}
          >
            {latestMeeting ? latestMeeting.description : 'No Upcoming Meetings'}
          </div>
          <div className='flex flex-col gap-2'>
            <h1 className='text-4xl font-extrabold lg:text-7xl'>
              {time}
            </h1>
            <p className='text-lg font-medium text-sky-1 lg:text-2xl'>
              {date}
            </p>
          </div>
        </div>
      </div>
      <MeetingTypes onLatestMeetingChange={setLatestMeeting} />
    </section>
  );
};
export default Home;
