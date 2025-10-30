import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Wiser = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [heroContent, setHeroContent] = useState({ title: 'What is Jaltol', body: '' });
  const [sectionOneContent, setSectionOneContent] = useState({ title: 'Section One', body: '' });
  const [sectionTwoContent, setSectionTwoContent] = useState({ title: 'Section Two', body: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const parseMarkdown = (text) => {
      if (!text) return { title: '', body: '' };
      const lines = text.replaceAll('\r\n', '\n').split('\n');
      let titleLine = lines[0] || '';
      if (titleLine.startsWith('# ')) titleLine = titleLine.slice(2);
      const body = lines.slice(1).join('\n').trim();
      return { title: titleLine.trim() || '', body };
    };

    const load = async () => {
      try {
        const [heroRes, secOneRes, secTwoRes] = await Promise.all([
          fetch('/wiser/hero.md'),
          fetch('/wiser/section-01.md'),
          fetch('/wiser/section-02.md')
        ]);

        if (!heroRes.ok || !secOneRes.ok || !secTwoRes.ok) {
          throw new Error('Failed to load content');
        }

        const [heroTxt, secOneTxt, secTwoTxt] = await Promise.all([
          heroRes.text(), secOneRes.text(), secTwoRes.text()
        ]);

        setHeroContent(parseMarkdown(heroTxt));
        setSectionOneContent(parseMarkdown(secOneTxt));
        setSectionTwoContent(parseMarkdown(secTwoTxt));
      } catch (e) {
        setError('Unable to load content');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleMapsClick = () => {
    navigate('/maps-page');
  };

  const handleMethodologyClick = () => {
    navigate('/methodology');
  };

  const handleTryClick = () => {
    navigate('/wiser/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="bg-surface text-gray-800">
        {/* Hero Section (no background image) */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">{heroContent.title}</h1>
              {error ? (
                <p className="text-red-600 mt-4">{error}</p>
              ) : (
                <p className="text-xl md:text-2xl mt-4 text-gray-700" style={{ whiteSpace: 'pre-line' }}>
                  {loading ? 'Loading…' : heroContent.body}
                </p>
              )}
              <br />
              <br />
              <button
                className="mt-6 btn btn-primary hover:bg-warning"
                onClick={handleTryClick}
              >
                View Indicators!
              </button>
            </div>
          </div>
        </section>

        {/* Maps Section (no background image) */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24 flex justify-end">
            <div className="relative z-10 max-w-3xl w-full text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{sectionOneContent.title}</h2>
              {error ? (
                <p className="text-red-600 mt-4">{error}</p>
              ) : (
                <p className="text-xl md:text-2xl font-normal text-gray-700 mt-4" style={{ whiteSpace: 'pre-line' }}>
                  {loading ? 'Loading…' : sectionOneContent.body}
                </p>
              )}
              <br />
              <br />
              <button
                className="mt-6 btn btn-primary hover:bg-warning"
                onClick={handleMapsClick}
              >
                Read more
              </button>
            </div>
          </div>
        </section>

        {/* Methodology Section (no background image) */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{sectionTwoContent.title}</h2>
              {error ? (
                <p className="text-red-600 mt-4">{error}</p>
              ) : (
                <p className="text-xl md:text-2xl text-gray-700 mt-4" style={{ whiteSpace: 'pre-line' }}>
                  {loading ? 'Loading…' : sectionTwoContent.body}
                </p>
              )}
              <br />
              <br />
              <button
                className="mt-6 btn btn-primary hover:bg-warning"
                onClick={handleMethodologyClick}
              >
                Learn more
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section above footer (success theme) */}
        <section className="bg-success text-white">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 lg:py-20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h3 className="text-3xl md:text-4xl font-bold">Ready to explore?</h3>
              <p className="text-lg md:text-xl mt-2 opacity-90">Click to explore the WISER dashboard.</p>
            </div>
            <div>
              <button className="btn bg-white text-success hover:bg-warning" onClick={handleTryClick}>
                View Indicators!
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Wiser;


