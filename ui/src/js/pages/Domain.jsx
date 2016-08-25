import React, { PropTypes } from 'react';
import DomainContainer from '../containers/DomainContainer';

const Domain = ({ params }) => <DomainContainer {...params} />;

Domain.propTypes = {
  params: PropTypes.object,
};

export default Domain;
