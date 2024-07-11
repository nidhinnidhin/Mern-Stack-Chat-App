import React from 'react'
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Tooltip } from '@chakra-ui/react';
import { format, isToday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const formatToIST = (dateString) => {
    const date = new Date(dateString);
    const timeZone = 'Asia/Kolkata';
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'hh:mm a');
  };

  const formatToDate = (dateString) => {
    const date = new Date(dateString);
    const timeZone = 'Asia/Kolkata';
    const zonedDate = toZonedTime(date, timeZone);
    if (isToday(zonedDate)) {
      return 'Today';
    }
    return format(zonedDate, 'dd-MM-yyyy');
  };

  let lastRenderedDate = '';

  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => {
        const messageDate = formatToDate(m.updatedAt);
        const showDate = messageDate !== lastRenderedDate;
        lastRenderedDate = messageDate;

        return (
          <div key={m._id}>
            {showDate && (
              <div style={{ textAlign: 'center', margin: '10px 0', color: 'gray'}}>
                {messageDate}
              </div>
            )}
            <div style={{ display: "flex" }}>
              {(isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement='bottom-start' hasArrow>
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
              <span
                style={{
                  backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}`,
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
                <span style={{ fontSize: "10px", textAlign: "end", color: "gray" }}>
                  {formatToIST(m.updatedAt)}
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </ScrollableFeed>
  );
}

export default ScrollableChat;