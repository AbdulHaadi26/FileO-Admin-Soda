import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../containerUpt';
import { getDashA, getDashU, getDashP } from '../../redux/actions/userActions';
import { getCodes } from '../../redux/actions/file-OActions';
import history from '../../utils/history';
const Admin = lazy(() => import('../../components/dashboard/admin'));
const User = lazy(() => import('../../components/dashboard/user'));
const Manager = lazy(() => import('../../components/dashboard/manager'));

const Dashboard = ({ profile, getDashA, getDashU, isErr, isSuc, dashData, getDashP, isLP, isL, isUpt, per, getCodes }) => {
    const [started, setStarted] = useState(0), [catId, setCatId] = useState([]);

    useEffect(() => {
        async function fetch() {
            if (profile) {
                if (profile.user.userType === 2) await getDashA();
                else {
                    let catId = [];
                    profile.user.roles && profile.user.roles.length > 0 && profile.user.roles.map(r => r.category && r.category.length > 0 && r.category.map(c => {
                        if (!catId.includes(c._id)) {
                            return catId.push(c._id);
                        } else return c;
                    }));
                    let data = { cats: catId, role: profile.user.userType === 1 }
                    setCatId(catId);
                    if (profile.user.userType === 1) await getDashP(data)
                    else await getDashU(data);
                }

                getCodes();
            }
        }

        fetch();
        setStarted(1);
    }, [profile, getDashA, getDashU, getDashP, getCodes, setStarted]);

    const sendUser = () => {
        if (profile && profile.user && profile.user.userType === 0) history.push(`/organization/${profile.user.current_employer._id}/myspace/user/${profile.user._id}/category/list`);
    };

    return <Container profile={profile} isErr={isErr} isSuc={!isLP && !isL && isSuc && dashData && started > 0} onSubmit={sendUser}
        isUpt={isUpt} percent={per} eT={'Dashboard Could Not Be Loaded'} num={0}>
        {profile.user.userType === 2 ? <Admin profile={profile.user} data={dashData} /> :
            profile.user.userType === 1 ? <Manager profile={profile.user} data={dashData} catId={catId} /> :
                <User profile={profile.user} data={dashData} catId={catId} />}
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

export default connect(mapStateToProps, { getDashA, getDashU, getDashP, getCodes })(Dashboard);