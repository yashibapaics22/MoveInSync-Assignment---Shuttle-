import React, { Fragment } from 'react';

const Spinner = () => {
  return (
    <Fragment>
      <div className="text-center my-3">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="sr-only">Loading...</span>
        </div>
        <div>Loading...</div>
      </div>
    </Fragment>
  );
};

export default Spinner; 