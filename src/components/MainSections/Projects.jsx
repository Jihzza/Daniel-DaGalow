// components/Projects.js
import React from 'react';
import perspectiv from "../../assets/Perspectiv Banner.svg";
import galow from "../../assets/Galow Banner.png";

function Projects() {
  const projects = [
    {
      name: "Perspectiv - AI Company",
      description: "A tech startup helping businesses entering the automation age, with custom software solutions.",
      image: perspectiv // replace with actual image URL or local asset
    },
    {
      name: "Galow - Success Club",
      description: "A social club with real world activities and digital software to help successful people connect and achieve their dreams.",
      image: galow
    },
    // Add more projects as needed…
  ];

  return (
    <section id="projects" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          My Ventures
        </h2>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-6 border-2 border-darkGold rounded-lg py-8 px-8">
              <img src={project.image} alt={project.name} className="w-[200px] h-auto object-cover rounded"/>
              <div className="text-left">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <p className="text-sm">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
