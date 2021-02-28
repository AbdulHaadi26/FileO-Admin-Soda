import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getFileDetails } from '../../redux/actions/fileActions';
import Container from '../container';
const Details = lazy(() => import('../../components/files/details'));

const FilePage = ({ getFileDetails, profile, isErr, isSuc, file, match }) => {
    const { _id, id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { _id: _id, org: id };
        getFileDetails(data);
    }, [getFileDetails, _id, id])

    return <Container profile={profile} isErr={isErr} isSuc={isSuc && file && file.file} eT={'File Not Found'} num={9}>
        <Details File={file} id={id} org={id} tabNav={tabNav} setTN={setTN} />
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

export default connect(mapStateToProps, { getFileDetails })(FilePage);