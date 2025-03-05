'use client'
import { cn } from '@/lib/utils';
import { token } from "@/actions/streamChat.actions";
import { CallControls, CallingState, CallParticipantsList, CallStatsButton, PaginatedGridLayout, SpeakerLayout, useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react'
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window, useMessageContext } from 'stream-chat-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { LayoutList, Loader, MessageCircle, Users } from 'lucide-react';
import EndCallButton from './EndCallButton';
import { useUser } from '@clerk/nextjs';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const { user } = useUser();

  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [client, setClient] = useState<StreamChat>();
  const [channel, setChannel] = useState<StreamChannel | undefined>();
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  useEffect(() => {
    if (!call) return;

    const handleCallEnded = (event: any) => {
      if (event.type === 'custom') {
        alert(event.custom.custom.message); 
        router.push('/')
      }
    };

    call.on('custom', handleCallEnded); // Listen for custom events

    return () => {
      call.off('custom', handleCallEnded); // Cleanup on unmount
    };
  }, [call]);

  if (!apiKey || !user) return;

  useEffect(() => {
    (async function run() {
      const client = StreamChat.getInstance(apiKey);
      setClient(client);
      await client.connectUser(
        {
          id: user.id,
          name: user.fullName || user.firstName || 'Anonymous',
        },
        token,
      );
      const path = window.location.pathname;
    const id = path.split('/')[2];
      const meetingId = id;
      const channelId = `video-chat-${meetingId}`;
      const channel = client.channel("livestream", channelId, {});
      await channel.watch();
      setChannel(channel as StreamChannel);
    })();

    return () => {
      client?.disconnectUser();
      setChannel(undefined);
    };
  }, [user.id]);


  const CustomMessage = () => {
    const { message } = useMessageContext();
 
    if (!message) return null; 
  
    return (
      <div className="p-2">
        <p className="text-sm font-semibold text-white">{message.user?.name}</p>
        <p className="text-gray-300">{message.text}</p>
      </div>
    );
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const handleHangup = () => {
    router.push('/');
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { 'show-block': showParticipants })}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Floating Chat Button */}
      



      {/* Bottom Controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap text-white">
        <CallControls onLeave={handleHangup} />
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <DropdownMenuItem key={index} onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}>
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        <button onClick={() => setShowChat((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <MessageCircle size={20} className="text-white" />
          </div>
        </button>
        <div className={cn(
  "fixed top-10 right-5 h-[600px] w-[350px] bg-[#19232d] shadow-lg border border-gray-700 rounded-2xl overflow-hidden transition-all duration-300",
  { "hidden": !showChat }
)}>

          {client && channel && (
            <Chat client={client} theme="livestream dark">
              <Channel channel={channel}>
                <Window>
                  <ChannelHeader live={false}/>
                  <div className="flex-1 overflow-y-auto">
                    <MessageList Message={CustomMessage}/>
                  </div>
                  {/* Styled Message Input */}
                  <div className=" display: none absolute bottom-0 w-full bg-[#19232d] p-2 border-t border-gray-700">
                  <MessageInput
                    focus
                    noFiles={true}
                    hideSendButton={true}
                    additionalTextareaProps={{
                      placeholder: "Type your message...",
                      className: "bg-black text-white p-2 rounded-lg w-full",
                    }}
                  />
                  </div>
                  <style jsx global>{`
                    .str-chat__file-input {
                      display: none !important;
                    }
                      .str-chat__file-input-label{
                      display:none !important
                      }
                  `}
                </style>
                </Window>
                <Thread />
              </Channel>
            </Chat>
          )}
        </div>

        {!isPersonalRoom && <EndCallButton channel={channel} />}
      </div>
    </section>
  );
};

export default MeetingRoom;
