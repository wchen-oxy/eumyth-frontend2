import React from 'react';

const ImageDrop = (props) => (
    <div className='imagedrop'
        onDragOver={props.dragOver}
        onDragEnter={props.dragEnter}
        onDragLeave={props.dragLeave}
        onDrop={props.fileDrop}
        onClick={props.fileInputClicked}
    >
        <div id='imagedrop-message'>
            <div id='imagedrop-upload'></div>
            Drag and Drop files here or click to select file(s)
        </div>
        <input
            ref={props.reference}
            type='file'
            multiple
            onChange={props.filesSelected}
        />
    </div>
)

export default ImageDrop;