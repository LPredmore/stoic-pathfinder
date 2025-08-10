import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

type SEOProps = {
  title: string;
  description?: string;
  image?: string;
  structuredData?: object;
};

const SEO: React.FC<SEOProps> = ({ title, description, image, structuredData }) => {
  const { pathname } = useLocation();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />} 
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      {image && <meta name="twitter:image" content={image} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
