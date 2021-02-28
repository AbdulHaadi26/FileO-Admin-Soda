import React, { lazy, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
const Main = lazy(() => import('../../components/category/main'));

const CreatePage = ({ profile, isL, match }) => {
    const [tabNav, setTN] = useState(0);
    return <Container profile={profile} isSuc={!isL} num={6}> <Main id={match.params.id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Category.isL
    }
}

export default connect(mapStateToProps)(CreatePage);