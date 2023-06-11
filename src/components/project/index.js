import React from 'react';
import ProfileModal from '../profile/profile-modal';
import EventController from '../timeline/timeline-event-controller';
import MainDisplay from './main-display';
import TopButtonBar from './sub-components/top-button-bar';
import ProjectReview from './review';
import { returnUsernameURL, returnPostURL, returnProjectURL } from "utils/url";
// import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import withRouter from 'utils/withRouter';
import AxiosHelper from 'utils/axios';
import {
    POST,
    PROJECT_CONTENT_ONLY_VIEW_STATE,
    POST_VIEWER_MODAL_STATE,
    PROJECT_EVENT,
    PROJECT_MACRO_VIEW_STATE,
    PROJECT_MICRO_VIEW_STATE,
    PROJECT_REARRANGE_STATE,
    PROJECT_SELECT_VIEW_STATE,
    PROJECT,
    ALL
} from "../../utils/constants/flags";
import { formatPostText, sortTimelineContent } from 'utils';

const MAIN = "MAIN";
const EDIT = "EDIT";
const REVIEW = "REVIEW";
const TITLE = "TITLE";
const OVERVIEW = "OVERVIEW";
const spacer = (
    <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
    </div>
);

const switchModulo = (barType) => {
    switch (barType) {
        case (PROJECT_MACRO_VIEW_STATE):
            return 1;
        case (PROJECT_MICRO_VIEW_STATE):
            return 3;
        case (PROJECT_CONTENT_ONLY_VIEW_STATE):
            return 3;
        default:
            return 4;
    }

}
const handleIndexUpdate = (index) => {
    index++;
    if (index === 4) return 0;
    else {
        return index;
    }
}

// const SortableItem = SortableElement(({ contentType, value, classColumnIndex }) =>
// (
//     <div className="projectcontroller-event">
//         <EventController
//             columnIndex={classColumnIndex}
//             contentType={contentType}
//             eventData={value}
//             editProjectState={false}
//             key={value._id}
//             disableModalPreview={true}
//         />
//     </div>
// ));

// const SortableList = SortableContainer(({ contentType, items, onSortEnd }) => {

//     return (
//         <ul>
//             {items.map((value, index) => {
//                 return (
//                     <SortableItem
//                         key={`item-${index}`}
//                         index={index}
//                         classColumnIndex={index % 4}
//                         value={value}
//                         contentType={contentType}
//                         onSortEnd={onSortEnd}
//                     />
//                 )
//             })}
//         </ul>
//     )
// });

class ProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentViewOnlyAllPosts: [],
            window: MAIN,
            projectSelectSubState: 1,
            barType: this.props.isContentOnlyView ?
                PROJECT_CONTENT_ONLY_VIEW_STATE : PROJECT_MACRO_VIEW_STATE,
            feedData: [],
            selectedPosts: [],
            semiFinalData: [],
            feedIndex: new Map(),
            title: this.props.content ? this.props.content.title : "",
            overview: this.props.content ? this.props.content?.overview : "",
            selectedProject: this.props.content.post_ids ? {
                ...this.props.content
            } : null,
            selectedEventIndex: null,
            hasMore: true,
            isUpdate: false,
            editProjectState: false,
            feedID: 0,
            selectedPursuitIndex: this.props.selectedPursuitIndex,
            numOfContent: this.props.content.post_ids ?
                this.props.content.post_ids.length : 0,
            projectPreviewMap: {},


            initialPulled: false,
        }

        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
        this.setNewURL = this.setNewURL.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.setSecondaryMainWindow = this.setSecondaryMainWindow.bind(this);
        this.handleSortEnd = this.handleSortEnd.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.setModal = this.setModal.bind(this);
        this.setInitialPulled = this.setInitialPulled.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.handleNewProjectSelect = this.handleNewProjectSelect.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.clearedFeed = this.clearedFeed.bind(this);
        this.selectFeedSource = this.selectFeedSource.bind(this);
        this.selectFeedData = this.selectFeedData.bind(this);
        this.onEditExistingProject = this.onEditExistingProject.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
        this.createRenderedPosts = this.createRenderedPosts.bind(this);
        this.handlePublish = this.handlePublish.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
        this.saveProjectPreview = this.saveProjectPreview.bind(this);
    }

    componentDidUpdate() {
        if (this.props.selectedPursuitIndex !== this.state.selectedPursuitIndex) {
            this.setState({
                selectedPursuitIndex: this.props.selectedPursuitIndex,
                feedData: [],
                hasMore: true,
                feedID: this.state.feedID + 1
            })
        }
    }

    setInitialPulled(initialPulled) {
        this.setState({ initialPulled });
    }
    handleCommentIDInjection(selectedEventIndex, rootCommentsArray) {
        const feedData = this.state.feedData;
        console.log(selectedEventIndex);
        feedData[selectedEventIndex].comments = rootCommentsArray;
        feedData[selectedEventIndex].comment_count += 1;
        this.setState({ feedData });
    }

    saveProjectPreview(projectPreview) {
        if (!this.state.projectPreviewMap[projectPreview._id]) {
            let projectPreviewMap = this.state.projectPreviewMap;
            projectPreviewMap[projectPreview._id] = projectPreview;
            this.setState({ projectPreviewMap: projectPreviewMap });
        }
    }

    createTimelineRow(inputArray, contentType, objectIDs) {
        const feedData = sortTimelineContent(
            this.state.feedData,
            inputArray,
            contentType,
            objectIDs
        );
        this.setState({ feedData });
    }

    createRenderedPosts() {
        const shouldMarkNewPosts = this.state.isUpdate && this.state.projectSelectSubState === 2;
        const moduloBasedOffContent = switchModulo(this.state.barType);
        let masterArray = [];
        let index = masterArray.length - 1; //index position of array in masterArray
        let usedPostsLength = this.state.selectedPosts.length;

        this.state.feedData.forEach((event, k) => {
            if (k % moduloBasedOffContent === 0) {
                masterArray.push([]);
                index++;
            }
            masterArray[index].push(
                <div key={event._id}>
                    <EventController
                        modulo={moduloBasedOffContent}
                        columnIndex={k % moduloBasedOffContent}
                        contentType={this.state.barType === PROJECT_MACRO_VIEW_STATE
                            ? PROJECT :
                            PROJECT_EVENT}
                        shouldMarkAsNew={shouldMarkNewPosts ? k < usedPostsLength : false}
                        shouldShowPursuit={this.state.selectedPursuitIndex !== 0}
                        isSelected={this.state.feedIndex.get(event._id)}
                        editProjectState={this.state.editProjectState}
                        key={k}
                        eventIndex={k}
                        eventData={event}
                        onEventClick={this.handleEventClick}
                        onProjectClick={this.handleProjectClick}
                        onProjectEventSelect={this.handleProjectEventSelect}
                    />
                </div>
            );
        })

        return masterArray;
    }

    onSelectAll(isSelected) {
        let newFeedIndex = this.state.feedIndex;
        let selectedPosts = [];
        for (const post of this.state.feedData) {
            newFeedIndex.set(post._id, isSelected);
        }
        if (isSelected) {
            selectedPosts = this.state.feedData.map(item => { return { post_id: item._id } });
        }
        this.setState({ feedIndex: newFeedIndex, selectedPosts });
    }

    onEditExistingProject() {
        const sharedState = {
            barType: PROJECT_SELECT_VIEW_STATE,
            editProjectState: true,
            hasMore: true,
            isUpdate: true,
            feedID: this.state.feedID + 1,
        }
        if (this.props.isContentOnlyView) {
            return Promise
                .all([
                    AxiosHelper.returnUserPreviewByParam({ id: this.props.authUser.userPreviewID }),
                    AxiosHelper.allPosts(this.props.authUser.profileID)
                ])
                .then((results => {
                    this.setState({
                        numOfContent: results[0].data.pursuits[0].num_posts,
                        contentViewOnlyAllPosts: { post_ids: results[1].data.map(item => item.content_id) },
                        ...sharedState,
                        ...this.clearedFeed()
                    })
                }))
                .catch(err => {
                    console.log(err);
                    throw new Error("Nothing returned for all posts");
                })
        }
        else {
            this.setState({
                ...sharedState,
                ...this.clearedFeed()
            })
        }
    }

    clearedFeed() {
        return {
            feedData: [],
            hasMore: true,
            feedID: this.state.feedID + 1
        };
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    handleBackClick() {
        switch (this.state.barType) {
            case (PROJECT_MICRO_VIEW_STATE): //inner project step
                const username = this.state.selectedProject.username;
                this.setState({
                    newProjectState: false,
                    selectedProject: null,
                    title: '',
                    overview: '',
                    barType: PROJECT_MACRO_VIEW_STATE,
                    ...this.clearedFeed()
                }, () => {
                    this.setNewURL(returnUsernameURL(username));
                })
                break;
            case (PROJECT_SELECT_VIEW_STATE): //editting
                if (this.state.isUpdate) {
                    if (this.state.projectSelectSubState === 1) {
                        this.setState({
                            barType: this.props.isContentOnlyView ?
                                PROJECT_CONTENT_ONLY_VIEW_STATE : PROJECT_MICRO_VIEW_STATE,
                            editProjectState: false,
                            selectedPosts: [],
                            feedIndex: new Map(),
                            isUpdate: false,
                            ...this.clearedFeed()
                        })
                    }
                    else if (this.state.projectSelectSubState === 2) {
                        this.setState({
                            projectSelectSubState: 1,
                            initialPulled: false,
                            hasMore: true,
                            ...this.clearedFeed()
                        })
                    }
                }
                else {
                    const decideClearedPageType = this.props.isContentOnlyView ?
                        PROJECT_CONTENT_ONLY_VIEW_STATE : PROJECT_MACRO_VIEW_STATE;
                    // const stopEdits = this.props.isContentOnlyView && this.projectSelectSubState === 1;
                    // const state = stopEdits ? {} : { barType: decideClearedPageType };
                    this.setState({
                        barType: decideClearedPageType,
                        editProjectState: false,
                        projectSelectSubState: 1,
                        isUpdate: false,
                        ...this.clearedFeed()
                    })
                }
                break;
            case (PROJECT_REARRANGE_STATE):
                this.setState({
                    window: MAIN,
                    barType: PROJECT_SELECT_VIEW_STATE
                })
                break;
            default:
                throw new Error("Nothing Matched");
        }
    }

    setModal(postID) {
        if (!this.state.editProjectState) {
            this.props.navigate(returnPostURL(postID), { replace: false });
        }
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        const sourceContent = this.props.isContentOnlyView ? this.props.content : this.state.selectedProject;
        this.setState({
            selectedEventIndex: null,
            header: null
        }, () => {
            if (!this.state.editProjectState) this.setNewURL(returnProjectURL(sourceContent._id));
            this.props.closeMasterModal();
        });
    }


    handleEventClick(selectedEventIndex) {
        this.setState({
            selectedEventIndex
        }, this.setModal(this.state.feedData[selectedEventIndex]._id))
    }

    handleInputChange(id, value) {
        switch (id) {
            case (TITLE):
                this.setState({ title: value })
                break;
            case (OVERVIEW):
                this.setState({ overview: value })
                break;
            default:
                throw new Error("NO TEXT ID'S Matched in POST")
        }
    }

    setSecondaryMainWindow(newIndex, selectedPosts) {
        if (!this.state.newProjectState) {
            this.state.selectedProject
                .post_ids
                .forEach(item => newIndex.set(item, true));
            return this.setState({
                projectSelectSubState: 2,
                selectedPosts,
                feedIndex: newIndex,
                ...this.clearedFeed()
            });
        }
        else {
            const semiFinalData = this.state.feedData
                .filter(item => this.state.feedIndex.get(item._id));
            return this.setState({
                semiFinalData,
                window: EDIT,
                barType: PROJECT_REARRANGE_STATE,
                ...this.clearedFeed()
            });
        }
    }

    handleWindowSwitch(window) {
        let min = 0
        if (window === 2) {
            let newIndex = this.state.feedIndex;
            let selectedPosts = this.state.selectedPosts;
            selectedPosts
                .forEach(item => newIndex.set(item.post_id, true));
            return this.setSecondaryMainWindow(newIndex, selectedPosts);
        }

        if (window === EDIT) {
            if (this.state.window === REVIEW) {
                return this.setState({
                    window: window,
                    barType: PROJECT_REARRANGE_STATE
                })
            }
            else {
                const semiFinalData = this.state.feedData.filter(item => this.state.feedIndex.get(item._id));
                return this.setState({
                    semiFinalData,
                    window: window,
                    barType: PROJECT_REARRANGE_STATE,
                    ...this.clearedFeed()
                });
            }


        }
        else if (window === REVIEW) {
            for (const selectedPost of this.state.selectedPosts) {
                if (selectedPost.min_duration) {
                    min += selectedPost.min_duration;
                }
            }
        }
        this.setState({ window: window, min: min !== 0 ? min : null });
    }

    handleProjectEventSelect(eventData) {
        const feedIndex = this.state.feedIndex;
        if (this.state.projectSelectSubState === 1) {
            const selectedPosts = this.state.selectedPosts;
            feedIndex.set(eventData._id, !feedIndex.get(eventData._id));
            selectedPosts.push({ post_id: eventData._id });
            this.setState({ selectedPosts, feedIndex })
        }
        else if (this.state.projectSelectSubState === 2) {
            feedIndex.set(eventData._id, !feedIndex.get(eventData._id));
            this.setState({ feedIndex })
        }
        else {
            throw new Error("Something weird happened")
        }

    }

    handleSortEnd({ oldIndex, newIndex }) {
        const semiFinalData = this.state.semiFinalData;
        const [reorderedItem] = semiFinalData.splice(oldIndex, 1);
        let index = -1;
        semiFinalData.splice(newIndex, 0, reorderedItem);
        for (let item of semiFinalData) {
            index = handleIndexUpdate(index);
            item.column_index = index;
        }
        this.setState({ semiFinalData });
    }

    setNewURL(projectID) {
        this.props.navigate(projectID, { replace: false });
    }

    handleProjectClick(projectData) {
        console.log(projectData);
        this.setState({
            selectedProject: projectData,
            priorProjectID: projectData.ancestors.length > 0
                ? projectData.ancestors[projectData.ancestors.length - 1]
                : null,
            barType: PROJECT_MICRO_VIEW_STATE,
            title: projectData.title,
            overview: projectData.overview,
            numOfContent: projectData.post_ids.length,
            ...this.clearedFeed()
        }, () => {
            this.setNewURL(returnProjectURL(projectData._id));
            this.shouldPull(true);

        });
    }



    handleNewProjectSelect() {
        this.setState({
            barType: PROJECT_SELECT_VIEW_STATE,
            editProjectState: true,
            newProjectState: true,
            initialPulled: false,
            hasMore: true,
            numOfContent: this.props.authUser.pursuits[0].num_posts,
            ...this.clearedFeed()
        })
    }

    selectFeedSource() {
    }

    selectFeedData() { //decider for feed Data
        switch (this.state.barType) {
            case (PROJECT_CONTENT_ONLY_VIEW_STATE):
                return this.props.content.post_ids;
            case (PROJECT_MACRO_VIEW_STATE):
                return this.props.content.projects.map((item) => item.content_id);
            case (PROJECT_MICRO_VIEW_STATE):
                return this.state.selectedProject.post_ids;
            case (PROJECT_SELECT_VIEW_STATE):
                if (this.state.isUpdate) {
                    if (this.state.projectSelectSubState === 1) {
                        const feed = this.props.isContentOnlyView ?
                            this.state.contentViewOnlyAllPosts.post_ids
                            : this.props.content.posts.map((item) => item.content_id);
                        return feed.filter(item => !this.state.selectedProject.post_ids.includes(item));
                    }
                    else if (this.state.projectSelectSubState === 2) {
                        return this.state.selectedPosts
                            .map((item) => item.post_id)
                            .concat(this.state.selectedProject.post_ids);
                    }
                }
                else {
                    return this.props.content.posts.map((item) => item.content_id);
                }
                break;
            default:
                throw new Error("Nothing Matched");
        }
    }

    handlePublish(id) {
        return AxiosHelper.publishProject(id)
            .then(results => {

            })
            .catch();
    }

    render() {
        const contentType = this.state.editProjectState || this.props.isContentOnlyView || this.state.selectedProject
            ?
            PROJECT_EVENT : PROJECT;
        console.log(this.state.hasMore);
        switch (this.state.window) {
            case (MAIN):
                const sourceContent = this.props.isContentOnlyView ? this.props.content : this.state.selectedProject;
                const event = this.state.feedData ? this.state.feedData[this.state.selectedEventIndex] : [];
                const forkData = {
                    sourceContent,
                    profileID: this.props.authUser.profileID,
                    indexProfileID: this.props.authUser.indexProfileID,
                    username: this.props.authUser.username,
                    shouldCopyPosts: false,
                    displayPhotoKey: this.props.authUser.smallCroppedDisplayPhotoKey,
                    cachedFeedID: this.props.authUser.cached_feed_id

                }

                const projectPreviewMap = {
                    title: this.state.title,
                    project_id: this.state.selectedProject?._id,
                    parent_project_id: this.state.priorProjectID,
                    remix: this.state.selectedProject?.remix
                }

                const viewerObject = {
                    disableCommenting: this.state.editProjectState,
                    largeViewMode: true,
                    textData: event ? formatPostText(event) : null,
                    eventData: event,
                    projectID: this.state.selectedProject?._id,
                    editProjectState: this.state.editProjectState,
                    postIndex: this.state.selectedEventIndex,
                    postType: this.state.postType,
                    pursuitNames: this.props.pursuitNames,
                    projectPreviewMap
                }

                const viewerFunctions = {
                    onCommentIDInjection: this.handleCommentIDInjection,
                    saveProjectPreview: this.saveProjectPreview,
                    setModal: this.setModal,
                    closeModal: this.clearModal,
                }
                return (
                    <>
                        <ProfileModal
                            viewerObject={viewerObject}
                            viewerFunctions={viewerFunctions}

                            authUser={this.props.authUser}
                            modalState={this.props.modalState}
                            returnModalStructure={this.props.returnModalStructure}
                        />
                        <MainDisplay
                            userInfo={{
                                indexUserID: this.props.authUser.indexProfileID,
                                completeUserID: this.props.authUser.profileID,
                                userPreviewID: this.props.authUser.userPreviewID
                            }}
                            forkData={forkData}
                            feedID={this.state.feedID}
                            contentType={contentType}
                            pursuit={this.props.pursuitNames[this.state.selectedPursuitIndex]}

                            initialPulled={this.state.initialPulled}
                            numOfContent={this.state.numOfContent}
                            projectMetaData={this.state.selectedProject}
                            projectSelectSubState={this.state.projectSelectSubState}
                            barType={this.state.barType}
                            window={this.state.window}
                            targetProfileID={this.props.targetProfileID}
                            hasMore={this.state.hasMore}
                            isContentOnlyView={this.props.isContentOnlyView}
                            editProjectState={this.state.editProjectState}
                            title={this.state.title}
                            overview={this.state.overview}
                            allPosts={this.selectFeedData()}
                            loadedFeed={this.createRenderedPosts()}

                            onPublish={this.handlePublish}
                            createTimelineRow={this.createTimelineRow}
                            onProjectEventSelect={this.handleProjectEventSelect}
                            onProjectClick={this.handleProjectClick}
                            handleWindowSwitch={this.handleWindowSwitch}
                            onEventClick={this.handleEventClick}
                            onBackClick={this.handleBackClick}
                            handleInputChange={this.handleInputChange}
                            onEditExistingProject={this.onEditExistingProject}
                            onNewProjectSelect={this.handleNewProjectSelect}
                            shouldPull={this.shouldPull}
                            onSelectAll={this.onSelectAll}
                            setInitialPulled={this.setInitialPulled}

                            returnModalStructure={this.props.returnModalStructure}
                            modalState={this.props.modalState}
                            openMasterModal={this.props.openMasterModal}
                            closeMasterModal={this.props.closeMasterModal}
                        />
                    </>
                );
            case (EDIT):
                return (
                    <div >
                        <TopButtonBar
                            barType={this.state.barType}
                            selectedProjectID={this.state.selectedProject?._id}
                            onBackClick={this.handleBackClick}
                            onNewProjectSelect={this.handleNewProjectSelect}
                            handleWindowSwitch={this.handleWindowSwitch}
                        />
                        <h3>Rearrange Your Posts</h3>
                        <div id="projectcontroller-sortable-list">
                            {this.state.semiFinalData.length === 0 && <p>No Posts Have Been Selected</p>}
                            {/* <SortableList
                                contentType={POST}
                                items={this.state.semiFinalData}
                                onSortEnd={this.handleSortEnd}
                                axis="xy"
                            /> */}
                        </div>
                        {this.state.semiFinalData.length < 12 && spacer}
                    </div>
                );
            case (REVIEW):
                let pursuitSelects = [];
                for (const pursuit of this.props.pursuitNames) {
                    if (pursuit === 'ALL') {
                        pursuitSelects.push(<option key={'None'} value={null}>{ }</option>);
                    }
                    else {
                        pursuitSelects.push(
                            <option key={pursuit} value={pursuit}>{pursuit}</option>
                        );
                    }
                }
                return (
                    <ProjectReview
                        authUser={this.props.authUser}
                        title={this.state.title}
                        overview={this.state.overview}
                        isUpdate={this.state.isUpdate}
                        projectMetaData={this.state.selectedProject}
                        pursuitSelects={pursuitSelects}
                        selectedPosts={this.state.semiFinalData.map(item => item._id)}
                        isContentOnlyView={this.props.isContentOnlyView}
                        onWindowSwitch={this.handleWindowSwitch}
                        handleInputChange={this.handleInputChange}
                    />
                )
            default:
                throw new Error("No Window Options Matched in post-project-controller");
        }

    }
}

export default withRouter(ProjectController);