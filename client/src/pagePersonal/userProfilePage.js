import React, { lazy, useState } from 'react';
import { connect } from 'react-redux';
import Container from './container';
const Profile = lazy(() => import('../componentsP/profile'));

const ProfilePage = ({ profile, isSuc, setting, isLS }) => {
    const [tabNav, setTN] = useState(0);

    return <Container profile={profile} isSuc={profile && !isLS} num={0}>  {profile && profile.user &&
        <Profile tabNav={tabNav} setTN={setTN} User={profile.user} setting={isSuc && setting && setting.setting ? setting.setting : ''} />}
    </Container>
};

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isLS: state.Profile.isLS,
        isSuc: state.setting.isSuc,
        setting: state.setting.data
    }
};

export default connect(mapStateToProps)(ProfilePage);