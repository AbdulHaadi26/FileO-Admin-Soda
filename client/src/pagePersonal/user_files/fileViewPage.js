import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getFile } from '../../redux/actions/personal/userFilesActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../componentsP/user_files/view'));

const FileViewPage = ({ match, getFile, profile, isSuc, file, isErr }) => {
    const { _id, id, uId } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        async function fetch() {
            let data = { _id: _id, pId: uId };
            await getFile(data);
        };
        fetch();
    }, [getFile, _id, uId]);

    return <Container profile={profile} num={14} isErr={isErr} isSuc={isSuc && file} eT={'User File Not Found'}>
        <ViewFile _id={_id} profile={profile && profile.user} File={file} id={id} uId={uId} tabNav={tabNav} setTN={setTN}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.File.isErr,
        isSuc: state.File.isSuc,
        file: state.File.data
    }
};

export default connect(mapStateToProps, { getFile })(FileViewPage);