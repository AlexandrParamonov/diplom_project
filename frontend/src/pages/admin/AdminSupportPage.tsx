import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  getAdminSupportChat,
  getAdminSupportChats,
  sendAdminSupportMessage,
  updateSupportChatStatus,
} from '../../api/support';
import SupportChat from '../../components/support/SupportChat';
import { useAuth } from '../../hooks/useAuth';
import {
  createSupportSocket,
  type SupportSocket,
} from '../../socket/support-socket';
import {
  SUPPORT_STATUSES,
  SUPPORT_STATUS_LABELS,
  type SupportChat as SupportChatType,
  type SupportChatStatus,
  type SupportChatSummary,
} from '../../types/support';

const dateFormatter =
  new Intl.DateTimeFormat(
    'ru-RU',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  );

function AdminSupportPage() {
  const { user } = useAuth();

  const [chats, setChats] =
    useState<SupportChatSummary[]>([]);

  const [selectedChatId, setSelectedChatId] =
    useState<number | null>(null);

  const [activeChat, setActiveChat] =
    useState<SupportChatType | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<SupportChatStatus | ''>('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isChatLoading, setIsChatLoading] =
    useState(false);

  const [isSending, setIsSending] =
    useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const selectedChatIdRef =
    useRef<number | null>(null);

  const statusFilterRef =
    useRef<SupportChatStatus | ''>('');

  const socketRef =
    useRef<SupportSocket | null>(null);

  useEffect(() => {
    selectedChatIdRef.current =
      selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    statusFilterRef.current =
      statusFilter;
  }, [statusFilter]);

  useEffect(() => {
    let isCancelled = false;

    const loadSupport = async () => {
      try {
        const loadedChats =
          await getAdminSupportChats({
            status:
              statusFilter || undefined,
            limit: 200,
          });

        const previousChatId =
          selectedChatIdRef.current;

        const resolvedChatId =
          loadedChats.some(
            (chat) =>
              chat.id === previousChatId,
          )
            ? previousChatId
            : loadedChats[0]?.id ?? null;

        const loadedChat = resolvedChatId
          ? await getAdminSupportChat(
              resolvedChatId,
            )
          : null;

        if (isCancelled) {
          return;
        }

        setChats(loadedChats);
        setSelectedChatId(
          resolvedChatId,
        );
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
  }, [statusFilter]);

  const refreshSupport = useCallback(
    async (
      preferredChatId: number | null,
    ) => {
      try {
        const loadedChats =
          await getAdminSupportChats({
            status:
              statusFilterRef.current
              || undefined,
            limit: 200,
          });

        const resolvedChatId =
          loadedChats.some(
            (chat) =>
              chat.id === preferredChatId,
          )
            ? preferredChatId
            : loadedChats[0]?.id ?? null;

        const loadedChat = resolvedChatId
          ? await getAdminSupportChat(
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

    const handleChatChange = (
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
      handleChatChange,
    );

    socket.on(
      'support:chat-updated',
      handleChatChange,
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
        await getAdminSupportChat(id);

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
        await sendAdminSupportMessage(
          activeChat.id,
          { message },
        );

      setActiveChat(updatedChat);

      await refreshSupport(
        updatedChat.id,
      );

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

  const handleStatusChange = async (
    status: SupportChatStatus,
  ) => {
    if (!activeChat) {
      return;
    }

    const confirmed = window.confirm(
      `Изменить статус обращения №${activeChat.id} на «${SUPPORT_STATUS_LABELS[status]}»?`,
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setIsUpdatingStatus(true);

    try {
      const updatedChat =
        await updateSupportChatStatus(
          activeChat.id,
          status,
        );

      setActiveChat(updatedChat);
      setSuccess(
        'Статус обращения обновлён',
      );

      await refreshSupport(
        updatedChat.id,
      );
    } catch (updateError: unknown) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить статус',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="admin-panel support-admin-panel">
      <div className="admin-panel__header">
        <div>
          <h2>Техническая поддержка</h2>

          <p>
            Обращения пользователей и
            переписка в реальном времени.
          </p>
        </div>

        <label className="support-filter">
          <span>Статус</span>

          <select
            value={statusFilter}
            onChange={(event) => {
              setError('');
              setSuccess('');
              setIsLoading(true);
              setStatusFilter(
                event.target.value as
                  | SupportChatStatus
                  | '',
              );
            }}
          >
            <option value="">
              Все обращения
            </option>

            {SUPPORT_STATUSES.map(
              (status) => (
                <option
                  value={status}
                  key={status}
                >
                  {
                    SUPPORT_STATUS_LABELS[
                      status
                    ]
                  }
                </option>
              ),
            )}
          </select>
        </label>
      </div>

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

      <div className="support-workspace support-workspace--admin">
        <aside className="support-sidebar support-sidebar--admin">
          <div className="support-chat-list support-chat-list--admin">
            <h2>Обращения</h2>

            {isLoading ? (
              <p>Загрузка...</p>
            ) : chats.length === 0 ? (
              <p className="support-chat-list__empty">
                Обращения не найдены.
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

                  <span className="support-chat-list__client">
                    {chat.client.name}
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
          {isChatLoading ? (
            <section className="support-chat support-chat--empty">
              <p>Загрузка переписки...</p>
            </section>
          ) : (
            <SupportChat
              key={
                activeChat?.id
                ?? 'empty-admin-chat'
              }
              chat={activeChat}
              currentUserId={user?.id ?? 0}
              isSending={isSending}
              onSend={handleSendMessage}
              emptyText="Выберите обращение пользователя."
              actions={
                activeChat ? (
                  <div className="support-status-actions">
                    {SUPPORT_STATUSES
                      .filter(
                        (status) =>
                          status
                          !== activeChat.status,
                      )
                      .map((status) => (
                        <button
                          className={
                            status === 'closed'
                              ? 'button button--danger button--small'
                              : 'button button--secondary button--small'
                          }
                          type="button"
                          key={status}
                          disabled={
                            isUpdatingStatus
                          }
                          onClick={() => {
                            void handleStatusChange(
                              status,
                            );
                          }}
                        >
                          {
                            SUPPORT_STATUS_LABELS[
                              status
                            ]
                          }
                        </button>
                      ))}
                  </div>
                ) : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSupportPage;
