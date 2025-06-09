// src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';

export default function UserManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check for admin role
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError || profile.role !== 'admin') {
          setIsAdmin(false);
          navigate('/'); // Redirect non-admins
          return;
        }

        setIsAdmin(true);

        // Fetch all users if admin
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name, username, email, phone_number, created_at')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);

      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchUsers();
  }, [user, navigate]);

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
          <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">User Management</h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {users.map((u) => (
                <li key={u.id} className="p-4 hover:bg-gray-50 space-y-2">
                  <div>
                     <p className="font-semibold text-lg text-gray-800 break-words">
                        {u.full_name || 'No Name'}
                        {u.username && <span className="ml-2 text-sm font-normal text-gray-500">@{u.username}</span>}
                      </p>
                  </div>
                  <div className="space-y-1">
                     {u.email && (
                        <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0"/>
                            <p className="text-sm text-gray-600 break-words">{u.email}</p>
                        </div>
                      )}
                      {u.phone_number && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0"/>
                          {u.phone_number}
                        </p>
                      )}
                       <p className="text-xs text-gray-400 flex items-center pt-1">
                          <CalendarIcon size={14} className="mr-2 text-gray-400 flex-shrink-0"/>
                          Joined: {new Date(u.created_at).toLocaleDateString()}
                        </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
