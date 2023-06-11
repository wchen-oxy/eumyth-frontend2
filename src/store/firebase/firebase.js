import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyC9sBHK-evjecmuWQsQHoE-iSJmHUcIBcE',
  authDomain: 'eumyth-65330.firebaseapp.com',
  databaseURL: 'https://eumyth-65330.firebaseio.com',
  projectId: 'eumyth-65330',
  storageBucket: 'eumyth-65330.appspot.com',
  messagingSenderId: '677080457179',
  appId: '1:677080457179:web:5e1e38f3f082f93427d1fe',
  measurementId: 'G-GP77M3QKXG'
};

class Firebase {
  constructor() {
    initializeApp(firebaseConfig);
    this.auth = getAuth();
    this.db = getDatabase();
    this.doTest = this.doTest.bind(this);
    this.doCreateUser = this.doCreateUser.bind(this);
    this.doSignIn = this.doSignIn.bind(this);
    this.doSignOut = this.doSignOut.bind(this);
    this.doSendEmailVerification = this.doSendEmailVerification.bind(this);
    this.doPasswordReset = this.doPasswordReset.bind(this);
    this.doPasswordUpdate = this.doPasswordUpdate.bind(this);
    this.doIsEmailVerified = this.doIsEmailVerified.bind(this);
    this.checkIsExistingUser = this.checkIsExistingUser.bind(this);
    this.writeBasicUserData = this.writeBasicUserData.bind(this);
    this.clearBasicUserData = this.clearBasicUserData.bind(this);
    this.togglePublisher = this.togglePublisher.bind(this);
    this.onAuthStateChanged = onAuthStateChanged;
    this._getBasicUserInfo = this._getBasicUserInfo.bind(this);


  }

  doTest() {
    return ('FIREBASE');
  }

  //yes
  doCreateUser(email, password) {
    return createUserWithEmailAndPassword(email, password)
      .then(
        (userData) => {
          sendEmailVerification(userData.user);
        }
      )
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error);
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
      });
  }

  //yes
  doSignIn(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorMessage) alert(errorCode + ' ' + errorMessage);
      }
      );
  }

  //yes
  doSignOut() {
    return signOut();
  }

  //yes
  doSendEmailVerification() {
    sendEmailVerification(this.auth.currentUser)
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          console.log(errorMessage);
        }
        console.log(error);
      });
  }
  //yes
  doPasswordReset(email) {
    alert('EMAIL');
    return this.auth.sendPasswordResetEmail(email);
  }

  //yes
  doPasswordUpdate(password) {
    return this.auth.currentUser.updatePassword(password);
  }

  //yes
  returnUsername() {
    return this.auth.currentUser.displayName;
  }

  //yes
  doUsernameUpdate(username) {
    return this.auth.currentUser.updateProfile({ displayName: username })
      .then(() => 200)
      ;
  }

  //yes
  doIsEmailVerified() {
    if (this.auth.currentUser) {
      return this.auth.currentUser.emailVerified;
    }
  };
  _getBasicUserInfo() {
    const uid = this.auth.currentUser.uid;
    const usernameRef = ref(this.db, 'users/' + uid);
    return onValue(usernameRef, (snapshot) => {
      console.log(snapshot.val());
      return snapshot.val();
    });
  }
  //yes
  checkIsExistingUser() {
    return this._getBasicUserInfo();
  }

  //yes
  returnName() {
    return this._getBasicUserInfo();
  }

  //yes
  writeBasicUserData(username, firstName, lastName) {
    const uid = this.auth.currentUser.uid;
    const update = {
      username: username,
      firstName: firstName,
      lastName: lastName
    };
    return set(ref(this.db, 'users/' + uid),
      update
    );

    // return this.db.ref('users/' + uid)
    //   .set({
    //     username: username,
    //     firstName: firstName,
    //     lastName: lastName
    //   })
    //   .then(() => 200)
  }

  clearBasicUserData(uid) {
    if (this.auth.currentUser) {
      const uid = this.auth.currentUser.uid;
      return set(ref(this.db, 'users/' + uid), null);
    }
    else {
      return;
    }
  }


  togglePublisher(uid, boolean) {
    // const uid = this.auth.currentUser.uid;
    const update = {
      publisher: boolean
    };
    return set(ref(this.db, 'users/' + uid),
      update
    );

    // return this.db.ref('users/' + uid)
    //   .set({
    //     publisher: boolean
    //   })
    //   .then(() => 200)
  }
}


export default Firebase;