import React, { useState } from 'react';
import './style.css';
import More from '../../../assets/more.svg';
import Bill from '../../../assets/bill.svg';

const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

export default ({ list, ord, setOId, setB }) => {
    const [active, setAct] = useState(false);

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = listT.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        }); break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = listT.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }); break;
    }

    const renderType = (type) => {
        switch (type) {
            case 'Employee': return 'User Upgrade';
            case 'Trail': return 'Trail Upgrade';
            case 'Upgrade': return 'Stroage Upgrade';
            default: return type;

        }
    };

    return listT.map((Item, k) => <div className="col-lg-2 col-4 mFWS" key={k}>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto', opacity: Item.status === 'Unpaid' && Item.type === 'Monthly Billing' ? '1' : '0' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                {Item.status === 'Unpaid' && Item.type === 'Monthly Billing' && <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setOId(Item); }}>Pay Now</h6>
                </div>}
            </h6>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor:'pointer' }} onClick={e => setB(Item)}>
            <img src={Bill} alt="Bill" style={{ width: '36px', height: '36px' }} />
            <h6 style={{ width: '80%', marginTop: '12px', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>{Item.orderId}</h6>
            <h6 style={{ width: '80%', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>{renderType(Item.type)}</h6>
            <h6 style={{ width: '80%', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>{Item.date ? Item.date.substr(0, 10) : ''}</h6>
        </div>
    </div>);
}

//<h6 style={{ width: '80%', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>Package Price: RS {Item.pkgPrice}</h6>
//<h6 style={{ width: '80%', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>User Price: RS {Item.userPrice}</h6>
//<h6 style={{ width: '80%', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>Difference: RS {Item.difference}</h6>
//<h6 style={{ width: '80%', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}><b>Payable Amount:</b> RS {Item.price}</h6>