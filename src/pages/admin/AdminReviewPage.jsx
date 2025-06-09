// src/pages/admin/AdminReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, User, Mail, Phone, MessageSquare, Bug } from 'lucide-react';

// Reusable component for displaying testimonials
const TestimonialCard = ({ testimonial, onApprove, onReject }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={testimonial.image_url}
          alt={testimonial.author}
          className="w-10 h-10 rounded-full object-cover border-2 border-darkGold"
          onError={(e) => { e.target.src = 'https://placehold.co/40x40/002147/white?text=A'; }}
        />
        <div>
          <h4 className="font-medium text-gray-800">{testimonial.author}</h4>
          <p className="text-xs text-gray-500">{new Date(testimonial.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3">
        <p className="italic text-gray-700 text-sm">"{testimonial.quote}"</p>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => onReject(testimonial.id)} className="px-3 py-1 text-xs border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
          <X size={12} /> Reject
        </button>
        <button onClick={() => onApprove(testimonial.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
          <Check size={12} /> Approve
        </button>
      </div>
    </div>
);

// Reusable component for displaying bug reports
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


export default function AdminReviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('testimonials');
  
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
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
        setIsAdmin(true);

        // Fetch both testimonials and bug reports
        const [{ data: testimonialsData, error: testimonialsError }, { data: bugsData, error: bugsError }] = await Promise.all([
            supabase.from("testimonials").select("*").eq("status", "pending").order("created_at", { ascending: false }),
            supabase.from("bug_reports").select("*").order("created_at", { ascending: false })
        ]);

        if (testimonialsError) throw testimonialsError;
        if (bugsError) throw bugsError;

        setPendingTestimonials(testimonialsData || []);
        setBugReports(bugsData || []);

      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [user, navigate]);

  const handleApprove = async (id) => {
    try {
        const { error } = await supabase.from("testimonials").update({ status: "approved" }).eq("id", id);
        if (error) throw error;
        setPendingTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
        console.error("Error approving testimonial:", err);
    }
  };
  
  const handleReject = async (id) => {
    try {
        const { error } = await supabase.from("testimonials").update({ status: "rejected" }).eq("id", id);
        if (error) throw error;
        setPendingTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
        console.error("Error rejecting testimonial:", err);
    }
  };

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
          <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">Reviews & Reports</h1>
          <div className="w-8"></div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6">
                <button
                    onClick={() => setActiveTab('testimonials')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'testimonials' ? 'border-oxfordBlue text-oxfordBlue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                   <MessageSquare size={16} className="inline-block mr-2" /> Testimonials ({pendingTestimonials.length})
                </button>
                <button
                    onClick={() => setActiveTab('bugs')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bugs' ? 'border-oxfordBlue text-oxfordBlue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    <Bug size={16} className="inline-block mr-2" /> Bug Reports ({bugReports.filter(b => b.status !== 'resolved').length})
                </button>
            </nav>
        </div>

        {/* Content Area */}
        {activeTab === 'testimonials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTestimonials.length > 0 ? (
                    pendingTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} />)
                ) : (
                    <p className="md:col-span-2 text-center text-gray-500 py-10">No pending testimonials.</p>
                )}
            </div>
        )}

        {activeTab === 'bugs' && (
             <div className="space-y-4">
                {bugReports.length > 0 ? (
                    bugReports.map(b => <BugReportCard key={b.id} report={b} onResolve={handleResolveBug} />)
                ) : (
                    <p className="text-center text-gray-500 py-10">No bug reports found.</p>
                )}
            </div>
        )}
      </div>
    </main>
  );
}
