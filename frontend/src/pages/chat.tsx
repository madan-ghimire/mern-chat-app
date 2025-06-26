import type { Chat as ChatType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchChats = async () => {
  const res = await axios.get("/api/chat");
  return res.data;
};

const Chat = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
  });

  if (isLoading) return <div>Loading chats...</div>;
  if (error) return <div>Error loading chats</div>;

  console.log(data);

  return (
    <div>
      {data.map((chat: ChatType) => (
        <>
          <h2>Chat page</h2>
          <div key={chat._id}>{chat.chatName}</div>
        </>
      ))}
    </div>
  );
};

export default Chat;
