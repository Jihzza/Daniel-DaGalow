import React from 'react';

const Achievements = () => {
  const achievements = [
    {
      title: "Content Creation",
      items: [
        "Created 100+ educational videos",
        "Built a community of 10,000+ followers",
        "Developed unique teaching methodologies",
        "Received positive feedback from students worldwide"
      ]
    },
    {
      title: "Coaching & Mentoring",
      items: [
        "Helped 500+ students achieve their goals",
        "Developed personalized coaching programs",
        "Created comprehensive learning materials",
        "Maintained 95% student satisfaction rate"
      ]
    },
    {
      title: "Business Growth",
      items: [
        "Established successful online presence",
        "Developed multiple revenue streams",
        "Built strong brand recognition",
        "Created scalable business models"
      ]
    }
  ];

  return (
    <section className="py-8 px-4 text-white">
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-8">
            Achievements & Milestones
          </h2>
        </div>

        <div className="rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((category, index) => (
              <div key={index} className="transform transition-all duration-300 hover:scale-[1.02]">
                <div className="border border-darkGold rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white text-center ">{category.title}</h3>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-darkGold mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-white">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements; 