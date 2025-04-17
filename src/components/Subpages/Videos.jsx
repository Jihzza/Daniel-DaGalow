import React from 'react';

function Videos() {
  const recommendedPlaylists = [
    {
      title: "Psychology & Mental Health",
      description: "Explore the fascinating world of psychology and mental health. From understanding human behavior to practical mental wellness techniques, this playlist offers valuable insights for personal growth.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Science & Technology",
      description: "Dive into the latest scientific discoveries and technological advancements. From quantum physics to artificial intelligence, stay updated with cutting-edge developments in science and tech.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Mathematics & Problem Solving",
      description: "Master mathematical concepts and develop critical thinking skills. This playlist covers everything from basic arithmetic to advanced calculus, making math accessible and engaging.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Health & Fitness",
      description: "Learn about nutrition, exercise, and overall wellness. Get expert advice on maintaining a healthy lifestyle, workout routines, and understanding your body's needs.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Personal Finance & Investment",
      description: "Build financial literacy and learn smart investment strategies. From budgeting basics to advanced investment techniques, this playlist helps you make informed financial decisions.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Business & Entrepreneurship",
      description: "Discover the fundamentals of business and entrepreneurship. Learn about startup strategies, marketing, leadership, and how to build a successful business from the ground up.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    },
    {
      title: "Philosophy & Critical Thinking",
      description: "Explore philosophical concepts and develop critical thinking skills. From ancient wisdom to modern philosophy, this playlist encourages deep thinking and self-reflection.",
      link: "https://youtube.com/playlist?list=PLGui09W4vFQOwG2OdqyW9XfZ6VIwcFyYH",
    }
  ];

  return (
    <section id="videos" className="py-8 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-6 px-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Educational Resources</h2>
        <p className="text-lg text-white">
          A curated collection of educational content covering essential life subjects. Expand your knowledge and develop new skills through these carefully selected video playlists.
        </p>

        {/* Playlists Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {recommendedPlaylists.map((playlist, index) => (
              <div key={index} className="w-full p-6 rounded-lg shadow-md border-2 border-darkGold">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-xl text-white font-semibold mb-2">{playlist.title}</h3>
                  <p className="text-white mb-4">{playlist.description}</p>
                  <a 
                    href={playlist.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Watch on YouTube
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

export default Videos; 