import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { logout } from '../../actions/user';

class Logout extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
  };
  componentWillMount() {
    this.props.logout();
  }

  render() {
    return null;
  }
}

export default connect(null, { logout })(Logout);
