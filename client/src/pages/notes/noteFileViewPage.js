import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getRec } from '../../redux/actions/userFilesActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/notes/fileView'));

const ViewPage = ({ match, getRec, profile, isSuc, file, isErr }) => {
    const { _id, id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { _id: _id };
        getRec(data);
    }, [getRec, _id, id]);

    return <Container profile={profile} isSuc={isSuc && file} isErr={isErr} eT={'File Not Found'} num={16}>
        <ViewFile File={file} id={id} uId={profile && profile.user && profile.user._id} tabNav={tabNav} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.File.isErr,
        isSuc: state.File.isSuc,
        file: state.File.data
    }
}

export default connect(mapStateToProps, { getRec })(ViewPage);