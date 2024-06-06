import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-10">
      <div className="container mx-auto grid grid-cols-3 gap-4">
        {/* Link Section */}
        <div>
          <ul>
            <li><a href="/home" className="hover:text-gray-300">Home</a></li>
            {/* <li><a href="/faqs" className="hover:text-gray-300">FAQs</a></li>
            <li><a href="/statistics" className="hover:text-gray-300">Statistics</a></li> */}
            <li><a href="/impact-assessment" className="hover:text-gray-300">Impact Assessment</a></li>
            <li><a href="/about-us" className="hover:text-gray-300">About Us</a></li>
          </ul>
        </div>
        {/* Contact Section */}
        <div>
          <p>Phone: <span className="text-gray-400">(+)1 123 456 7893</span></p>
          <p>Email: <span className="text-gray-400">name@email.com</span></p>
        </div>
        {/* Subscription Section */}
        <div>
          <div className="flex items-center mb-4">
            <input type="text" placeholder="Input your email" className="mr-2 p-2 w-full" />
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Subscribe</button>
          </div>
          <div className="flex justify-center space-x-4">
            <FontAwesomeIcon icon={faTwitter} className="h-6 w-6" />
            <FontAwesomeIcon icon={faFacebookF} className="h-6 w-6" />
            <FontAwesomeIcon icon={faLinkedinIn} className="h-6 w-6" />
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 mt-4">
        © 2022 Brand, Inc. · 
        {/* <a href="/privacy" className="hover:text-gray-300">Privacy</a> · <a href="/terms" className="hover:text-gray-300">Terms</a> · <a href="/sitemap" className="hover:text-gray-300">Sitemap</a> */}
      </div>
    </footer>
  );
};

export default Footer;
