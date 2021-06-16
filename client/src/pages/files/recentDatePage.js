import React, { useState, useEffect, lazy } from 'react';
import { connect } from 'react-redux';
import { getRecentFileDate, fetchFileD } from '../../redux/actions/fileActions';
import Container from '../container';
const List = lazy(() => import('../../components/recentFiles/recentFile'));

const DatePage = ({ profile, getRecentFileDate, isL, match, fetchFileD }) => {
    const { id, num } = match.params;
    const [started, setStarted] = useState(0), [tabNav, setTN] = useState(Number(num)), [isList, setISL] = useState(false);

    useEffect(() => {
        setTN(Number(num));

        async function fetch() {
            let data, catId = [];
            switch (Number(num)) {
                case 1:
                    if (profile && profile.user) {
                        profile.user.roles && profile.user.roles.length > 0 && profile.user.roles.map(r => r.category && r.category.length > 0 && r.category.map(c => {
                            if (!catId.includes(c._id)) return catId.push(c._id);
                            return c;
                        }));
                    }
                    data = { cats: catId, auth: profile.user.userType === 1, admin: profile.user.userType === 2 };
                    await fetchFileD(data);
                    break;
                default:
                    await getRecentFileDate();
                    break;
            }
            setStarted(1);
        }
        fetch();
    }, [getRecentFileDate, setStarted, profile, num, fetchFileD])

    return <Container profile={profile} isSuc={!isL && started > 0} num={11}>
        <List id={id} tabNav={tabNav} setTN={setTN} isList={isList} handleISL={setISL} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL
    }
}

export default connect(mapStateToProps, { getRecentFileDate, fetchFileD })(DatePage);