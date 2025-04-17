import React from 'react';

const About = () => {
  const sections = [
    {
      title: "My Journey",
      content: "I went from overcoming a 10‑year challenge and battling daily habits to building successful businesses, transforming my body in 3 months, and coaching high‑profile figures like Miss Portugal 2019/2020. My journey wasn't easy, but it taught me that success is not only about hard work—it's about mindset, strategy, and having a little fun along the way."
    },
    {
      title: "My Mission",
      content: "To help you break through barriers and rewrite your own success story. Through personalized coaching, educational content, and community building, I help individuals develop their skills, build their confidence, and achieve their creative aspirations."
    },
    {
      title: "My Approach",
      content: "I believe in a hands-on, practical approach to learning and personal development. My methods combine proven strategies with real-world experience, focusing on mindset transformation, practical skills, and sustainable habits. I emphasize the importance of balance, mental health, and enjoying the journey while achieving your goals."
    }
  ];

  return (
    <section className="py-8 px-4 text-white">
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-8">
            Meet Daniel DaGalow
          </h2>
        </div>

        <div className="rounded-2xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="transform transition-all duration-300 hover:scale-[1.02]">
                <div className="border-2 border-darkGold rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white text-center">{section.title}</h3>
                  {section.content && (
                    <p className="text-white text-center leading-relaxed">{section.content}</p>
                  )}
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <svg className="w-5 h-5 text-darkGold mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-white">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 