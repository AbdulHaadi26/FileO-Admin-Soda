import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { getDashA, getDashU, getDashP } from '../../redux/actions/userActions';
const Admin = lazy(() => import('../../components/dashboard/admin'));
const User = lazy(() => import('../../components/dashboard/user'));
const Manager = lazy(() => import('../../components/dashboard/manager'));

const Dashboard = ({ profile, getDashA, getDashU, isErr, isSuc, dashData, getDashP, isLP, isL }) => {
    const [started, setStarted] = useState(0), [catId, setCatId] = useState([]);

    useEffect(() => {
        if (profile)
            if (profile.user.userType === 2) getDashA();
            else {
                let catId = [];
                profile.user.roles && profile.user.roles.length > 0 && profile.user.roles.map(r => r.category && r.category.length > 0 && r.category.map(c => {
                    if (!catId.includes(c._id)) {
                        return catId.push(c._id);
                    } else return c;
                }));
                let data = { cats: catId, role: profile.user.userType === 1 }
                setCatId(catId);
                profile.user.userType === 1 ? getDashP(data) : getDashU(data);
            }
        setStarted(1);
    }, [profile, getDashA, getDashU, getDashP, setStarted]);

    return <Container profile={profile} isErr={isErr} isSuc={!isLP && !isL && isSuc && dashData && started > 0} eT={'Dashboard Could Not Be Loaded'} num={0}> {profile.user.userType === 2 ? <Admin profile={profile.user}  data={dashData} /> :
        profile.user.userType === 1 ? <Manager profile={profile.user} data={dashData} catId={catId} /> :
            <User profile={profile.user} data={dashData} catId={catId} />} </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.dashboard.isErr,
        isSuc: state.dashboard.isSuc,
        dashData: state.dashboard.data,
        isLP: state.Plan.isL,
        isL: state.Project.isL
    }
}

export default connect(mapStateToProps, { getDashA, getDashU, getDashP })(Dashboard);