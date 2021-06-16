import React, { lazy, Suspense, useEffect, useState } from 'react';
import Axios from 'axios';
import Loader from '../components/loader/loader';
import { clientUrl } from '../utils/api';
const File = lazy(() => import('../components/files'));
const Error = lazy(() => import('../components/files/error'));

export default ({ match }) => {
    const [files, setFile] = useState(''), [err, setErr] = useState(false), [childCat, setCC] = useState(''), [category, setCategory] = useState(''),
        [started, setS] = useState(0), [errT, setET] = useState(0), [postedby, setPBy] = useState(''), [folders, setFolders] = useState([]), [categoryC, setCategoryC] = useState('');

    useEffect(() => {
        async function fetchFile() {
            try {
                let res = await Axios.post(`${clientUrl}/apiC/shared/category/${match.params._id}`, '', { params: { childCat: childCat } });
                if (res.data.error) {
                    setErr(true);
                    setET(res.data.error);
                } else {
                    res.data.files ? setFile(res.data.files) : setFile([]);
                    res.data.postedby && setPBy(res.data.postedby);
                    res.data.folders ? setFolders(res.data.folders) : setFolders([]);
                    res.data.category ? setCategory(res.data.category) : setCategory('');
                    res.data.categoryC ? setCategoryC(res.data.categoryC) : setCategoryC('');
                }
            } catch (error) {
                setErr(true);
                setET('Unexpected error occured.');
            }
            setS(1);
        }
        fetchFile();
    }, [match.params._id, childCat]);

    return <div className="container-fluid">
        <div className="row">
            {started <= 0 && <Loader />}
            <Suspense fallback={<> </>}>
                {files && started > 0 &&
                    <File files={files} postedby={postedby} pCat={match.params._id} category={category} categoryC={categoryC} setCC={setCC} folders={folders} />}
                {err && started > 0 && <Error eT={errT} />}
            </Suspense>
        </div>
    </div>
}