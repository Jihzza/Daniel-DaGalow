// components/Projects.js
import React from 'react';

function Projects() {
  const projects = [
    {
      name: "Consulting Empire",
      description: "Built a consulting business generating over $150K+ revenue.",
      image: "https://via.placeholder.com/150" // replace with actual image URL or local asset
    },
    {
      name: "Social Media Success",
      description: "Gained viral traction with 200K+ views across multiple platforms.",
      image: "https://via.placeholder.com/150"
    },
    // Add more projects as needed…
  ];

  return (
    <section id="projects" className="py-16 px-4 bg-gentleGray">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          My Ventures
        </h2>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-4">
              <img src={project.image} alt={project.name} className="w-32 h-32 object-cover rounded"/>
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
