'use client';
import { Channel } from "stream-chat"; // Instead of StreamChannel

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useChatContext } from 'stream-chat-react';
import { Button } from './ui/button';
import { StreamChannel } from '@stream-io/node-sdk';

const EndCallButton = ({ channel }: { channel?: Channel }) => {
  const call = useCall();
  
  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    if (channel) {
      await call.sendCustomEvent({
        type: 'call-ended',
        custom: { message: 'The host has ended the meeting.' },
        customType: 'call-ended', // Use the valid type here
      });
    }
  };

  return (
    <Button onClick={endCall} className="bg-red-500">
      End call for everyone
    </Button>
  );
};

export type CustomMessageType = 'call-ended' | 'other-custom-type'; // Add any other custom types you want to use

export default EndCallButton;
