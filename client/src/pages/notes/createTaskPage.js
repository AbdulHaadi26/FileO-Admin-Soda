import React, { lazy, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
const Main = lazy(() => import('../../components/notes/mainT'));

const CreatePage = ({ profile, isL, match }) => {
    const { id, _id } = match.params, [tabNav, setTN] = useState(0);
    return <Container profile={profile} isSuc={!isL} num={16}> <Main org={id} _id={_id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Note.isL
    }
}

export default connect(mapStateToProps)(CreatePage);