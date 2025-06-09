// src/pages/profile/ChatHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ChatHistoryPage({ onChatOpen }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('id, title, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        setSessions(data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleOpenChat = (sessionId) => {
    if (onChatOpen && typeof onChatOpen === 'function') {
        onChatOpen(sessionId);
    }
  }

  if (loading) {
    return (
        <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
        </main>
    );
  }

  return (
    <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link to="/profile" className="p-2 -ml-2 text-gray-700 hover:text-oxfordBlue">
                    <ChevronLeft size={28} />
                </Link>
                <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">Chat History</h1>
                 <div className="w-8"></div>
            </div>
            {sessions.length === 0 ? (
                 <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-center text-gray-500">You have no chat history.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                {sessions.map(session => (
                    <li key={session.id} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-oxfordBlue hover:bg-gray-50 cursor-pointer transition-all hover:shadow-lg" onClick={() => handleOpenChat(session.id)}>
                    <p className="font-semibold text-lg text-gray-800">{session.title || 'Chat Session'}</p>
                    <p className="text-sm text-gray-500">
                        Last activity: {new Date(session.updated_at).toLocaleString()}
                    </p>
                    </li>
                ))}
                </ul>
            )}
        </div>
    </main>
  );
}
