import React from 'react';
import interviewJN from '../../assets/img/Noticias/News 2.png';
import CMLogo from '../../assets/logos/CM Logo.png';
import JNLogo from '../../assets/logos/JN Logo.png';
import Coutinho from '../../assets/logos/Coutinho.png';

const Interviews = () => {
  const interviews = [
    {
      title: "The Future of AI in Business",
      description: "An in-depth discussion about how artificial intelligence is transforming modern business practices and what to expect in the coming years.",
      date: "March 15, 2024",
      link: "https://x.com/JornalNoticias/status/1642802512435777536",
      image: interviewJN
    },
    // Add more interviews as needed
  ];

  return (
    <section id="interviews" className="py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Media Appearances
          </h2>
          <p className='text-white'>I've been featured in some of the most prestigious media outlets and big social media profiles. Here are some of my interviews and articles.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((interview, index) => (
            <div key={index} className="rounded-xl overflow-hidden transition-shadow duration-300">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={interview.image} 
                  alt={interview.title}
                  className="w-full h-full object-cover shadow-lg"
                />
              </div>
             
            </div>
          ))}
        </div>
        <div className='flex flex-row justify-center items-center gap-12'>
          <a href="https://www.cmjornal.pt/cmtv/programas/especiais/investigacao-cm/detalhe/conteudos-sexuais-na-internet-rendem-milhares-de-euros-e-dao-vida-de-luxo-a-utilizadores-veja-agora-na-cmtv-cmtv">
          <img src={CMLogo} alt='CM Logo' className='h-12 object-cover rounded opacity-85 shadow-lg'/>
          </a>
          <a href="https://x.com/JornalNoticias/status/1642802512435777536">
          <img src={JNLogo} alt='JN Logo' className='h-12 object-cover rounded opacity-85 shadow-lg'/>
          </a>
          <a href="https://www.youtube.com/watch?v=yr68LJvYDWc">
          <img src={Coutinho} alt='Coutinho' className='h-12 object-cover rounded opacity-85 shadow-lg'/>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Interviews;

