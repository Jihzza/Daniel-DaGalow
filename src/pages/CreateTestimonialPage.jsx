import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import defaultProfileIcon from '../assets/img/Pessoas/Default.svg';

export default function CreateTestimonialPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [author, setAuthor] = useState('');
  const [quote, setQuote] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultProfileIcon);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else if (profile) {
          setAuthor(profile.full_name || user.user_metadata?.full_name || '');
          if (profile.avatar_url) {
            const avatarUrl = profile.avatar_url.startsWith('http')
              ? profile.avatar_url
              : `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`;
            setImagePreview(avatarUrl);
          } else if (user.user_metadata?.avatar_url) {
            setImagePreview(user.user_metadata.avatar_url);
          }
        }
      };
      fetchProfile();
    } else {
        navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !quote.trim()) {
      setError(t('testimonials.modal_validation'));
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      let imageUrlToSave = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('testimonials')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('testimonials')
          .getPublicUrl(fileName);
        imageUrlToSave = urlData.publicUrl;
      } else {
        imageUrlToSave = imagePreview;
      }

      const { error: insertError } = await supabase.from('testimonials').insert({
        user_id: user.id,
        author: author.trim(),
        quote: quote.trim(),
        image_url: imageUrlToSave,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setMessage(t('testimonials.modal_success'));
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Testimonial submission error:', err);
      setError(err.message || t('testimonials.modal_error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const loadingSpinner = (
    <span className="flex items-center justify-center">
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {t('testimonials.modal_submitting')}
    </span>
  );


  return (
    <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] overflow-y-auto bg-gradient-to-b from-oxfordBlue to-gentleGray p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="p-2 -ml-2 text-white hover:text-darkGold">
            <ChevronLeft size={28} />
          </Link>
          <h1 className="text-2xl font-bold text-white text-center flex-grow">
            {t('testimonials.leave_testimonial')}
          </h1>
          <div className="w-8"></div>
        </div>

        <div className="bg-oxfordBlue rounded-xl shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {message && <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm">{message}</div>}

            <div className="flex flex-col items-center space-y-3">
                <label className="block text-white font-medium">{t('testimonials.modal_photo_label')}</label>
                <img src={imagePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-darkGold" />
                <label className="cursor-pointer bg-darkGold text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition text-sm font-semibold">
                {t('testimonials.modal_photo_change')}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>

            <div>
                <label htmlFor="author" className="block text-white font-medium mb-1.5">
                {t('testimonials.modal_name_label')}
                </label>
                <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
                required
                />
            </div>

            <div>
                <div className="flex justify-between items-baseline">
                    <label htmlFor="quote" className="block text-white font-medium mb-1.5">
                    {t('testimonials.modal_testimonial_label')}
                    </label>
                    <span className={`text-xs ${quote.length > 250 ? 'text-red-400' : 'text-gray-400'}`}>
                        {quote.length}/250
                    </span>
                </div>
                <textarea
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows="5"
                maxLength="250"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold resize-none"
                placeholder={t('testimonials.modal_testimonial_placeholder')}
                required
                ></textarea>
            </div>

            <div className="flex justify-end pt-2">
                <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-darkGold text-black font-semibold rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                >
                {submitting ? loadingSpinner : t('testimonials.modal_submit')}
                </button>
            </div>
            </form>
        </div>
      </div>
    </main>
  );
}