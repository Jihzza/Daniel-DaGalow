import React from "react";
import { useTranslation } from "react-i18next";
import InstagramIcon from "../../assets/icons/Instagram.svg";
import TikTokIcon from "../../assets/icons/TikTok.svg";
import LinkedInIcon from "../../assets/icons/LinkedIn.svg";
import TwitterIcon from "../../assets/icons/X Twitter.svg";

function SocialMedia() {
  const { t } = useTranslation();
  const instagramLink = "https://www.instagram.com/danieldagalow/";
  const tiktokLink = "https://www.tiktok.com/";
  const twitterLink = "https://x.com/";

  return (
    <section id="social-media" className="py-6 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-center text-black">
          {t("social_media.title")}
        </h2>
        
        <div className="flex flex-col gap-6 text-black">
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                title: t("social_media.platforms.instagram.title"),
                icon: (
                  <img
                    src={InstagramIcon}
                    alt={t("social_media.platforms.instagram.alt")}
                    className="w-8 h-8 object-contain"
                  />
                ),
                link: instagramLink,
              },
              {
                title: t("social_media.platforms.tiktok.title"),
                icon: (
                  <img
                    src={TikTokIcon}
                    alt={t("social_media.platforms.tiktok.alt")}
                    className="w-8 h-8 object-contain"
                  />
                ),
                link: tiktokLink,
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
          <div className="flex justify-center">
            <a
              href={twitterLink}
              className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg mb-0 w-[50%] md:w-1/2"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={TwitterIcon}
                alt={t("social_media.platforms.twitter.alt")}
                className="w-8 h-8 object-contain"
              />
              <div className="font-semibold text-[13px] mt-3">
                {t("social_media.platforms.twitter.title")}
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SocialMedia;