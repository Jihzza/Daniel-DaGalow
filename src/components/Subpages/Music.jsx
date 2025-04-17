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

  const recommendedSongs = [
    {
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      genre: "Rock",
      year: "1971",
      youtubeId: "QkF3oxziUI4",
    }
  ];

  return (
    <section id="music" className="py-8 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-6 px-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Music Recommendations</h2>
        <p className="text-lg text-white">
          A carefully curated collection of exceptional music, filtering through the noise to bring you only the finest songs worth your time.
        </p>

        {/* Playlists Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {recommendedPlaylists.map((playlist, index) => (
              <div key={index} className=" w-full p-6 rounded-lg shadow-md border-2 border-darkGold">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-xl text-white font-semibold mb-2">{playlist.title}</h3>
                  <span className="text-sm text-white mb-2">{playlist.genre}</span>
                  <p className="text-white mb-4">{playlist.description}</p>
                  <a 
                    href={playlist.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Listen on YouTube
                  </a>
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