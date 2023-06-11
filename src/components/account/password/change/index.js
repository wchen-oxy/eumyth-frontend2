import React, { Component } from 'react';
import { withFirebase } from '../../../../store/firebase';

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
}

class PasswordChange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...INITIAL_STATE
    };

    this.handlePasswordUpdateSubmit = this.handlePasswordUpdateSubmit.bind(this);
    this.handleTextUpdate = this.handleTextUpdate.bind(this);
  }

  handlePasswordUpdateSubmit(event) {
    event.preventDefault();
    const { passwordOne } = this.state;
    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  handleTextUpdate(event) {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { passwordOne, passwordTwo, error } = this.state;
    const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

    return (
      <div id='passwordchange'>
        <label className="label-form">Update Password</label>
        <form
          className="form-med"
          onSubmit={this.handlePasswordUpdateSubmit}>
          <input
            name='passwordOne'
            className='input-single'
            value={passwordOne}
            onChange={this.handleTextUpdate}
            type='password'
            placeholder='New Password'
          />
          <input
            name='passwordTwo'
            className='input-single'
            value={passwordTwo}
            onChange={this.handleTextUpdate}
            type='password'
            placeholder='Confirm New Password'
          />
          <button
            className='btn-round'
            disabled={isInvalid}
            type='submit'
          >
            Reset My Password
          </button>
          {error && <p>{error.message}</p>}
        </form>
      </div>
    );
  }
}

export default withFirebase(PasswordChange);