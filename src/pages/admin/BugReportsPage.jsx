// src/pages/admin/BugReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';

const BugReportCard = ({ report, onResolve }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
             <p className="font-semibold text-gray-800 break-words">{report.name || 'Anonymous'}</p>
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${report.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {report.status}
            </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600 mb-3">
            {report.email && <div className="flex items-center"><Mail size={14} className="mr-2 text-gray-400" />{report.email}</div>}
        </div>
        <div className="px-3 py-3 bg-gray-50 rounded-lg">
             <p className="text-gray-700 text-sm whitespace-pre-wrap">{report.description}</p>
        </div>
        <div className="flex justify-end mt-3">
            {report.status !== 'resolved' && (
                <button onClick={() => onResolve(report.id)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                    Mark as Resolved
                </button>
            )}
        </div>
    </div>
);

export default function BugReportsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bugReports, setBugReports] = useState([]);
  
    useEffect(() => {
      const checkAdminAndFetchData = async () => {
        if (!user) {
          navigate('/login');
          return;
        }
        try {
          const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          if (profileError || profile.role !== 'admin') {
            navigate('/');
            return;
          }

          const { data: bugsData, error: bugsError } = await supabase.from("bug_reports").select("*").order("created_at", { ascending: false });
          if (bugsError) throw bugsError;
          setBugReports(bugsData || []);
  
        } catch (error) {
          console.error('Error:', error.message);
        } finally {
          setLoading(false);
        }
      };
      checkAdminAndFetchData();
    }, [user, navigate]);
  
    const handleResolveBug = async (id) => {
        try {
            const { error } = await supabase.from("bug_reports").update({ status: "resolved" }).eq("id", id);
            if (error) throw error;
            setBugReports(prev => prev.map(b => b.id === id ? { ...b, status: 'resolved' } : b));
        } catch (err) {
            console.error("Error resolving bug:", err);
        }
    };
  
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
            <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">Bug Reports</h1>
            <div className="w-8"></div>
          </div>
           <div className="space-y-4">
              {bugReports.length > 0 ? (
                  bugReports.map(b => <BugReportCard key={b.id} report={b} onResolve={handleResolveBug} />)
              ) : (
                  <p className="text-center text-gray-500 py-10">No bug reports found.</p>
              )}
          </div>
        </div>
      </main>
    );
}
