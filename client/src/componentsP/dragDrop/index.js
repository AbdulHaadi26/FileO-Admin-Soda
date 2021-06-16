import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { useDropzone } from 'react-dropzone'
import { ModalProcess } from '../../redux/actions/profileActions';
const DragDrop = ({
    children, handleSuccess, setting
}) => {

    let fileSize = setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5;

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                if (file && file.size <= (fileSize * 1024 * 1024)) {
                    handleSuccess(file);
                } else {
                    ModalProcess({ title: 'Upload File', text: 'File size exceeds the limit.', isErr: true })
                }
            }
            reader.readAsArrayBuffer(file)

        });
    }, [fileSize, handleSuccess])

    const { getRootProps } = useDropzone({ onDrop })

    return <div className="drag-drop" style={{ width: '100%', display: 'flex', justifyContent: 'center'}}  {...getRootProps()}>
        {children}
    </div>
}


const mapStateToProps = state => {
    return {
        setting: state.setting.data,
    }
};

export default connect(mapStateToProps)(DragDrop);

