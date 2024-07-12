import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Stack,
  Tag,
  TagLabel,
  TagRightIcon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { axiosReqWithToken } from "../api/axios";
import { AddIcon, ChatIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderFull } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const { data } = await axiosReqWithToken.get("/api/chat/fetchchats");
      setChats(data);
      console.log(data);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load the chats",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                display="flex"
                alignItems="center"
              >
                {!chat.isGroupChat ? (
                  <>
                    <Avatar
                      mr={2}
                      size="sm"
                      cursor="pointer"
                      name={getSender(loggedUser, chat.users)}
                      src={getSenderFull(loggedUser, chat.users).pic}
                    />
                    <Text>{getSender(loggedUser, chat.users)}</Text>
                  </>
                ) : (
                  <div>
                    <div style={{display:"flex", alignItems:"center"}}>
                      <Avatar
                        mr={2}
                        size="sm"
                        cursor="pointer"
                        name="Group"
                        src="https://i.pinimg.com/236x/15/40/a5/1540a5213aefba221f16ef82a9b2fa77.jpg"
                      />
                      <div >

                    <Text>{chat.chatName}</Text>
                    <HStack >
                        <Tag variant="outline" colorScheme="blue" fontSize="10px">
                          <TagLabel>Group</TagLabel>
                          <TagRightIcon as={ChatIcon} />
                        </Tag>
                      </HStack>
                      </div>
                    </div>
                  </div>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
