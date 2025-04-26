// src/components/Admin/TestimonialReview.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function TestimonialReview() {
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check admin status and fetch testimonials when component mounts or refresh is triggered
  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchPendingTestimonials();
    }
  }, [user, refreshTrigger]);

  const checkTestimonialStatus = async (id) => {
    console.log("Checking database status for testimonial:", id);
    
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, status")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("Database check error:", error);
        return null;
      }
      
      console.log("Database status for testimonial:", data);
      return data;
    } catch (err) {
      console.error("Exception during database check:", err);
      return null;
    }
  };

  // Function to check if current user has admin privileges
  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    try {
      console.log("Checking admin status for user:", user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user role:", error);
        throw error;
      }
      
      console.log("User role data:", data);
      
      if (!data || data.role !== "admin") {
        console.log("User is not an admin, redirecting to home page");
        navigate("/");
        return;
      }
      
      console.log("Admin status confirmed");
    } catch (error) {
      console.error("Admin check failed:", error);
      navigate("/");
    }
  };
  
  // Fetch all pending testimonials
  const fetchPendingTestimonials = async () => {
    try {
      setLoading(true);
      console.log("Fetching pending testimonials...");
      
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching testimonials:", error);
        throw error;
      }
      
      console.log("Pending testimonials fetched:", data?.length || 0);
      console.log("Testimonial data:", data);
      
      setPendingTestimonials(data || []);
    } catch (error) {
      console.error("Error in fetchPendingTestimonials:", error);
      alert(`Error fetching testimonials: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Force refresh the testimonials list
  const refreshTestimonials = () => {
    console.log("Manually refreshing testimonials");
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Handle approving a testimonial
  const handleApprove = async (id) => {
    console.log("=== APPROVAL PROCESS START ===");
    console.log("Approving testimonial ID:", id);
    
    try {
      // Step 1: Check current status before update
      const beforeStatus = await checkTestimonialStatus(id);
      console.log("Before update, testimonial status:", beforeStatus);
      
      if (!beforeStatus || beforeStatus.status !== "pending") {
        console.warn("Cannot approve: Testimonial not found or not pending");
        setPendingTestimonials(prev => prev.filter(t => t.id !== id));
        return;
      }
      
      // Step 2: Perform the update
      console.log("Attempting to update status to 'approved'");
      const { data, error } = await supabase
        .from("testimonials")
        .update({ status: "approved" })
        .eq("id", id)
        .select();
        
      if (error) {
        console.error("UPDATE FAILED:", error);
        alert(`Update failed: ${error.message}`);
        return;
      }
      
      console.log("Update response:", data);
      
      // Step 3: Verify the update worked
      const afterStatus = await checkTestimonialStatus(id);
      console.log("After update, testimonial status:", afterStatus);
      
      if (!afterStatus || afterStatus.status !== "approved") {
        console.error("UPDATE VERIFICATION FAILED: Status not changed to approved");
        alert("Database update failed: Status not changed");
        return;
      }
      
      // Step 4: Update UI state
      console.log("Updating UI state");
      setPendingTestimonials(prev => {
        const newList = prev.filter(t => t.id !== id);
        console.log("Items removed from list:", prev.length - newList.length);
        return newList;
      });
      
      console.log("=== APPROVAL PROCESS COMPLETE ===");
      alert("Testimonial approved successfully!");
      
    } catch (err) {
      console.error("EXCEPTION DURING APPROVAL:", err);
      alert(`Error during approval: ${err.message}`);
    }
  };
  
  // Handle rejecting a testimonial
  const handleReject = async (id) => {
    try {
      console.log("Rejecting testimonial:", id);
      
      // Check if the testimonial still exists and is pending
      const { data: checkData, error: checkError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("id", id)
        .single();
      
      if (checkError) {
        console.error("Error checking testimonial:", checkError);
        throw checkError;
      }
      
      if (!checkData) {
        console.warn("Testimonial not found:", id);
        // Remove from local state
        setPendingTestimonials(prev => prev.filter(t => t.id !== id));
        return;
      }
      
      if (checkData.status !== "pending") {
        console.warn("Testimonial already processed:", id, "Status:", checkData.status);
        // Remove from local state
        setPendingTestimonials(prev => prev.filter(t => t.id !== id));
        return;
      }
      
      // Update the testimonial status
      const { error } = await supabase
        .from("testimonials")
        .update({ status: "rejected" })
        .eq("id", id);
        
      if (error) {
        console.error("Error updating testimonial status:", error);
        throw error;
      }
      
      console.log("Testimonial rejected successfully:", id);
      
      // Remove from list after rejection
      setPendingTestimonials(prev => prev.filter(t => t.id !== id));
      
      alert("Testimonial rejected successfully");
    } catch (error) {
      console.error("Error in handleReject:", error);
      alert(`Failed to reject testimonial: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Testimonial Review Dashboard</h1>
          <button 
            onClick={refreshTestimonials}
            className="px-4 py-2 bg-darkGold text-black font-bold rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Refresh Testimonials
          </button>
        </div>
        
        <div className="bg-gentleGray rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Pending Testimonials</h2>
          
          {pendingTestimonials.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-600">No pending testimonials to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTestimonials.map(testimonial => (
                <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image_url} 
                      alt={testimonial.author}
                      className="w-16 h-16 rounded-full object-cover border-2 border-darkGold mr-4"
                      onError={(e) => {
                        console.error("Image load error:", testimonial.image_url);
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-xl">{testimonial.author}</h3>
                      <p className="text-gray-500 text-sm">
                        Submitted: {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">ID: {testimonial.id}</p>
                    </div>
                  </div>
                  
                  <p className="italic text-gray-700 my-4">"{testimonial.quote}"</p>
                  
                  <div className="flex justify-end space-x-4 mt-4">
                    <button 
                      onClick={() => handleReject(testimonial.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(testimonial.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestimonialReview;