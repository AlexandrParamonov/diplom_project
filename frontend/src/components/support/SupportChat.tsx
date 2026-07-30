import { useState } from 'react';
import type {
  FormEvent,
  ReactNode,
} from 'react';

import {
  SUPPORT_STATUS_LABELS,
  type SupportChat as SupportChatType,
} from '../../types/support';
import SupportMessageList from './SupportMessageList';

interface SupportChatProps {
  chat: SupportChatType | null;
  currentUserId: number;
  isSending: boolean;
  onSend: (
    message: string,
  ) => Promise<boolean>;
  actions?: ReactNode;
  emptyText?: string;
}

function SupportChat({
  chat,
  currentUserId,
  isSending,
  onSend,
  actions,
  emptyText =
    'Выберите обращение в списке.',
}: SupportChatProps) {
  const [message, setMessage] =
    useState('');

  if (!chat) {
    return (
      <section className="support-chat support-chat--empty">
        <h2>Чат поддержки</h2>
        <p>{emptyText}</p>
      </section>
    );
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedMessage =
      message.trim();

    if (!normalizedMessage) {
      return;
    }

    const sent = await onSend(
      normalizedMessage,
    );

    if (sent) {
      setMessage('');
    }
  };

  return (
    <section className="support-chat">
      <header className="support-chat__header">
        <div>
          <span className="support-chat__number">
            Обращение №{chat.id}
          </span>

          <h2>{chat.subject}</h2>

          <p>
            {chat.assignedTo
              ? `Ответственный: ${chat.assignedTo.name}`
              : 'Ответственный пока не назначен'}
          </p>
        </div>

        <div className="support-chat__header-actions">
          <span
            className={
              `support-status support-status--${chat.status}`
            }
          >
            {
              SUPPORT_STATUS_LABELS[
                chat.status
              ]
            }
          </span>

          {actions}
        </div>
      </header>

      <SupportMessageList
        messages={chat.messages}
        currentUserId={currentUserId}
      />

      {chat.status === 'closed' ? (
        <p className="support-chat__closed">
          Обращение закрыто. Отправка новых
          сообщений недоступна.
        </p>
      ) : (
        <form
          className="support-message-form"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <label htmlFor="support-message">
            Новое сообщение
          </label>

          <textarea
            id="support-message"
            rows={4}
            maxLength={4000}
            required
            value={message}
            placeholder="Введите сообщение..."
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
          />

          <button
            className="button button--primary"
            type="submit"
            disabled={
              isSending
              || !message.trim()
            }
          >
            {isSending
              ? 'Отправка...'
              : 'Отправить'}
          </button>
        </form>
      )}
    </section>
  );
}

export default SupportChat;
