"use client";
import { cn } from "@/lib/utils";
import { token } from "@/actions/streamChat.actions";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useMessageContext,
} from "stream-chat-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { LayoutList, Loader, MessageCircle, Users } from "lucide-react";
import EndCallButton from "./EndCallButton";
import { useUser } from "@clerk/nextjs";

const MeetingRoom = () => {
  const router = useRouter(); // ✅ Moved inside the component
  const call = useCall(); // ✅ Moved inside the component
  const searchParams = useSearchParams(); // ✅ Moved inside the component
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<"grid" | "speaker-left" | "speaker-right">("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | undefined>();
  const [showChat, setShowChat] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const { user } = useUser(); // ✅ Moved inside the component

  useEffect(() => {
    if (!call) return;

    const handleCallEnded = (event: any) => {
      if (event.type === "custom") {
        alert(event.custom.custom.message);
        router.push("/");
      }
    };

    call.on("custom", handleCallEnded);

    return () => {
      call.off("custom", handleCallEnded);
    };
  }, [call, router]);

  useEffect(() => {
    if (!apiKey || !user) return;

    (async function run() {
      const clientInstance = StreamChat.getInstance(apiKey);
      setClient(clientInstance);
      await clientInstance.connectUser(
        {
          id: user.id,
          name: user.fullName || user.firstName || "Anonymous",
        },
        token
      );

      const path = window.location.pathname;
      const id = path.split("/")[2];
      const channelId = `video-chat-${id}`;
      const channelInstance = clientInstance.channel("livestream", channelId, {});
      await channelInstance.watch();
      setChannel(channelInstance as StreamChannel);
    })();

    return () => {
      client?.disconnectUser();
      setChannel(undefined);
    };
  }, [user, apiKey, client]);

  if (!apiKey || !user) return <Loader />;

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div className={cn("h-[calc(100vh-86px)] hidden ml-2", { "show-block": showParticipants })}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap text-white">
        <CallControls onLeave={() => router.push("/")} />
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <DropdownMenuItem key={index} onClick={() => setLayout(item.toLowerCase() as any)}>
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
        {!isPersonalRoom && <EndCallButton channel={channel} />}
      </div>
    </section>
  );
};

export default MeetingRoom;
