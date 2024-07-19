import React, { useEffect, useState  } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Toast,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { axiosReqWithToken } from "../api/axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import SendIcon from "@mui/icons-material/Send";
import { Tooltip } from "@chakra-ui/react";

const ENDPOINT = "https://mern-stack-chat-app-wu4f.onrender.com";
// const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState();
  const [preview, setPreview] = useState();
  const [fileType, setFileType] = useState("");

  const defaultOption = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRation: "xMidYMid slice",
    },
  };

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosReqWithToken.get(
        `/api/message/${selectedChat._id}`
      );
      console.log(messages);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: "Failed to load the messages",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    // fetchMediaMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        setNewMessage("");
        const { data } = await axiosReqWithToken.post("/api/message", {
          content: newMessage,
          chatId: selectedChat._id,
        });
        console.log("dataaaaaaa", data);

        socket.emit("new message", data);

        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error occured!",
          description: "Failed to send message",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  const handleSendMessage = async () => {
    socket.emit("stop typing", selectedChat._id);
    try {
      setNewMessage("");
      const { data } = await axiosReqWithToken.post("/api/message", {
        content: newMessage,
        chatId: selectedChat._id,
      });
      console.log("dataaaaaaa", data);

      socket.emit("new message", data);

      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: "Failed to send message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeNow >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const imageHandler = (file) => {
    setPreview(URL.createObjectURL(file));
    setFileType(file.type);
    setLoading(true);
    if (file === undefined) {
      toast({
        title: "File is undefined",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    const validVideoTypes = ["video/mp4", "video/mov", "video/avi"];

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dirqllhq2");

    let uploadUrl = "";
    if (validImageTypes.includes(file.type)) {
      uploadUrl = "https://api.cloudinary.com/v1_1/dirqllhq2/image/upload";
    } else if (validVideoTypes.includes(file.type)) {
      uploadUrl = "https://api.cloudinary.com/v1_1/dirqllhq2/video/upload";
    } else {
      toast({
        title: "File type is not valid",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    fetch(uploadUrl, {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setImage(data.url.toString());
        console.log(data.url.toString());
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleSendMedia = async () => {
    socket.emit("stop typing", selectedChat._id);
    try {
      setNewMessage("");
      const { data } = await axiosReqWithToken.post("/api/message/sendimage", {
        media: image,
        chatId: selectedChat._id,
      });

      socket.emit("new message", data);
      setMessages([...messages, data]);
      setPreview("");
    } catch (error) {
      toast({
        title: "Error occured!",
        description: "Failed to send image",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            {preview && (
              <Box
                style={{
                  width: "fit-content",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div>
                  {fileType.startsWith("image/") ? (
                    <img
                      src={preview}
                      height={300}
                      width={300}
                      style={{ borderRadius: "10px" }}
                      alt="preview"
                    />
                  ) : (
                    <video
                      src={preview}
                      height={300}
                      width={300}
                      style={{ borderRadius: "10px" }}
                      controls
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                <Tooltip label="Send media" fontSize="md">
                  {loading ? (
                    <Spinner
                      size="xl"
                      w={10}
                      h={10}
                      alignSelf="center"
                      margin="0px 10px"
                    />
                  ) : (
                    <Button
                      height="50px"
                      width="50px"
                      borderRadius="50%"
                      colorScheme="teal"
                      variant="outline"
                      margin="0px 10px"
                      onClick={handleSendMedia}
                    >
                      <SendIcon />
                    </Button>
                  )}
                </Tooltip>
              </Box>
            )}
            {isTyping ? (
                <div style={{width:"100px"}}>
                  <Lottie
                    options={defaultOption}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}
              display="flex"
            >
              <Button
                as="label"
                htmlFor="file"
                variant="outline"
                colorScheme="teal"
                cursor="pointer"
              >
                <AttachmentIcon />
                <input
                  type="file"
                  id="file"
                  accept="image/*,video/*"
                  onChange={(e) => imageHandler(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </Button>

              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                onChange={typingHandler}
                value={newMessage}
              />
              {!preview && (
                <Tooltip label="Send message" placement="top-start">
                  <Button
                    colorScheme="teal"
                    size="md"
                    onClick={handleSendMessage}
                  >
                    <SendIcon />
                  </Button>
                </Tooltip>
              )}
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="work sans" color="gray">
            Click on a user to start chating
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
