import React from 'react';
import WelcomePage from './unauthenticated/index';
import UserHomePage from './authenticated/index';
import withRouter from 'utils/withRouter';
import { withFirebase } from 'store/firebase';
import { AuthUserContext } from 'store/session';

const HomePage = (props) => {
    return (
        <>
            <AuthUserContext.Consumer>
                {
                    authUser => {
                        return (authUser && authUser.emailVerified ?
                            <LandingBase
                                authUser={authUser}
                                returnModalStructure={props.returnModalStructure}
                                openMasterModal={props.openMasterModal}
                                closeMasterModal={props.closeMasterModal}
                                modalState={props.modalState}
                            /> :
                            <WelcomePageBase
                                emailVerifiedStatus={false}
                            />)
                    }
                }
            </AuthUserContext.Consumer>
        </>
    )
};

const WelcomePageBase = withRouter(withFirebase(WelcomePage));
const LandingBase = withRouter(withFirebase(UserHomePage)); 

export default withFirebase(HomePage);
