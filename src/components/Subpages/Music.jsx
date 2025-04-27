import React from 'react';
import { useTranslation } from 'react-i18next';

function Music() {
  const { t } = useTranslation();
  
  const recommendedPlaylists = [
    {
      title: t('music.playlists.classic_rock.title'),
      description: t('music.playlists.classic_rock.description'),
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: t('music.playlists.reggae.title'),
      description: t('music.playlists.reggae.description'),
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: t('music.playlists.jazz.title'),
      description: t('music.playlists.jazz.description'),
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: t('music.playlists.electronic.title'),
      description: t('music.playlists.electronic.description'),
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: t('music.playlists.classical.title'),
      description: t('music.playlists.classical.description'),
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    }
  ];

  return (
    <section className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            {t('music.title')}
          </h2>
          <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
            {t('music.description')}
          </p>
        </div>

        <div className="rounded-2xl">
          <div className="space-y-6">
            {recommendedPlaylists.map((playlist, index) => (
              <div 
                key={index} 
                className="transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="bg-gentleGray rounded-xl shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-grow text-center md:text-left md:pr-6">
                      <h3 className="text-xl font-semibold text-black mb-2">
                        {playlist.title}
                      </h3>
                      <p className="text-black mb-4 md:mb-0">
                        {playlist.description}
                      </p>
                    </div>
                    <div className="flex justify-center md:justify-end">
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
                        {t('music.listen_button')}
                      </a>
                    </div>
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

export default Music;