// components/About.js
import React from 'react';

function About() {
  return (
    <section id="about" className="py-16 px-4 bg-gentleGray text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Meet John Doe
        </h2>
        <p className="mb-4">
          I went from overcoming a 10‑year challenge and battling daily habits to building successful businesses, transforming my body in 3 months, and coaching high‑profile figures like Miss Portugal 2019/2020.
        </p>
        <p className="mb-4">
          My journey wasn’t easy, but it taught me that success is not only about hard work—it’s about mindset, strategy, and having a little fun along the way.
        </p>
        <p className="italic">
          My mission? To help you break through barriers and rewrite your own success story.
        </p>
      </div>
    </section>
  );
}

export default About;
