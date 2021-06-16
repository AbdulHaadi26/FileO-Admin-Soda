import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchANC } from '../../redux/actions/announcementActions';
import { getDiscussion } from '../../redux/actions/discussionActions';
import { getProjectDesc } from '../../redux/actions/projectActions';
import { fetchCombinedP } from '../../redux/actions/project_categoryActions';
import { clearUpload } from '../../redux/actions/project_filesActions';
import Container from '../containerUpt';
const List = lazy(() => import('../../components/project_files/adminCatList'));

const ListPage = ({
    profile, match, fetchCombinedP, getProjectDesc,
    isL, isLS, isLP, isUpt, per, clearUpload,
    getDiscussion, discussion, count, isLA, fetchANC
}) => {
    const { id, _id, num } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [tabNav, setTN] = useState(Number(num)), [isList, setISL] = useState(false)
        , [offset, setOF] = useState(12), [updated, setUpdated] = useState(''), [string2, setS2] = useState('');

    useEffect(() => {
        async function fetch() {
            if (tabNav === 0) {
                if (profile && profile.user) {
                    let data = { _id: _id, auth: profile.user.userType === 1 };
                    await fetchCombinedP(data);
                    await getProjectDesc(_id);
                }
            } else if (tabNav === 1) {
                await fetchANC({
                    pId: _id,
                    type: 'All'
                })
            } else if (tabNav === 2) {
                await getDiscussion({ _id: _id, offset: 0 }, 0);
                setUpdated(new Date(Date.now()).toISOString());
            }

            setStarted(1);
        };

        fetch();

    }, [_id, fetchCombinedP, id, getProjectDesc, profile, setStarted, tabNav, getDiscussion, fetchANC]);

    const onhandleS = s => setS(s);

    const getList = async () => {
        clearUpload();
        if (profile && profile.user) {
            let data = { _id: _id, auth: profile.user.userType === 1 };
            await fetchCombinedP(data);
            await getProjectDesc(_id);
        }
    };

    const udpateDiscussion = async () => {
        await getDiscussion({ _id: _id, offset: Math.floor(offset / 12) }, 1);
        setOF(offset + 12);
    };

    const updateChat = async () => {
        await getDiscussion({ _id: _id, offset: 0 }, 2);
        setUpdated(new Date(Date.now()).toISOString())
    };

    return <Container profile={profile} num={13} isSuc={!isL && !isLS && !isLP && !isLA && started > 0} isUpt={isUpt} percent={per} onSubmit={getList}>
        <List pId={_id} org={id} string={string} auth={profile.user.userType === 1}
            tabNav={tabNav} setTN={setTN} handleS={onhandleS} getList={getList}
            isList={isList} handleISL={setISL} string2={string2} handleS2={setS2} 
            count={count} offset={offset} setOF={udpateDiscussion} updated={updated} updateChat={updateChat} discussion={discussion}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled} />
    </Container>
};

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isLA: state.Annc.isL,
        isUpt: state.File.isUpt,
        per: state.File.per,
        isLP: state.Project.isL,
        discussion: state.Discussion.list,
        count: state.Discussion.count,
    }
}

export default connect(mapStateToProps, { fetchCombinedP, getProjectDesc, clearUpload, getDiscussion, fetchANC })(ListPage);