import { useEffect } from 'react';
import PropTypes from 'prop-types';

export function SchemaOrg({ schema }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [schema]);

  return null;
}

SchemaOrg.propTypes = {
  schema: PropTypes.object.isRequired,
};
