import React, { useState } from 'react';
import AxiosHelper from 'utils/axios';
import withRouter from 'utils/withRouter';

const ForkWindow = (props) => {
    const [title, setTitle] = useState('Branch of ' + props.title);
    const [remix, setRemix] = useState('');
    const forkProject = () => {
        return AxiosHelper.createFork(
            props.forkData.profileID,
            props.forkData.indexProfileID,
            props.forkData.username,
            props.forkData.sourceContent,
            props.forkData.shouldCopyPosts,
            props.forkData.displayPhotoKey,
            title,
            remix,
            props.forkData.cachedFeedID
        )
            .then((res) => {
                props.closeModal();
                console.log(res);
                if (window.confirm("Done! Go To Newly Created Series?")) {
                    window.location.replace("/c/" + res.data.projectID.toString())
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <div className='small-post-window'>
            <div id="forkwindow-fields">
                <h3>
                    Create a Branch Of This Series
                </h3>
                <h4>Title</h4>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <h4>Your Twist On This Series</h4>
                <input
                    type="text"
                    placeholder='How Will Your Project Be Linked To This?'
                    value={remix}
                    onChange={(e) => setRemix(e.target.value)}
                />
            </div>
            <div id='rightmanagebuttons-submit'>
                <button onClick={forkProject}>Confirm</button>
                <button onClick={props.closeModal}>Cancel</button>
            </div>
        </div>)
}

export default withRouter(ForkWindow);