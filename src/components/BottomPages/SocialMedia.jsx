import React from "react";
import InstagramIcon from "../../assets/icons/Instagram.svg";
import TikTokIcon from "../../assets/icons/TikTok.svg";
import LinkedInIcon from "../../assets/icons/LinkedIn.svg";
import TwitterIcon from "../../assets/icons/X Twitter.svg";

function SocialMedia() {
  
  const instagramLink = "https://www.instagram.com/danieldagalow/";
  const tiktokLink = "https://www.tiktok.com/";
  const linkedinLink = "https://www.linkedin.com/";
  const twitterLink = "https://x.com/";

  return (
    <section id="social-media" className="py-6 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-center text-black">Social Media</h2>
        
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 text-black">
          {[
            {
              title: "Instagram",
              icon: (
                <img
                  src={InstagramIcon}
                  alt="Instagram"
                  className="w-8 h-8 object-contain"
                />
              ),
              link: instagramLink,
            },
            {
              title: "TikTok",
              icon: (
                <img
                  src={TikTokIcon}
                  alt="TikTok"
                  className="w-8 h-8 object-contain"
                />
              ),
              link: tiktokLink,
            },
            {
              title: "LinkedIn",
              icon: (
                <img
                  src={LinkedInIcon}
                  alt="LinkedIn"
                  className="w-8 h-8 object-contain"
                />
              ),
              link: instagramLink,
            },
            {
              title: "X / Twitter",
              icon: (
                <img
                  src={TwitterIcon}
                  alt="Twitter"
                  className="w-8 h-8 object-contain"
                />
              ),
              link: twitterLink,
            },
          ].map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg mb-0"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon}
              <div className="font-semibold text-[13px] mt-3">{item.title}</div>
            </a>
          ))}
        </div>
      </div>
      
    </section>
  );
}

export default SocialMedia;