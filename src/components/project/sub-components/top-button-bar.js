import React from 'react';
import RightManageButtons from './right-manage-buttons';
import {
    PROJECT_CONTENT_ONLY_VIEW_STATE,
    PROJECT_MACRO_VIEW_STATE,
    PROJECT_MICRO_VIEW_STATE,
    PROJECT_REARRANGE_STATE,
    PROJECT_SELECT_VIEW_STATE
} from 'utils/constants/flags';

const TopButtonBar = (props) => {
    const ManageButtons =
        <RightManageButtons
            userInfo={props.userInfo}
            title={props.title}
            projectID={props.projectID}
            onEditExistingProject={props.onEditExistingProject}
            postIDList={props.postIDList}
            forkData={props.forkData}
            isOwner={props.isOwner}
            onPublish={props.onPublish}
            status={props.status}

            returnModalStructure={props.returnModalStructure}
            modalState={props.modalState}
            openMasterModal={props.openMasterModal}
            closeMasterModal={props.closeMasterModal}
        />;
    switch (props.barType) {
        case (PROJECT_CONTENT_ONLY_VIEW_STATE):
            return (
                <div id='topbuttonbar-right-only-button-bar'>
                    {ManageButtons}
                </div>
            )
        case (PROJECT_MACRO_VIEW_STATE):
            return (
                <button id='topbuttonbar-left-button' onClick={props.onNewProjectSelect} >
                    New
                </button>
            );
        case (PROJECT_MICRO_VIEW_STATE):
            return (
                <div id='topbuttonbar-dual-button-bar'>
                    <button id='topbuttonbar-left-button' onClick={props.onBackClick}>
                        Back
                    </button>
                    <div>
                        {ManageButtons}
                    </div>
                </div>
            );
        case (PROJECT_SELECT_VIEW_STATE):
            return (
                <div id='topbuttonbar-dual-button-bar'>
                    <button id='topbuttonbar-left-button' onClick={props.onBackClick}>
                        Back
                    </button>
                    <button
                        id='topbuttonbar-right-button'
                        onClick={() => {
                            if (props.projectSelectSubState === 1) {
                                props.handleWindowSwitch(2)
                            }
                            else if (props.projectSelectSubState === 2) {
                                props.handleWindowSwitch('EDIT')
                            }
                            else {
                                throw new Error('Missing selectState')
                            }
                        }}
                    >
                        Next
                    </button>

                </div >
            );
        case (PROJECT_REARRANGE_STATE):
            return (
                <div id='topbuttonbar-dual-button-bar'>
                    <button
                        id='topbuttonbar-left-button'
                        onClick={props.onBackClick}
                    >
                        Back
                    </button>
                    <button
                        id='topbuttonbar-right-button'
                        onClick={() => props.handleWindowSwitch('REVIEW')}
                    >
                        Finalize
                    </button>
                </div>
            );
        default:
            throw new Error('No matching barType');
    }
}

export default TopButtonBar;