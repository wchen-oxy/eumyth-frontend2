import React from 'react';
import {
    PERSONAL_PAGE,
    PRIVATE,
    PUBLIC_FEED
} from 'utils/constants/flags';

const PrePostControls = (props) => {
    return (
        <div id='prepostcontrols'>
            <p>Post to:</p>
            <div>
                <select
                    name='posts'
                    value={props.postPrivacyType ?
                        props.postPrivacyType : PUBLIC_FEED}
                    onChange={(e) => props.setPostPrivacyType(e.target.value)}
                >
                    <option value={PRIVATE}>
                        Make post private on your page
                    </option>
                    <option value={PERSONAL_PAGE}>
                        Make post public on your page:
                    </option>
                    <option value={PUBLIC_FEED}>
                        Post to your feed and page
                    </option>
                </select>
            </div>

        </div>
    )
}

export default PrePostControls;