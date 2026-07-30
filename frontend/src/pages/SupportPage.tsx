import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { FormEvent } from 'react';

import {
  closeClientSupportChat,
  createSupportChat,
  getClientSupportChat,
  getClientSupportChats,
  sendClientSupportMessage,
} from '../api/support';
import SupportChat from '../components/support/SupportChat';
import { useAuth } from '../hooks/useAuth';
import {
  createSupportSocket,
  type SupportSocket,
} from '../socket/support-socket';
import {
  SUPPORT_STATUS_LABELS,
  type SupportChat as SupportChatType,
  type SupportChatSummary,
} from '../types/support';

interface NewChatForm {
  subject: string;
  message: string;
}

const initialNewChatForm: NewChatForm = {
  subject: '',
  message: '',
};

const dateFormatter =
  new Intl.DateTimeFormat(
    'ru-RU',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  );

function SupportPage() {
  const { user } = useAuth();

  const [chats, setChats] =
    useState<SupportChatSummary[]>([]);

  const [selectedChatId, setSelectedChatId] =
    useState<number | null>(null);

  const [activeChat, setActiveChat] =
    useState<SupportChatType | null>(null);

  const [newChatForm, setNewChatForm] =
    useState<NewChatForm>(
      initialNewChatForm,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isChatLoading, setIsChatLoading] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [isSending, setIsSending] =
    useState(false);

  const [isClosing, setIsClosing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const selectedChatIdRef =
    useRef<number | null>(null);

  const socketRef =
    useRef<SupportSocket | null>(null);

  useEffect(() => {
    selectedChatIdRef.current =
      selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    let isCancelled = false;

    const loadSupport = async () => {
      try {
        const loadedChats =
          await getClientSupportChats({
            limit: 100,
          });

        const firstChatId =
          loadedChats[0]?.id ?? null;

        const loadedChat = firstChatId
          ? await getClientSupportChat(
              firstChatId,
            )
          : null;

        if (isCancelled) {
          return;
        }

        setChats(loadedChats);
        setSelectedChatId(firstChatId);
        setActiveChat(loadedChat);
      } catch (loadError: unknown) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить обращения',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSupport();

    return () => {
      isCancelled = true;
    };
  }, []);

  const refreshSupport = useCallback(
    async (
      preferredChatId: number | null,
    ) => {
      try {
        const loadedChats =
          await getClientSupportChats({
            limit: 100,
          });

        const resolvedChatId =
          preferredChatId
          ?? loadedChats[0]?.id
          ?? null;

        const loadedChat = resolvedChatId
          ? await getClientSupportChat(
              resolvedChatId,
            )
          : null;

        setChats(loadedChats);
        setSelectedChatId(
          resolvedChatId,
        );
        setActiveChat(loadedChat);
      } catch (refreshError: unknown) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : 'Не удалось обновить обращения',
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = createSupportSocket();
    socketRef.current = socket;

    const joinSelectedChat = () => {
      const chatId =
        selectedChatIdRef.current;

      if (chatId) {
        socket.emit(
          'support:join',
          { chatId },
        );
      }
    };

    const handleChatCreated = (
      event: { chatId: number },
    ) => {
      void refreshSupport(
        event.chatId,
      );
    };

    const handleChatUpdated = (
      event: { chatId: number },
    ) => {
      void refreshSupport(
        selectedChatIdRef.current
        ?? event.chatId,
      );
    };

    socket.on(
      'connect',
      joinSelectedChat,
    );

    socket.on(
      'support:chat-created',
      handleChatCreated,
    );

    socket.on(
      'support:chat-updated',
      handleChatUpdated,
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [refreshSupport, user]);

  useEffect(() => {
    if (!selectedChatId) {
      return;
    }

    socketRef.current?.emit(
      'support:join',
      {
        chatId: selectedChatId,
      },
    );
  }, [selectedChatId]);

  const handleOpenChat = async (
    id: number,
  ) => {
    setError('');
    setSuccess('');
    setSelectedChatId(id);
    setIsChatLoading(true);

    try {
      const loadedChat =
        await getClientSupportChat(id);

      setActiveChat(loadedChat);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось открыть обращение',
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCreateChat = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      const createdChat =
        await createSupportChat({
          subject:
            newChatForm.subject.trim(),
          message:
            newChatForm.message.trim(),
        });

      const loadedChats =
        await getClientSupportChats({
          limit: 100,
        });

      setChats(loadedChats);
      setSelectedChatId(createdChat.id);
      setActiveChat(createdChat);
      setNewChatForm(
        initialNewChatForm,
      );
      setSuccess(
        'Обращение создано',
      );
    } catch (createError: unknown) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Не удалось создать обращение',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async (
    message: string,
  ): Promise<boolean> => {
    if (!activeChat) {
      return false;
    }

    setError('');
    setSuccess('');
    setIsSending(true);

    try {
      const updatedChat =
        await sendClientSupportMessage(
          activeChat.id,
          { message },
        );

      const loadedChats =
        await getClientSupportChats({
          limit: 100,
        });

      setActiveChat(updatedChat);
      setChats(loadedChats);

      return true;
    } catch (sendError: unknown) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : 'Не удалось отправить сообщение',
      );

      return false;
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (!activeChat) {
      return;
    }

    const confirmed = window.confirm(
      `Закрыть обращение «${activeChat.subject}»?`,
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setIsClosing(true);

    try {
      const updatedChat =
        await closeClientSupportChat(
          activeChat.id,
        );

      const loadedChats =
        await getClientSupportChats({
          limit: 100,
        });

      setActiveChat(updatedChat);
      setChats(loadedChats);
      setSuccess(
        'Обращение закрыто',
      );
    } catch (closeError: unknown) {
      setError(
        closeError instanceof Error
          ? closeError.message
          : 'Не удалось закрыть обращение',
      );
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <section className="support-page section">
      <div className="container">
        <p className="section__eyebrow">
          Помощь пользователям
        </p>

        <h1 className="section__title">
          Техническая поддержка
        </h1>

        <div className="support-workspace">
          <aside className="support-sidebar">
            <form
              className="support-new-form"
              onSubmit={(event) => {
                void handleCreateChat(event);
              }}
            >
              <h2>Новое обращение</h2>

              <label htmlFor="support-subject">
                Тема
              </label>

              <input
                id="support-subject"
                type="text"
                minLength={3}
                maxLength={150}
                required
                value={newChatForm.subject}
                placeholder="Например: проблема с бронированием"
                onChange={(event) =>
                  setNewChatForm({
                    ...newChatForm,
                    subject:
                      event.target.value,
                  })
                }
              />

              <label htmlFor="support-first-message">
                Сообщение
              </label>

              <textarea
                id="support-first-message"
                rows={5}
                maxLength={4000}
                required
                value={newChatForm.message}
                placeholder="Опишите проблему..."
                onChange={(event) =>
                  setNewChatForm({
                    ...newChatForm,
                    message:
                      event.target.value,
                  })
                }
              />

              <button
                className="button button--primary"
                type="submit"
                disabled={
                  isCreating
                  || !newChatForm.subject.trim()
                  || !newChatForm.message.trim()
                }
              >
                {isCreating
                  ? 'Создание...'
                  : 'Создать обращение'}
              </button>
            </form>

            <div className="support-chat-list">
              <h2>Мои обращения</h2>

              {isLoading ? (
                <p>Загрузка...</p>
              ) : chats.length === 0 ? (
                <p className="support-chat-list__empty">
                  Обращений пока нет.
                </p>
              ) : (
                chats.map((chat) => (
                  <button
                    className={
                      chat.id === selectedChatId
                        ? 'support-chat-list__item support-chat-list__item--active'
                        : 'support-chat-list__item'
                    }
                    type="button"
                    key={chat.id}
                    onClick={() => {
                      void handleOpenChat(
                        chat.id,
                      );
                    }}
                  >
                    <span className="support-chat-list__subject">
                      {chat.subject}
                    </span>

                    <span className="support-chat-list__meta">
                      {
                        SUPPORT_STATUS_LABELS[
                          chat.status
                        ]
                      }

                      {' · '}

                      {dateFormatter.format(
                        new Date(
                          chat.lastMessageAt
                          ?? chat.createdAt,
                        ),
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="support-main">
            {error && (
              <p
                className="admin-message admin-message--error"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="admin-message admin-message--success"
                role="status"
              >
                {success}
              </p>
            )}

            {isChatLoading ? (
              <section className="support-chat support-chat--empty">
                <p>Загрузка переписки...</p>
              </section>
            ) : (
              <SupportChat
                key={
                  activeChat?.id
                  ?? 'empty-client-chat'
                }
                chat={activeChat}
                currentUserId={user?.id ?? 0}
                isSending={isSending}
                onSend={handleSendMessage}
                emptyText="Создайте новое обращение или выберите существующее."
                actions={
                  activeChat
                  && activeChat.status
                    !== 'closed' ? (
                    <button
                      className="button button--danger button--small"
                      type="button"
                      disabled={isClosing}
                      onClick={() => {
                        void handleCloseChat();
                      }}
                    >
                      {isClosing
                        ? 'Закрытие...'
                        : 'Закрыть обращение'}
                    </button>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportPage;
