import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faYoutube, faLinkedinIn, faXTwitter } from '@fortawesome/free-brands-svg-icons';


const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {/* Link Section */}
        <div>
          <ul className="space-y-3">
            <li><a href="/home" className="text-primary-foreground hover:text-warning">Home</a></li>
            {/* <li><a href="/faqs" className="hover:text-gray-300">FAQs</a></li>
            <li><a href="/statistics" className="hover:text-gray-300">Statistics</a></li> */}
            <li><a href="/impact-assessment" className="text-primary-foreground hover:text-warning">Impact Assessment</a></li>
            <li><a href="/maps-page" className="text-primary-foreground hover:text-warning">Maps</a></li>
            <li><a href="/methodology" className="text-primary-foreground hover:text-warning">Methodology</a></li>
            {/* <li><a href="/api-documentation" className="text-primary-foreground hover:opacity-80">API</a></li> */}
            {/* <Link to="/api-documentation" className="text-xl text-white hover:text-gray-300">API Documentation</Link> */}
          </ul>
        </div>
        {/* Contact Section */}
        
        {/* Subscription Section */}
        <div>
          <div>
            <p className="text-primary-foreground">For feedback, please contact us at</p>
            <p className="break-words"><span className="text-primary-foreground font-bold">welllabs.jaltol@ifmr.ac.in</span></p>
          </div>
          <hr className="my-4 border-primary-foreground/20" />
          <div className="flex justify-start space-x-4">
            <p className="text-primary-foreground">Follow us on</p>
            <a href="https://twitter.com/WELLLabs_org" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faXTwitter} className="h-6 w-6 text-primary-foreground hover:text-warning transition-colors" />
            </a>
            <a href="https://www.youtube.com/@WellLabs" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faYoutube} className="h-6 w-6 text-primary-foreground hover:text-warning transition-colors" />
            </a>
            <a href="https://www.linkedin.com/company/75552076/" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLinkedinIn} className="h-6 w-6 text-primary-foreground hover:text-warning transition-colors" />
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-primary-foreground/20 text-center text-primary-foreground/80 text-sm">
        © WELL Labs at IFMR
        {/* <a href="/privacy" className="hover:text-gray-300">Privacy</a> · <a href="/terms" className="hover:text-gray-300">Terms</a> · <a href="/sitemap" className="hover:text-gray-300">Sitemap</a> */}
      </div>
    </footer>
  );
};

export default Footer;
