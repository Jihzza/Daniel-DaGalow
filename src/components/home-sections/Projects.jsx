// components/Projects.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import perspectiv from "../../assets/logos/Perspectiv Banner.svg";
import galow from "../../assets/logos/Galow Banner.png";

function Projects() {
  const { t } = useTranslation();

  const projects = [
    {
      name: t("projects.project_1_name"),
      description: t("projects.project_1_description"),
      image: perspectiv
    },
    {
      name: t("projects.project_2_name"),
      description: t("projects.project_2_description"),
      image: galow
    },
    // Add more projects as needed…
  ];

  return (
    <section id="projects" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t("projects.projects_title")}
        </h2>
        <div className="space-y-8 flex flex-col items-center">
          {projects.map((project, index) => (
            <div key={index} className="flex flex-col md:w-[60vw] items-center gap-6 border-2 border-darkGold rounded-lg py-8 px-8">
              <img src={project.image} alt={project.name} className="w-[200px] md:w-[300px] h-auto object-cover rounded"/>
              <div className="text-left md:text-center md:space-y-4">
                <h3 className="text-xl md:text-3xl font-semibold">{project.name}</h3>
                <p className="text-sm md:text-lg">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
