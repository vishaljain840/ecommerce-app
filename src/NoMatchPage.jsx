import React, { useEffect } from 'react';

function NoMatchPage(props) {
  useEffect(() => {
    // console.log('Initial render');
    document.title = 'NoPageFound - eCommerce';
  }, []);
  return <h1 classname="text-danger">Page Not Found</h1>;
}

export default NoMatchPage;
