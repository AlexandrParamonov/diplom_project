import {
  useEffect,
  useRef,
} from 'react';

import type {
  SupportMessage,
} from '../../types/support';

interface SupportMessageListProps {
  messages: SupportMessage[];
  currentUserId: number;
}

const dateFormatter =
  new Intl.DateTimeFormat(
    'ru-RU',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  );

function SupportMessageList({
  messages,
  currentUserId,
}: SupportMessageListProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop =
      container.scrollHeight;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="support-messages support-messages--empty">
        Сообщений пока нет.
      </div>
    );
  }

  return (
    <div
      className="support-messages"
      ref={containerRef}
      aria-live="polite"
    >
      {messages.map((message) => {
        const isOwn =
          message.senderId
          === currentUserId;

        return (
          <article
            className={
              isOwn
                ? 'support-message support-message--own'
                : 'support-message'
            }
            key={message.id}
          >
            <div className="support-message__meta">
              <strong>
                {isOwn
                  ? 'Вы'
                  : message.sender.name}
              </strong>

              <time
                dateTime={message.createdAt}
              >
                {dateFormatter.format(
                  new Date(
                    message.createdAt,
                  ),
                )}
              </time>
            </div>

            <p>{message.message}</p>
          </article>
        );
      })}
    </div>
  );
}

export default SupportMessageList;
