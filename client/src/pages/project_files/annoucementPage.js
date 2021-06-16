import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getANC } from '../../redux/actions/announcementActions';
import Container from '../container';
const ViewFile = lazy(() => import('../../components/project_files/viewAnnoucement'));

const ViewPage = ({  profile, annc, isErr, match, getANC, isL }) => {
    const { _id } = match.params, [tabNav, setTN] = useState(0);

    useEffect(() => {
        async function fetch() {
            await getANC(_id);
        };
        fetch();
    }, [getANC, _id]);


    return <Container profile={profile} num={13} isErr={isErr} isSuc={!isL && annc} eT={'Project Annoucement Not Found'}>
        <ViewFile annc={annc} tabNav={tabNav} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        annc: state.Annc.data,
        isErr: state.Annc.isErr,
        isL: state.Annc.isL
    }
};

export default connect(mapStateToProps, { getANC })(ViewPage);