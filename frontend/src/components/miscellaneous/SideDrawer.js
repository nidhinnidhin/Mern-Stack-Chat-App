import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Spinner,
  Tooltip,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import ChatLoading from "../ChatLoading";
import { axiosReqWithContentType, axiosReqWithToken } from "../../api/axios";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { getSender } from "../../config/ChatLogics";
import Badge from "@mui/material/Badge";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const toast = useToast();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    setLoading(true);
    console.log("Clicked");
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-left",
      });
      setLoading(false);
      return;
    }
    try {
      const { data } = await axiosReqWithToken.get(
        `/api/user/searchusers?search=${search}`
      );
      console.log(data);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
    console.log("Closed");
  };

  const accessChat = async (userId) => {
    console.log(user.token);
    try {
      setLoadingChat(true);
      const userAlreadyExists = chats.some(chat => {
        if (!chat.isGroupChat) {
          return chat.users.some(chatUser => chatUser._id === userId);
        }
        return false;
      });
  
      if (userAlreadyExists) {
        toast({
          title: "User already exists",
          description: "This user is already in your chat list",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onClose()
        setLoadingChat(false);
        return;
      }
  
      const { data } = await axiosReqWithToken.post("/api/chat", { userId });
      onClose();
  
      console.log(data);
  
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
    } catch (error) {
      toast({
        title: "Error fetching the chats",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  const searchHandler = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosReqWithToken.get(
        `/api/user/searchusers?search=${search}`
      );
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
    }
  };

  

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i class="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Lets Talk
        </Text>
        <div>
          <Menu>
  <Tooltip label="Notification" hasArrow placement="bottom">
    <MenuButton p={2}>
      <ThemeProvider theme={theme}>
        <Badge badgeContent={notification.length} color="error">
          <NotificationsIcon />
        </Badge>
      </ThemeProvider>
    </MenuButton>
  </Tooltip>
  <MenuList pl={2}>
    {!notification.length && "No New Messages"}
    {/* Group notifications by chat */}
    {Object.values(
      notification.reduce((acc, n) => {
        const chatId = n.chat._id;
        if (!acc[chatId]) {
          acc[chatId] = {
            chat: n.chat,
            count: 1,
            lastMessage: n,
          };
        } else {
          acc[chatId].count += 1;
          acc[chatId].lastMessage = n;
        }
        return acc;
      }, {})
    ).map((groupedNotif) => (
      <MenuItem
        key={groupedNotif.chat._id}
        onClick={() => {
          setSelectedChat(groupedNotif.chat);
          // Remove all notifications for this chat
          setNotification(
            notification.filter((n) => n.chat._id !== groupedNotif.chat._id)
          );
        }}
      >
        {groupedNotif.chat.isGroupChat
          ? `${groupedNotif.count} new message${
              groupedNotif.count > 1 ? "s" : ""
            } in ${groupedNotif.chat.chatName}`
          : `${groupedNotif.count} new message${
              groupedNotif.count > 1 ? "s" : ""
            } from ${getSender(user, groupedNotif.chat.users)}`}
      </MenuItem>
    ))}
  </MenuList>
</Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={onOpenModal}>Logout</MenuItem>
              <Modal isOpen={isOpenModal} onClose={onCloseModal}>
                <ModalOverlay />
                <ModalContent maxWidth="400px">
                  <ModalHeader textAlign="center">{user.name}</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Box textAlign="center">
                      Are you sure, you want to logout?
                    </Box>
                  </ModalBody>
                  <ModalFooter justifyContent="center">
                    <Button colorScheme="red" mr={3} onClick={logoutHandler}>
                      Logout
                    </Button>
                    <Button colorScheme="blue" onClick={onCloseModal}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => searchHandler(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
