import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { Avatar, Tooltip } from "@chakra-ui/react";
import { format, isToday } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useRef, useEffect } from "react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const scrollableContainer = useRef(null);

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
    // Ensure scroll to bottom when messages change
    if (scrollableContainer.current) {
      scrollableContainer.current.scrollTop = scrollableContainer.current.scrollHeight;
    }
  }, [messages]);

  let lastRenderedDate = "";

  return (
    <ScrollableFeed>
      <div  ref={scrollableContainer} style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)"}}>
      {messages &&
        messages.map((m, i) => {
          const messageDate = formatToDate(m.updatedAt);
          const showDate = messageDate !== lastRenderedDate;
          lastRenderedDate = messageDate;

          const isMedia = m?.content?.startsWith("http://res.cloudinary.com");
          const isImage = isMedia && m?.content?.match(/\.(jpeg|jpg|gif|png)$/);
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
                    />
                  </Tooltip>
                )}
                {isMedia ? (
                  <div
                    style={{
                      marginLeft: isSameSenderMargin(messages, m, i, user._id),
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
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
                      marginLeft: isSameSenderMargin(messages, m, i, user._id),
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
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
