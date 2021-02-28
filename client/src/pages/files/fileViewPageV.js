import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getFile } from '../../redux/actions/fileActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/files/viewByVersion'));

const ViewPage = ({ match, getFile, profile, isSuc, file, isErr }) => {
    const { _id, id, ver } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        var data = { _id: _id, org: id };
        getFile(data);
    }, [getFile, _id, id]);

    const getF = () => {
        var data = { _id: _id, org: id };
        getFile(data);
    }

    return <Container profile={profile} isSuc={isSuc && file} isErr={isErr} eT={'File Not Found'} num={9}> <ViewFile ver={Number(ver)} File={file} id={id} getF={getF} tabNav={tabNav} setTN={setTN} /> </Container>
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