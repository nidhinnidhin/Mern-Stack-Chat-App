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
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { axiosReqWithToken } from "../api/axios";
import { AddIcon, ChatIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderFull } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import groupImage from "../image/group.jpg";
import io from "socket.io-client";

// const ENDPOINT = "https://mern-stack-chat-app-wu4f.onrender.com";
const ENDPOINT = "http://localhost:5000";
let socket;

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();
  const [preview, setPreview] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

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

    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => console.log("Connected to socket.io"));

    socket.on("message recieved", (newMessage) => {
      const updatedChats = chats.map((chat) => {
        if (chat._id === newMessage.chat._id) {
          return {
            ...chat,
            latestMessage: newMessage,
          };
        }
        return chat;
      });
      setChats(updatedChats);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAgain, user, chats]);

  const getLatestMessage = (chat) => {
    const latestMessage = chat.latestMessage;
    if (latestMessage) {
      const { content } = latestMessage;
      const isMedia = content.startsWith("http://res.cloudinary.com");
      if (isMedia) {
        if (/\.(jpeg|jpg|gif|png)$/.test(content)) {
          return "Sent an image";
        } else if (/\.(mp4|mov|avi)$/.test(content)) {
          return "Sent a video";
        }
      }
      return content;
    }
    return "";
  };

  const profileHandler = (profile) => {
    onOpen();
    setPreview(profile);
  };

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
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
        <ModalContent
          bg="transparent"
          alignItems="center"
          justifyContent="center"
          boxShadow="none"
        >
          <ModalCloseButton color="white" />
          <ModalBody>
            <img src={preview} style={{borderRadius:"10px"}} height={500} width={400} />
          </ModalBody>
        </ModalContent>
      </Modal>
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
                flexDir="column"
              >
                <Box display="flex" alignItems="center">
                  {!chat.isGroupChat ? (
                    <>
                      <Avatar
                        mr={2}
                        size="sm"
                        cursor="pointer"
                        name={getSender(loggedUser, chat.users)}
                        src={getSenderFull(loggedUser, chat.users).pic}
                        onClick={() =>
                          profileHandler(
                            getSenderFull(loggedUser, chat.users).pic
                          )
                        }
                      />
                      <Box>
                        <Text>{getSender(loggedUser, chat.users)}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {getLatestMessage(chat)}
                        </Text>
                      </Box>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <Avatar
                        mr={2}
                        size="sm"
                        cursor="pointer"
                        name="Group"
                        src={groupImage}
                        onClick={() =>
                          profileHandler(groupImage)
                        }
                      />
                      <Box>
                        <Text>{chat.chatName}</Text>
                        <HStack>
                          <Tag
                            variant="outline"
                            colorScheme="blue"
                            fontSize="10px"
                          >
                            <TagLabel>Group</TagLabel>
                            <TagRightIcon as={ChatIcon} />
                          </Tag>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {getLatestMessage(chat)}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Box>
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
