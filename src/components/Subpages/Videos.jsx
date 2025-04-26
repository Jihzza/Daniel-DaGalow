import React from 'react';

function Videos() {
  const educationalPlaylists = [
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
    <section className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Educational Resources
          </h2>
          <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
            A curated collection of educational content covering essential life subjects. Expand your knowledge and develop new skills through these carefully selected video playlists.
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
                    {playlist.title}
                  </h3>
                  <p className="text-black mb-6 flex-grow">
                    {playlist.description}
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
                      Watch on YouTube
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