// src/pages/admin/TestimonialReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X } from 'lucide-react';

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

export default function TestimonialReviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);

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

        const { data: testimonialsData, error: testimonialsError } = await supabase.from("testimonials").select("*").eq("status", "pending").order("created_at", { ascending: false });
        if (testimonialsError) throw testimonialsError;
        setPendingTestimonials(testimonialsData || []);

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
          <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">Testimonial Review</h1>
          <div className="w-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTestimonials.length > 0 ? (
                pendingTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} />)
            ) : (
                <p className="md:col-span-2 text-center text-gray-500 py-10">No pending testimonials.</p>
            )}
        </div>
      </div>
    </main>
  );
}
