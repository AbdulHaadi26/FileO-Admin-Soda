import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getCatC } from '../../redux/actions/personal/userCategoryActions';
import { fetchCombined } from '../../redux/actions/personal/userFilesActions';
import Container from '../containerUpt';
const FileList = lazy(() => import('../../componentsP/user_files/list'));

const ListPage = ({ profile, fetchCombined, getCatC, isL, isUpt, isLS, match, isM, per, fileList }) => {
    const { catId, _id } = match.params;
    const [started, setStarted] = useState(0), [tabNav, setTN] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            let data = {
                cat: catId,
                type: 'All'
            };
            await fetchCombined(data);
            getCatC(catId);
            setStarted(1);
        }

        fetch();

    }, [fetchCombined, _id, catId, setStarted, getCatC]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = async () => {
        let data = {
            cat: catId,
            type: 'All'
        };
        await fetchCombined(data);
    };

    return <Container profile={profile} num={14} isSuc={!isUpt && !isL && started > 0 && !isLS} isUpt={isUpt} isM={isM} fileList={fileList} percent={per} onSubmit={getList}>
        <FileList getList={getList} catId={catId} _id={_id} string={string} type={type} tabNav={tabNav}
            setTN={setTN} isList={isList} handleS={onhandleS} handleISL={setISL} handleT={onhandleT}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc,
        isUpt: state.File.isUpt,
        isM: state.File.isM,
        per: state.File.per,
        fileList: state.File.fileData,
    }
};

export default connect(mapStateToProps, { fetchCombined, getCatC })(ListPage);