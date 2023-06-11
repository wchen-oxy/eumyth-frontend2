import { getDistance } from "utils";
import { CACHED, DYNAMIC, POST, USER } from "utils/constants/flags";


export const getDynamicType = (index) => {
    switch (index) {
        case (0): //beginner
            return "EXACT";
        case (1): //familiar
            return "DIFFERENT";
        default:
            throw new Error("Unmatched UNCACHED Type");
    }

}

export const getCachedType = (index) => {
    switch (index) {
        // case (0): //following
        //     return "following";
        case (0): //parents
            return "parents";
        case (1): //siblings
            return "siblings";
        case (2): //children
            return "children";
        default:
            throw new Error("Unmatched Cached Type");

    }
}

const _formatContent = (feed, meta, isCached) => {
    if (isCached) {
        const type = getCachedType(meta.cachedTypeIndex);
        const content = feed[type][meta.cachedItemIndex];
        return {
            type: POST,
            post: content
        }
    }
    else {
        const pursuit = feed[meta.pursuitIndex].type;
        let content = feed[meta.pursuitIndex].queue.shift();
        const index = content.matched_pursuit_index
            = [content.pursuits.findIndex((item) => item.name === pursuit)];
        content.distance = getDistance(
            content.location.coordinates[0],
            meta.coordinates.long,
            content.location.coordinates[1],
            meta.coordinates.lat
        )
        const posts = content.pursuits[index].posts;
        const post = posts.length > 0 ? posts[0].content_id : null;

        return {
            type: USER,
            content: content,
            data: null,
            post: post,
        }
    }
}


export const convertPursuitToQueue = (pursuit) => {
    let i = 0;
    let queue = [];
    while (pursuit.exact[i] && pursuit.different[i]) {
        queue.push(pursuit.exact[i]);
        queue.push(pursuit.different[i]);
        i++;
    }
    let k = i;
    let j = i;

    while (j < pursuit.exact.length) {
        queue.push(pursuit.exact[j++]);
    }

    while (k < pursuit.different.length) {
        queue.push(pursuit.different[k++]);
    }
    return { type: pursuit.type, queue: queue };
}

const _addUsersToContentList = (contentList, usedPeople, formatted) => {
    if (usedPeople[formatted.content._id] === undefined) {
        contentList.push(formatted);
        usedPeople[formatted.content._id] = contentList.length - 1;
    }
    else {
        const index = usedPeople[formatted.content._id];
        contentList[index].content.matched_pursuit_index
            .push(formatted.content.matched_pursuit_index[0]);
    }
}

const _formatUser = (user, pursuit, coordinates) => {
    const index = user.matched_pursuit_index
        = [user.pursuits.findIndex((item) => item.name === pursuit)];
    const posts = user.pursuits[index].posts;
    const post = posts.length > 0 ? posts[0].content_id : null;
    user.distance = getDistance(
        user.location.coordinates[0],
        coordinates.long,
        user.location.coordinates[1],
        coordinates.lat
    )
    return ({
        type: USER,
        content: user,
        data: null,
        post: post
    })
}

export const joinDynamic = (dynamic, coordinates, usedPeople) => {
    let results = [];
    for (const pursuit of dynamic) {
        for (const user of pursuit.queue) {
            if (!usedPeople.has(user._id)) {
                results.push(_formatUser(user, pursuit.type, coordinates));
                usedPeople.add(user._id);
            }
        }
    }
    return results;
}

export const joinCached = (cached) => {
    const results = [];
    addRemainingCachedContent(
        0, 0, cached, results
    );
    return results;
}
export const mergeArrays = (dynamic, cached, contentList) => {
    let min = Math.min(dynamic.length, cached.length);

    for (let i = 0; i < min; i++) {
        contentList.push(dynamic[i], cached[i]);
    }
    contentList.push(...dynamic.slice(min), ...cached.slice(min));
}

export const extractContentFromRaw = ( //to be deleted
    cached,
    dynamic,
    contentList,
    usedPeople,
    coordinates
) => {
    let cachedTypeIndex = 0; //max is 4
    let cachedItemIndex = 0;
    let pursuitIndex = 0;
    let isCachedToggled = true;
    let count = 0;
    const numOfPursuits = dynamic.length;

    while (cachedTypeIndex < 3 && pursuitIndex < numOfPursuits) {
        //add catches for null items
        if (count > 100) throw new Error();
        count++;
        if (isCachedToggled) {
            const formatted =
                _formatContent(
                    cached,
                    {
                        cachedTypeIndex,
                        cachedItemIndex
                    },
                    isCachedToggled
                );
            isCachedToggled = !isCachedToggled;
            if (formatted.post === undefined) {
                cachedItemIndex = 0;
                cachedTypeIndex++;
                continue;
            }
            contentList.push(formatted);
            cachedItemIndex++;
        }
        else {
            if (dynamic[pursuitIndex].queue.length === 0) {
                pursuitIndex++;
                continue;
            }
            const formatted =
                //get item from queue and put into formatter
                _formatContent(
                    dynamic,
                    {
                        pursuitIndex,
                        numOfPursuits,
                        coordinates
                    },
                    isCachedToggled
                );
            isCachedToggled = !isCachedToggled;

            _addUsersToContentList(contentList, usedPeople, formatted);
        }
    }
    return {
        cachedItemIndex,
        cachedTypeIndex,
        pursuitIndex
    }
}

export const addRemainingCachedContent = (
    feedCategoryIndex,
    feedItemIndex,
    feeds,
    contentList,
) => {
    while (feedCategoryIndex < 3) {
        let category = getCachedType(feedCategoryIndex);
        const contentCategory = feeds[category];
        for (let i = feedItemIndex; i < contentCategory.length; i++) {
            contentList.push({
                type: POST,
                post: contentCategory[i]
            });
        }
        feedCategoryIndex++;
    }
}

export const addRemainingDynamicContent = (meta, feed, contentList, usedPeople, coordinates) => {
    while (meta.pursuitIndex < meta.numOfPursuits) {
        if (feed[meta.pursuitIndex].queue.length === 0) {
            meta.pursuitIndex++;
            continue;
        }
        const formatted =
            //get item from queue and put into formatter
            _formatContent(
                feed,
                {
                    pursuitIndex: meta.pursuitIndex,
                    numOfPursuits: meta.numOfPursuits,
                    coordinates
                },
                false
            );
        _addUsersToContentList(contentList, usedPeople, formatted);
    }
}