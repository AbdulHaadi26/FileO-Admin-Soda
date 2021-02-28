import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getFile } from '../../redux/actions/clientFilesAction';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/client_files/view'));

const ViewPage = ({ getFile, profile, isSuc, file, isErr, match }) => {
    const { _id, id, uId } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { _id: _id, pId: uId };
        getFile(data);
    }, [getFile, _id, uId]);

    const getF = () => {
        let data = { _id: _id, pId: uId };
        getFile(data);
    }

    return <Container profile={profile} num={17} isErr={isErr} isSuc={isSuc && file} eT={'Client File Not Found'} >
        <ViewFile getF={getF} File={file} fId={_id} id={id} pId={uId} tabNav={tabNav} setTN={setTN} />
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

export default connect(mapStateToProps, { getFile })(ViewPage);