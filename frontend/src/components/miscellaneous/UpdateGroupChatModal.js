import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import { axiosReqWithToken } from "../../api/axios";
import UserListItem from "../UserAvatar/UserListItem";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket;

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => console.log("Connected to socket.io"));

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const toast = useToast();

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admin can remove someone!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosReqWithToken.put("/api/chat/groupremove", {
        chatId: selectedChat._id,
        userId: user1._id,
      });

       // Send notification message about member removal
      const message = {
        content: user1._id === user._id 
          ? `${user.name} left the group`
          : `${user1.name} was removed from the group by ${user.name}`,
        chatId: selectedChat._id
      };
      const { data: messageData } = await axiosReqWithToken.post("/api/message", message);
      socket.emit("group update", messageData);

      user1._id === user._id ? setSelectedChat() : selectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
        console.log(error.message);
      toast({
        title: "Error occured!",
        description: error.response
          ? error.response.data.message
          : error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User already in this group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admin can add a member to this group!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      const { data } = await axiosReqWithToken.put("/api/chat/groupadd", {
        chatId: selectedChat._id,
        userId: user1._id,
      });
      
      // Send notification message about new member
      const message = {
        content: `${user1.name} has been added to the group by ${user.name}`,
        chatId: selectedChat._id
      };
      const { data: messageData } = await axiosReqWithToken.post("/api/message", message);
      socket.emit("group update", messageData);
      
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error while adding a new member!",
        description: error.response
          ? error.response.data.message
          : error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const { data } = await axiosReqWithToken.put("/api/chat/rename", {
        chatId: selectedChat._id,
        chatName: groupChatName,
      });
      // Send notification message about group name change
      const message = {
        content: `Group name was changed to "${groupChatName}" by ${user.name}`,
        chatId: selectedChat._id
      };
      const { data: messageData } = await axiosReqWithToken.post("/api/message", message);
      socket.emit("group update", messageData);

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Group name updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setRenameLoading(false);
      onClose();
    } catch (error) {
      console.error("Error during rename:", error);
      toast({
        title: "Error Occurred!",
        description: error.response
          ? error.response.data.message
          : error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosReqWithToken.get(
        `/api/user/searchusers?search=${search}`
      );
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load the search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                handleRename
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add user to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
