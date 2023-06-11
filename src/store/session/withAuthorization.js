import React from 'react';
import withRouter from 'utils/withRouter';
 import { AuthUserContext } from './context';
import { withFirebase } from '../firebase';

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      console.log("Auth");
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        authUser => {
          if (!condition(authUser)) {
            this.props.history.push('');
          }
        },
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      console.log(this.props);
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser) ? <Component {...this.props} /> : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return    withRouter (withFirebase(WithAuthorization));
};

export default withAuthorization;