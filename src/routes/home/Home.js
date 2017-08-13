import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Header from '../../components/Header';
import Layout from '../../components/KanbanLayout';
import Page from '../../components/Page';
import LoginButton from '../../components/LoginButton';
import s from './Home.css';
import screenshot from './screenshot.png';
import text from './Home.md';

class Home extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };
  render() {
    return (
      <div>
        <Header />
        <LoginButton />
        <div className={s.screenshot}><img className={s.screenshotImage} alt="screenshot of the app" src={screenshot} /></div>
        <div className={s.bottom}><Page title="" {...text} /></div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
