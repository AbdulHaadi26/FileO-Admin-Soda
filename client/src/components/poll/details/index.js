import React, { lazy, Suspense } from 'react';
import '../style.css';
import './style.css';
import Tabnav from '../../tabnav';
import GPolling from '../../../assets/tabnav/G-Polling.svg';
import BPolling from '../../../assets/tabnav/B-Polling.svg';
const Storage = lazy(() => import('./storage'));
let icons = [{ G: GPolling, B: BPolling }];

const Details = ({
    tabNav, Poll, setTN
}) => {

    return <div className="col-11 nt-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Poll</h4>
            <div style={{ marginLeft: 'auto' }} />
        </div>
        <Tabnav items={[Poll.name]} i={tabNav} setI={setTN} icons={icons} />
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginTop: '30px' }}>Description</h3>
        <p style={{ fontSize: '12px' }}>{Poll.description}</p>
        <hr />
        {Poll.questions && Poll.questions.length > 0 && Poll.questions.map((i, k) => {
            return <div style={{ width: '100%' }} key={k}>
                <h6 style={{ fontSize: '12px' }}><b>{k + 1}-</b>{i.question}</h6>
                <Suspense fallback={<></>}>
                    <Storage options={i.options} count={[
                        i.opt1 && i.opt1.length > 0 ? i.opt1.length : 0,
                        i.opt2 && i.opt2.length > 0 ? i.opt2.length : 0,
                        i.opt3 && i.opt3.length > 0 ? i.opt3.length : 0,
                        i.opt4 && i.opt4.length > 0 ? i.opt4.length : 0
                    ]} />
                </Suspense>
                {k + 1 !== Poll.questions.length && <hr />}
            </div>
        })}
    </div>

}

export default Details;