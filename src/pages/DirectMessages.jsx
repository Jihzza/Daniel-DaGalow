// src/pages/DirectMessages.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient'; // Adjust path as needed
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import OctagonalProfile from '../components/common/Octagonal Profile'; // Adjust path as needed
import { Send, MessageSquare, Users, ArrowLeft, UserPlus, RefreshCw, Search } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString();
};

function DirectMessagesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Ref for the textarea
  const messageSubscriptionRef = useRef(null);
  const conversationSubscriptionRef = useRef(null);
  const optimisticMessageIdRef = useRef(null);


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to correctly calculate scrollHeight
            const scrollHeight = textarea.scrollHeight;
            // Use maxHeight from Tailwind class (e.g., max-h-28 is 7rem or 112px if 1rem=16px)
            // Or define a pixel value directly
            const maxHeight = 112; // Example for max-h-28 (7rem * 16px/rem)

            if (scrollHeight > maxHeight) {
                textarea.style.height = `${maxHeight}px`;
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.height = `${scrollHeight}px`;
                textarea.style.overflowY = 'hidden'; // Hide scrollbar if content is less than max height
            }
        }
    }, [newMessage]); // Re-run when newMessage changes


  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoadingProfiles(true);
    setError('');
    try {
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id);
      if (profilesError) throw profilesError;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load users.');
    } finally {
      setLoadingProfiles(false);
    }
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    setError('');
    try {
      const { data, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          last_message_at,
          user1_unread_count,
          user2_unread_count,
          user1:profiles!conversations_user1_id_fkey (id, username, avatar_url, full_name),
          user2:profiles!conversations_user2_id_fkey (id, username, avatar_url, full_name)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      if (convError) throw convError;
      const formattedConversations = (data || []).map(conv => {
        const otherUser = conv.user1_id === user.id ? conv.user2 : conv.user1;
        const currentUserIsUser1 = conv.user1_id === user.id;
        const unreadCount = currentUserIsUser1 ? conv.user1_unread_count : conv.user2_unread_count;
        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            username: otherUser.username || otherUser.full_name || 'User',
            avatar_url: otherUser.avatar_url,
          },
          last_message_at: conv.last_message_at,
          unread_count: unreadCount,
        };
      });
      setConversations(formattedConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) { 
        fetchProfiles();
        fetchConversations();
    }
  }, [user, fetchProfiles, fetchConversations]); 

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId || !user) return;
    setLoadingMessages(true);
    setError('');
    try {
      const { data, error: messagesError } = await supabase
        .from('private_messages')
        .select('id, content, created_at, sender_id, receiver_id, is_read')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (messagesError) throw messagesError;
      setMessages(data || []);
      
      const unreadMessagesFromOtherUser = data.filter(msg => msg.receiver_id === user.id && !msg.is_read);
      if (unreadMessagesFromOtherUser.length > 0) {
        const messageIdsToUpdate = unreadMessagesFromOtherUser.map(msg => msg.id);
        await supabase
          .from('private_messages')
          .update({ is_read: true })
          .in('id', messageIdsToUpdate);
        
        const convDetails = await supabase.from('conversations').select('user1_id, user2_id').eq('id', conversationId).single();
        if (convDetails.data) {
            const fieldToUpdate = convDetails.data.user1_id === user.id ? 'user1_unread_count' : 'user2_unread_count';
            await supabase
                .from('conversations')
                .update({ [fieldToUpdate]: 0 })
                .eq('id', conversationId);
            fetchConversations(); 
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (!selectedConversation?.id || !user) {
      if (messageSubscriptionRef.current) {
        supabase.removeChannel(messageSubscriptionRef.current);
        messageSubscriptionRef.current = null;
      }
      return;
    }

    if (messageSubscriptionRef.current) {
      supabase.removeChannel(messageSubscriptionRef.current);
    }
    
    const channel = supabase
      .channel(`private_messages_conv_${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessageFromServer = payload.new;
          setMessages((prevMessages) => {
            const existing = prevMessages.find(m => m.id === newMessageFromServer.id);
            if (existing) return prevMessages.map(m => m.id === newMessageFromServer.id ? newMessageFromServer : m);
            return [...prevMessages, newMessageFromServer];
          });

          if (newMessageFromServer.receiver_id === user.id && document.visibilityState === 'visible') {
            supabase
              .from('private_messages')
              .update({ is_read: true })
              .eq('id', newMessageFromServer.id)
              .then(({error: updateError}) => {
                if (updateError) console.error("Error marking message as read in real-time:", updateError);
                else {
                    supabase.from('conversations').select('user1_id, user2_id').eq('id', selectedConversation.id).single()
                    .then(({data: convData, error: convErr}) => {
                        if (convErr) { console.error("Error fetching conv for unread reset:", convErr); return; }
                        if (convData) {
                            const fieldToUpdate = convData.user1_id === user.id ? 'user1_unread_count' : 'user2_unread_count';
                            supabase
                                .from('conversations')
                                .update({ [fieldToUpdate]: 0 })
                                .eq('id', selectedConversation.id)
                                .then(() => fetchConversations());
                        }
                    });
                }
              });
          } else if (newMessageFromServer.receiver_id === user.id && document.visibilityState !== 'visible') {
            fetchConversations();
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          // console.log(`Subscribed to messages for conversation ${selectedConversation.id}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Subscription error for conversation ${selectedConversation.id}:`, err || status);
          setError(`Real-time connection issue. Status: ${status}`);
        }
      });
    messageSubscriptionRef.current = channel;
    return () => {
      if (messageSubscriptionRef.current) {
        supabase.removeChannel(messageSubscriptionRef.current);
        messageSubscriptionRef.current = null;
      }
    };
  }, [selectedConversation, user, fetchConversations]);

  useEffect(() => {
    if (!user) return;
    if (conversationSubscriptionRef.current) {
        supabase.removeChannel(conversationSubscriptionRef.current);
    }
    const channel = supabase
      .channel('public_conversations_dm_page_themed') 
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(user1_id.eq.${user.id},user2_id.eq.${user.id})`,
        },
        (payload) => {
          fetchConversations();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Subscribed to DM Page conversation updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('DM Page Conversation subscription error:', err || status);
        }
      });
    conversationSubscriptionRef.current = channel;
    return () => {
      if (conversationSubscriptionRef.current) {
        supabase.removeChannel(conversationSubscriptionRef.current);
        conversationSubscriptionRef.current = null;
      }
    };
  }, [user, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStartNewChat = async (profileToChatWith) => {
    if (!user || !profileToChatWith) return;
    setError('');
    setLoadingMessages(true); 
    try {
      const { data: existingConvData, error: existingConvError } = await supabase
        .rpc('create_or_get_conversation', {
            p_user_a_id: user.id,
            p_user_b_id: profileToChatWith.id
        });
      if (existingConvError) throw existingConvError;
      
      const conversationId = existingConvData[0]?.conversation_id_result;
      if (!conversationId) throw new Error("Failed to create or get conversation ID.");

      const { data: convDetails, error: convDetailsError } = await supabase
            .from('conversations')
            .select(`
                id, user1_id, user2_id, last_message_at, user1_unread_count, user2_unread_count,
                user1:profiles!conversations_user1_id_fkey (id, username, avatar_url, full_name),
                user2:profiles!conversations_user2_id_fkey (id, username, avatar_url, full_name)
            `)
            .eq('id', conversationId)
            .single();
      if (convDetailsError) throw convDetailsError;

      const otherUser = convDetails.user1_id === user.id ? convDetails.user2 : convDetails.user1;
      const currentUserIsUser1 = convDetails.user1_id === user.id;
      const unreadCount = currentUserIsUser1 ? convDetails.user1_unread_count : convDetails.user2_unread_count;

      setSelectedConversation({
        id: convDetails.id,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username || otherUser.full_name || 'User',
          avatar_url: otherUser.avatar_url,
        },
        last_message_at: convDetails.last_message_at,
        unread_count: unreadCount
      });
      if (!conversations.find(c => c.id === conversationId)) {
          fetchConversations(); 
      }
    } catch (err) {
      console.error('Error starting new chat:', err);
      setError('Failed to start chat. ' + err.message);
    } finally {
        setLoadingMessages(false);
    }
  };


  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); // Prevent default if called from form submission
    if (!newMessage.trim() || !selectedConversation || !user || sendingMessage) return;

    const tempId = `optimistic_${Date.now()}_${user.id}`; 
    optimisticMessageIdRef.current = tempId;

    const optimisticMessage = {
      id: tempId, 
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      receiver_id: selectedConversation.otherUser.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: false, 
      isOptimistic: true, 
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');
    
    // Reset textarea height after sending
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; 
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust to content or min height
         // If you have a fixed min-height, ensure it doesn't go below that
        const minHeight = 40; // px, should match your CSS min-h-[40px]
        if (textareaRef.current.scrollHeight < minHeight) {
            textareaRef.current.style.height = `${minHeight}px`;
        }
        textareaRef.current.style.overflowY = 'hidden'; // Reset overflow
    }
    
    setSendingMessage(true);
    setError('');
    try {
      const { data: insertedMessage, error: insertError } = await supabase
        .from('private_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          receiver_id: selectedConversation.otherUser.id,
          content: messageToSend,
        })
        .select()
        .single(); 

      if (insertError) {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
        throw insertError;
      }

      setMessages(prevMessages => 
        prevMessages.map(msg => msg.id === tempId ? { ...insertedMessage, isOptimistic: false } : msg)
      );
      optimisticMessageIdRef.current = null;

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Your message was not saved.');
      setMessages(prevMessages => 
        prevMessages.map(msg => msg.id === tempId ? { ...msg, hasError: true, isOptimistic: false } : msg)
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle Enter key to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(); // Call without event
    }
  };
  
  const handleRefresh = () => {
    setError('');
    if (user) { // Ensure user exists before fetching
        fetchProfiles();
        fetchConversations();
        if (selectedConversation) {
          fetchMessages(selectedConversation.id);
        }
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray text-white p-4"
           style={{ paddingTop: 'var(--header-height, 60px)', paddingBottom: 'var(--navbar-height, 50px)' }}
      >
        <MessageSquare size={48} className="mb-4 text-darkGold" />
        <p className="text-xl">Please log in to view your messages.</p>
      </div>
    );
  }

  const filteredConversations = conversations.filter(conv =>
    (conv.otherUser.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (conv.otherUser.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const conversationPartnerIds = new Set(conversations.map(c => c.otherUser.id));
  const profilesForNewChat = searchTerm
    ? profiles.filter(profile =>
        !conversationPartnerIds.has(profile.id) &&
        ((profile.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
         (profile.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
      )
    : [];

  const renderConversationsAndUsersList = () => (
    <div className="h-full flex flex-col bg-oxfordBlue text-white">
      <div className="p-4 border-b border-darkGold/30 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Messages</h1>
        <button onClick={handleRefresh} className="p-2 text-gray-300 hover:text-darkGold" aria-label="Refresh messages">
          <RefreshCw size={20} />
        </button>
      </div>
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat..."
            className="w-full bg-white/5 border border-darkGold/50 text-white placeholder-gray-400 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-darkGold focus:border-darkGold outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      {error && <p className="p-4 text-red-400 bg-red-500/20 rounded-md m-2 text-sm">{error}</p>}
      <div className="flex-grow overflow-y-auto">
        {loadingConversations && <div className="p-4 text-gray-300 text-center">Loading conversations...</div>}
        {!loadingConversations && filteredConversations.length > 0 && (
          <div className="mb-6">
            <h2 className="px-4 py-2 text-sm font-semibold text-darkGold/80">Active Chats</h2>
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center p-3 hover:bg-darkGold/10 cursor-pointer transition-colors duration-150 ${selectedConversation?.id === conv.id ? 'bg-darkGold/20 border-l-2 border-darkGold' : 'border-l-2 border-transparent'}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <OctagonalProfile
                  size={40}
                  imageSrc={conv.otherUser.avatar_url ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${conv.otherUser.avatar_url}` : null}
                  fallbackText={(conv.otherUser.username?.[0] || 'U').toUpperCase()}
                  borderColor="transparent"
                  innerBorderColor={selectedConversation?.id === conv.id ? "#BFA200" : "#001A3A"}
                />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{conv.otherUser.username}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {conv.last_message_at ? `${formatDate(conv.last_message_at)}` : 'No messages yet'}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="ml-2 bg-darkGold text-oxfordBlue text-xs font-bold px-2 py-0.5 rounded-full">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {searchTerm && loadingProfiles && <div className="p-4 text-gray-300 text-center">Searching users...</div>}
        {searchTerm && !loadingProfiles && profilesForNewChat.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-sm font-semibold text-darkGold/80">Start a New Chat with:</h2>
            {profilesForNewChat.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center p-3 hover:bg-darkGold/10 cursor-pointer transition-colors duration-150 border-l-2 border-transparent"
                onClick={() => handleStartNewChat(profile)}
              >
                <OctagonalProfile
                  size={40}
                  imageSrc={profile.avatar_url ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}` : null}
                  fallbackText={(profile.username?.[0] || profile.full_name?.[0] || 'U').toUpperCase()}
                  borderColor="transparent"
                  innerBorderColor="#001A3A"
                />
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{profile.username || profile.full_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingConversations && conversations.length === 0 && !searchTerm && (
            <div className="p-4 text-center text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 text-darkGold/70" />
                No active conversations. Search to start a new chat.
            </div>
        )}
        {searchTerm && !loadingConversations && filteredConversations.length === 0 && !loadingProfiles && profilesForNewChat.length === 0 && (
             <div className="p-4 text-center text-gray-400">No users or conversations match your search.</div>
        )}
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className="h-full flex flex-col bg-gentleGray text-black">
      <div className="flex items-center p-3 border-b border-gray-300 bg-oxfordBlue text-white">
        <button onClick={() => setSelectedConversation(null)} className="mr-3 p-2 text-gray-300 hover:text-darkGold" aria-label="Back to conversations">
          <ArrowLeft size={20} />
        </button>
        {selectedConversation?.otherUser && (
          <>
            <OctagonalProfile
              size={36}
              imageSrc={selectedConversation.otherUser.avatar_url ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedConversation.otherUser.avatar_url}` : null}
              fallbackText={(selectedConversation.otherUser.username?.[0] || 'U').toUpperCase()}
              borderColor="#001A3A"
              innerBorderColor="#BFA200"
            />
            <div className="ml-3">
              <p className="text-sm font-semibold text-white">{selectedConversation.otherUser.username}</p>
            </div>
          </>
        )}
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gentleGray">
        {loadingMessages && <div className="text-center text-gray-500">Loading messages...</div>}
        {error && !loadingMessages && <div className="text-center text-red-600">{error}</div>}
        {!loadingMessages && messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl shadow-md ${
                msg.sender_id === user.id
                  ? 'bg-oxfordBlue text-white rounded-br-none' 
                  : 'bg-white text-oxfordBlue rounded-bl-none border border-gray-300'
              } ${msg.isOptimistic ? 'opacity-70' : ''} ${msg.hasError ? 'bg-red-200 border-red-400 text-red-700 opacity-90' : ''}`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-gray-200' : 'text-gray-500'} text-right`}>
                {msg.isOptimistic && !msg.hasError ? 'Sending...' : formatDate(msg.created_at)}
                {msg.sender_id === user.id && !msg.isOptimistic && !msg.hasError && msg.is_read && <span className="ml-1">✓✓</span>}
                {msg.sender_id === user.id && !msg.isOptimistic && !msg.hasError && !msg.is_read && <span className="ml-1">✓</span>}
                {msg.hasError && <span className="ml-1 text-red-500">(Failed)</span>}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* MODIFIED form and textarea structure */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-300 bg-white">
        <div className="flex items-end bg-gentleGray border border-oxfordBlue/50 rounded-lg"> {/* Changed to items-end */}
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)} // JS will handle resize via useEffect on newMessage
            onKeyDown={handleKeyDown} // For Enter to send, Shift+Enter for newline
            placeholder="Type a message..."
            rows="1" // Start with 1 row height
            className="flex-grow bg-transparent text-oxfordBlue placeholder-gray-500 px-3 py-2 focus:outline-none resize-none block w-full min-h-[40px] max-h-28 overflow-y-hidden" // Added min-h, max-h, and initial overflow-y-hidden
            // Tailwind's max-h-28 corresponds to 7rem (112px if 1rem=16px)
            disabled={sendingMessage || loadingMessages}
          />
          <button
            type="submit"
            className="p-2 text-darkGold hover:text-yellow-600 disabled:opacity-50 disabled:hover:text-darkGold" // p-2 to match shorter input
            disabled={!newMessage.trim() || sendingMessage || loadingMessages}
            aria-label="Send message"
          >
            <Send size={22} />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div
      className="absolute left-0 right-0 flex flex-col bg-gradient-to-b from-oxfordBlue to-gentleGray"
      style={{
        top: 'var(--header-height, 56px)',
        bottom: 'var(--navbar-height, 48px)',
      }}
    >
      {selectedConversation ? renderChatView() : renderConversationsAndUsersList()}
    </div>
  );
}

export default DirectMessagesPage;