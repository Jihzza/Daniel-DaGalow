// components/About.js
import React from 'react';

function About() {
  return (
    <section id="about" className="py-6 px-4 text-white  text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          Meet Daniel DaGalow
        </h2>
        <div className="space-y-6">
          <p className="mb-6">
            I went from overcoming a 10‑year challenge and battling daily habits to building successful businesses, transforming my body in 3 months, and coaching high‑profile figures like Miss Portugal 2019/2020.
          </p>
          <p className="mb-6">
            My journey wasn't easy, but it taught me that success is not only about hard work—it's about mindset, strategy, and having a little fun along the way.
          </p>
          <p className="italic">
            My mission? To help you break through barriers and rewrite your own success story.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
