import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Component to handle redirects from .md URLs to clean URLs
const DocRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug?.endsWith('.md')) {
      const cleanSlug = slug.replace(/\.md$/, '');
      navigate(`/docs/${cleanSlug}`, { replace: true });
    }
  }, [slug, navigate]);

  return null;
};

export default DocRedirect;
