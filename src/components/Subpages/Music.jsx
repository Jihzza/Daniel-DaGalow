import React from 'react';

function Music() {
  const recommendedPlaylists = [
    {
      title: "Classic Rock Essentials",
      description: "A curated selection of timeless rock hits that defined generations. From Led Zeppelin to Pink Floyd, these tracks showcase the golden era of rock music.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Reggae Roots & Culture",
      description: "Immerse yourself in the soulful rhythms of reggae. From Bob Marley to modern reggae artists, this playlist captures the essence of Jamaican music culture.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Jazz Standards Collection",
      description: "The finest collection of jazz classics that shaped the genre. Featuring legends like Miles Davis, John Coltrane, and Ella Fitzgerald.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Electronic Evolution",
      description: "A journey through electronic music's evolution. From ambient to techno, this playlist explores the cutting edge of electronic sound.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Classical Masterpieces",
      description: "Timeless compositions from the greatest classical composers. Perfect for focused work or deep relaxation.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    }
  ];

  return (
    <section className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Music Recommendations
          </h2>
          <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
            A carefully curated collection of exceptional music, filtering through the noise to bring you only the finest songs worth your time.
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
                        Listen on YouTube
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