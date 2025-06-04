import React from "react";
import { useTranslation } from "react-i18next";
import InstagramIcon from "../../assets/icons/Instagram.svg";
import TikTokIcon from "../../assets/icons/TikTok.svg";
import LinkedInIcon from "../../assets/icons/LinkedIn.svg";
import TwitterIcon from "../../assets/icons/X Twitter.svg";

function SocialMedia() {
  const { t } = useTranslation();
  const socialLinks = [
    {
      title: t("social_media.platforms.instagram.title"),
      icon: InstagramIcon,
      alt: t("social_media.platforms.instagram.alt"),
      link: "https://www.instagram.com/danieldagalow/",
    },
    {
      title: t("social_media.platforms.tiktok.title"),
      icon: TikTokIcon,
      alt: t("social_media.platforms.tiktok.alt"),
      link: "https://www.tiktok.com/",
    },
    {
      title: t("social_media.platforms.twitter.title"),
      icon: TwitterIcon,
      alt: t("social_media.platforms.twitter.alt"),
      link: "https://x.com/",
    },
    // Add more links here if needed
  ];

  return (
    <section id="social-media" className="py-6 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-black">
          {t("social_media.title")}
        </h2>
        
        <div className="flex flex-col items-center gap-4">
          {socialLinks.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="w-full max-w-lg flex items-center p-4 border-2 border-darkGold rounded-lg text-center shadow-lg transition-transform transform hover:scale-105"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={item.icon}
                alt={item.alt}
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
              <div className="flex-grow font-semibold text-sm md:text-lg text-black">
                {item.title}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialMedia;