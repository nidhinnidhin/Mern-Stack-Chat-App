import React, { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import {
  Avatar,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import { format, isToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useRef, useEffect } from "react";
import { DownloadIcon } from "@chakra-ui/icons";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const scrollableContainer = useRef(null);
  const [preview, setPreview] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenImage,
    onOpen: onOpenImage,
    onClose: onCloseImage,
  } = useDisclosure();

  const toast = useToast();

  const formatToIST = (dateString) => {
    const date = new Date(dateString);
    const timeZone = "Asia/Kolkata";
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, "hh:mm a");
  };

  const formatToDate = (dateString) => {
    const date = new Date(dateString);
    const timeZone = "Asia/Kolkata";
    const zonedDate = toZonedTime(date, timeZone);
    if (isToday(zonedDate)) {
      return "Today";
    }
    return format(zonedDate, "dd-MM-yyyy");
  };

  useEffect(() => {
    if (scrollableContainer.current) {
      scrollableContainer.current.scrollTop =
        scrollableContainer.current.scrollHeight;
    }
  }, [messages]);

  let lastRenderedDate = "";

  const mediaHandler = (media, e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpen();
    setPreview(media);
  };

  const downloadMedia = async (mediaUrl, fileName) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || mediaUrl.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading media:", error);
      toast({
        title: "Error downloading media",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };
  const showProfileImage = (profile) => {
    onOpenImage();
    setPreview(profile);
  };

  return (
    <ScrollableFeed>
      <div
        ref={scrollableContainer}
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
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
              {preview && (
                <>
                  {preview.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <img
                      src={preview}
                      style={{ borderRadius: "10px" }}
                      alt="Preview"
                      height={200}
                      width={250}
                    />
                  ) : (
                    <>
                      <video
                        src={preview}
                        style={{ borderRadius: "10px" }}
                        controls
                        height={200}
                        width={200}
                      />
                    </>
                  )}
                </>
              )}
              <Button
                bg="teal"
                color="white"
                mt={2}
                onClick={() => downloadMedia(preview)}
              >
                <DownloadIcon />
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={isOpenImage} onClose={onCloseImage} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
        <ModalContent
          bg="transparent"
          alignItems="center"
          justifyContent="center"
          boxShadow="none"
        >
          <ModalCloseButton color="white" />
          <ModalBody>
            <img
              src={preview}
              style={{ borderRadius: "10px" }}
              height={500}
              width={300}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

        {messages &&
          messages.map((m, i) => {
            const messageDate = formatToDate(m.updatedAt);
            const showDate = messageDate !== lastRenderedDate;
            lastRenderedDate = messageDate;

            const isMedia = m?.content?.startsWith("http://res.cloudinary.com");
            const isImage =
              isMedia && m?.content?.match(/\.(jpeg|jpg|gif|png)$/);
            const isVideo = isMedia && m?.content?.match(/\.(mp4|mov|avi)$/);

            return (
              <div key={m._id}>
                {showDate && (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "10px 0",
                      color: "gray",
                    }}
                  >
                    {messageDate}
                  </div>
                )}
                <div style={{ display: "flex" }}>
                  {(isSameSender(messages, m, i, user._id) ||
                    isLastMessage(messages, i, user._id)) && (
                    <Tooltip
                      label={m.sender.name}
                      placement="bottom-start"
                      hasArrow
                    >
                      <Avatar
                        mt="7px"
                        mr={1}
                        size="sm"
                        cursor="pointer"
                        name={m.sender.name}
                        src={m.sender.pic}
                        onClick={() => showProfileImage(m.sender.pic)}
                      />
                    </Tooltip>
                  )}

                  {isMedia ? (
                    <div
                      onClick={(e) => mediaHandler(m.content, e)}
                      style={{
                        marginLeft: isSameSenderMargin(
                          messages,
                          m,
                          i,
                          user._id
                        ),
                        marginTop: isSameUser(messages, m, i, user._id)
                          ? 3
                          : 10,
                        borderRadius: "20px",
                        backgroundColor: `${
                          m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                        }`,
                      }}
                    >
                      {isImage ? (
                        <img
                          src={m?.content}
                          alt="Chat Media"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: "20px",
                            cursor: "pointer",
                          }}
                        />
                      ) : (
                        <video
                          src={m.content}
                          controls
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: "20px",
                            cursor: "pointer",
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <span
                        style={{
                          fontSize: "10px",
                          color: "gray",
                          margin: "5px 10px",
                          display: "flex",
                          justifyContent: "end",
                        }}
                      >
                        {formatToIST(m.updatedAt)}
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        backgroundColor: `${
                          m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                        }`,
                        borderRadius: "20px",
                        padding: "5px 15px",
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: isSameSenderMargin(
                          messages,
                          m,
                          i,
                          user._id
                        ),
                        marginTop: isSameUser(messages, m, i, user._id)
                          ? 3
                          : 10,
                      }}
                    >
                      {m.content}
                      <span
                        style={{
                          fontSize: "10px",
                          textAlign: "end",
                          color: "gray",
                        }}
                      >
                        {formatToIST(m.updatedAt)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </ScrollableFeed>
  );
};

export default ScrollableChat;
