import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../pages/containerUpt';
import { getDashP } from '../redux/actions/personal/userActions';
import { getCodes } from '../redux/actions/file-OActions';
import history from '../utils/history';
const Personal = lazy(() => import('../componentsP/dashboard/personal'));

const Dashboard = ({ profile, isErr, isSuc, dashData, getDashP, isLP, isL, isUpt, per, getCodes }) => {
    const [started, setStarted] = useState(0);
    
    useEffect(() => {
        async function fetch() {
            if (profile) {
                await getDashP();
                getCodes();
            }
        }

        fetch();
        setStarted(1);
    }, [profile, getDashP, getCodes, setStarted]);

    const sendUser = () => {
        if (profile && profile.user) history.push(`/personal/myspace/user/${profile.user._id}/category/list`);
    };
    
    return <Container profile={profile} isErr={isErr} isSuc={!isLP && !isL && isSuc && dashData && started > 0} onSubmit={sendUser}
        isUpt={isUpt} percent={per} eT={'Dashboard Could Not Be Loaded'} num={0}>
        {profile && profile.user && <Personal profile={profile && profile.user} data={dashData} />}
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.dashboard.isErr,
        isSuc: state.dashboard.isSuc,
        dashData: state.dashboard.data,
        isLP: state.Plan.isL,
        isL: state.Project.isL,
        isUpt: state.File.isUpt,
        per: state.File.per
    }
};

export default connect(mapStateToProps, { getDashP, getCodes })(Dashboard);