import { Link } from 'react-router-dom';

const socialLinks = [
  {
    name: 'ВКонтакте',
    url: 'https://vk.com',
    icon: '/assets/social-vk.svg',
  },
  {
    name: 'Telegram',
    url: 'https://telegram.org',
    icon: '/assets/social-telegram.svg',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    icon: '/assets/social-youtube.svg',
  },
  {
    name: 'Одноклассники',
    url: 'https://ok.ru',
    icon: '/assets/social-odnoklassniki.svg',
  },
];

function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div className="container footer__container">
        <Link className="logo footer__logo" to="/">
          КнигоПоиск
        </Link>

        <div className="footer__socials">
          {socialLinks.map((social) => (
            <a
              className="footer__social-link"
              href={social.url}
              key={social.name}
              target="_blank"
              rel="noreferrer"
              aria-label={social.name}
            >
              <img src={social.icon} alt="" />
            </a>
          ))}
        </div>

        <p className="footer__copyright">
          © 2026 КнигоПоиск. Учебный дипломный проект.
        </p>
      </div>
    </footer>
  );
}

export default Footer;