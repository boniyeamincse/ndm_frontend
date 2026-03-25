import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import blogService from '../services/blogService';
import { newsArticles as fallbackNewsArticles } from '../data';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const result = await blogService.getPublicNews({ per_page: 24 });
      const apiArticles = result?.data ?? [];

      if (apiArticles.length > 0) {
        setArticles(apiArticles);
      } else {
        setArticles(fallbackNewsArticles);
      }
      setError('');
    } catch {
      setArticles(fallbackNewsArticles);
      setError('Live news feed is temporarily unavailable. Showing saved highlights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 min-h-[70vh]"
    >
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Latest News</h1>
        <p className="text-gray-600 max-w-2xl mb-3">
          Updates, announcements, and movement highlights from NDM Student chapters across Bangladesh.
        </p>
        {error && <p className="text-sm text-amber-700 mb-6">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((item) => {
              const tag = item.category || item.tag || 'News';
              const title = item.title;
              const excerpt = item.excerpt;
              const dateText = item.published_at
                ? new Date(item.published_at).toLocaleDateString()
                : item.date;
              const authorName = item.author?.name || item.author || 'NDM Desk';
              const readTime = item.readTime || `${Math.max(1, Math.ceil((item.content || '').split(/\s+/).length / 220))} min`;
              const coverStyle = item.cover_image_url
                ? { backgroundImage: `url(${item.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : undefined;

              return (
                <article key={item.id || item.slug || title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div
                    className={`h-44 ${coverStyle ? '' : 'bg-gradient-to-r from-primary to-primary-dark'}`}
                    style={coverStyle}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                      <span className="text-gray-500">{readTime}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-primary-dark mb-3">{title}</h2>
                    <p className="text-gray-600 mb-4">{excerpt}</p>
                    <p className="text-sm text-gray-500">{dateText} · {authorName}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default News;
