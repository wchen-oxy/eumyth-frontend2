export class ViewerObject {
    constructor(
        key,
        isLargeViewMode,
        textData,
        isPostOnlyView,
        pursuitNames,
        eventData,
        projectPreviewMap,
        selectedPostIndex = null

    ) {
        this.key = key;
        this.isLargeViewMode = isLargeViewMode ? true : false;
        this.textData = textData;
        this.isPostOnlyView = isPostOnlyView ? true: false;
        this.pursuitNames = pursuitNames;
        this.eventData = eventData;
        this.projectPreviewMap = projectPreviewMap;
        this.selectedPostIndex = selectedPostIndex;
    }
}

