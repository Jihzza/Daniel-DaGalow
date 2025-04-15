// components/Projects.js
import React from 'react';
import perspectiv from "../../assets/Perspectiv.png";
import galow from "../../assets/Galow.png";

function Projects() {
  const projects = [
    {
      name: "Consulting Empire",
      description: "Built a consulting business generating over $150K+ revenue.",
      image: perspectiv // replace with actual image URL or local asset
    },
    {
      name: "Social Media Success",
      description: "Gained viral traction with 200K+ views across multiple platforms.",
      image: galow
    },
    // Add more projects as needed…
  ];

  return (
    <section id="projects" className="py-16 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          My Ventures
        </h2>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-4 border border-oxfordBlue rounded-lg py-4 px-8">
              <img src={project.image} alt={project.name} className="w-24 h-auto object-cover rounded"/>
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
