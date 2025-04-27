import React from 'react';
import { useTranslation } from 'react-i18next';

function Videos() {
  const { t } = useTranslation();
  
  const educationalPlaylists = [
    {
      key: 'psychology',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      key: 'science',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      key: 'math',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      key: 'health',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      key: 'finance',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      key: 'business',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      key: 'philosophy',
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    }
  ];

  return (
    <section className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            {t('videos.title')}
          </h2>
          <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
            {t('videos.description')}
          </p>
        </div>

        <div className="rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educationalPlaylists.map((playlist, index) => (
              <div 
                key={index} 
                className="transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="bg-gentleGray flex flex-col items-center justify-center rounded-xl text-center shadow-md p-6">
                  <h3 className="text-xl font-semibold text-black mb-3 text-center">
                    {t(`videos.playlists.${playlist.key}.title`)}
                  </h3>
                  <p className="text-black mb-6 flex-grow">
                    {t(`videos.playlists.${playlist.key}.description`)}
                  </p>
                  <div className="mt-auto flex justify-center">
                    <a 
                      href={playlist.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-darkGold text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 inline-flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {t('videos.watch_button')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Videos;