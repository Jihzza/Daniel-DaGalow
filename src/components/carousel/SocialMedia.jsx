import React from "react";
import { useTranslation } from "react-i18next";
import InstagramIcon from "../../assets/icons/Instagram.svg";
import TikTokIcon from "../../assets/icons/TikTok.svg";
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
  ];

  return (
    <section id="social-media" className="py-8 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-black">
          {t("social_media.title")}
        </h2>
        
        {/* Modern, horizontal icon layout */}
        <div className="flex flex-row items-center justify-center gap-6 md:gap-10">
          {socialLinks.map((item, index) => (
            <a
              key={index}
              href={item.link}
              aria-label={item.alt}
              className="group flex h-14 w-14 items-center justify-center rounded-xl border-2 border-darkGold p-3 text-black shadow-lg transition-all duration-300 ease-in-out hover:bg-darkGold hover:shadow-xl hover:scale-110 md:h-16 md:w-16"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={item.icon}
                alt={item.alt}
                className="h-full w-full object-contain transition-transform duration-300 drop-shadow-lg group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialMedia;