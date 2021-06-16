import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import '../style.css';
import './style.css';
import { connect } from 'react-redux';
import Tabnav from '../../tabnav';
import ModalAdd from '../modals/addText';
import ModalUpt from '../modals/uptTask';
import DeleteModal from '../../containers/deleteContainer';
import EditPlan from '../modals/editPlans';
import More from '../../../assets/more.svg';
import {
    updatePlan,
    updatePlanList,
    deletePlan
} from '../../../redux/actions/planActions';
import GPlan from '../../../assets/tabnav/G-my plan.svg';
import BPlan from '../../../assets/tabnav/B-my plan.svg';
let icons = [{ G: GPlan, B: BPlan }];

const bS = {
    borderBottom: 'solid 1px #dcdde1'
};
const mT = {
    marginTop: '12px'
};

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const Colors = [
    "#e74c3c", "#34495e", "#3498db", "#1abc9c", "#2ecc71", "#d35400", "#9b59b6"
];

const appendText = [
    'st', 'nd', 'rd', 'th', 'th'
];

const Details = ({
    org, _id, Plan, tabNav, setTN, updatePlan, updatePlanList, deletePlan, getListA
}) => {
    const [id, setId] = useState(''), [text, setText] = useState(''),
        [del, setDel] = useState(false), [tempNum, setTPN] = useState(''), [mDLA, setMDLA] = useState(false), [mDLE, setMDLE] = useState(false),
        [object, setObj] = useState(''), [days, setDays] = useState([]), [active, setAct] = useState(false), [tempPlan, setTP] = useState(false);
    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    useEffect(() => {
        setId(Plan._id); setDayList(Plan.day1, Plan.day2, Plan.day3, Plan.day4, Plan.day5, Plan.day6, Plan.day7);
        let date = new Date(Plan.started);
        let num = Math.floor(date.getDate() / 7);
        let month = date.getMonth();
        setText(`${num + 1}${appendText[num]} Week of ${monthNames[month]}`);
    }, [Plan]);

    const setDayList = (day1, day2, day3, day4, day5, day6, day7) => {
        let list = [];
        list.push(day1, day2, day3, day4, day5, day6, day7);
        setDays(list);
    };

    const getList = (i) => {
        let list = days[i] ? days[i] : [];
        list = list.sort(function (a, b) {
            return a.order - b.order;
        });
        return list;
    };

    const handleAdd = (data, num) => {
        let form = {
            _id: id,
            type: 0,
            num,
            value: data,
        }
        updatePlan(form);
    };

    const handleDelete = (data, num) => {
        let form = {
            _id: id,
            type: 1,
            num,
            value: data,
        }
        updatePlan(form);
    }

    const handleComplete = (data, num) => {
        data.isComplete = true;
        let form = {
            _id: id,
            type: 2,
            num,
            value: data,
        }
        updatePlan(form);
    };

    const handleUpdate = (data, num) => {
        let form = {
            _id: id,
            type: 2,
            num,
            value: data,
        }
        updatePlan(form);
    };

    const handleUpdateList = (data, num) => {
        let form = {
            _id: id,
            type: 3,
            num1: num,
            value1: data,
        }
        updatePlanList(form);
    };


    const handleUpdateLists = (data1, data2, num1, num2) => {
        let form = {
            _id: id,
            type: 4,
            num1: num1,
            value1: data1,
            num2: num2,
            value2: data2
        }
        updatePlanList(form);
    };

    const handleDragWithinList = (num, sI, dI) => {
        let list = days[num] ? days[num] : [], id;

        if (list && list.length > 0) {
            list = list.map(item => {
                if (item.order === sI) id = item.id;
                return item;
            });

            if (sI > dI) {
                list = list.map(item => {
                    if (item.order >= dI && item.order < sI) item.order += 1;
                    return item;
                });
            } else {
                list = list.map(item => {
                    if (item.order <= dI && item.order > sI) item.order -= 1;
                    return item;
                });
            }

            list = list.map(item => {
                if (item.id === id) item.order = dI;
                return item;
            });

            let day = days;
            day[num] = list;
            setDays(day);
            handleUpdateList(list, num);
        }
    };

    const handleDragOutsideList = (num1, num2, sI) => {
        let list = days[num1] ? days[num1] : [], listD = days[num2] ? days[num2] : [], itemId;

        if (list && list.length > 0) {

            list = list.map(item => {
                if (item.order === sI) itemId = item;
                return item;
            });

            list = list.filter(item => item.order !== sI);

            list = list.map(item => {
                if (item.order > sI) item.order -= 1;
                return item;
            });

            if (itemId) {
                itemId.order = listD.length;
                listD.push(itemId);

                let day = days;
                day[num1] = list;
                day[num2] = listD;

                setDays(day);
                handleUpdateLists(list, listD, num1, num2);
            }
        }
    };

    const handleOnDragEnd = (data) => {
        if (data && data.source && data.destination)
            if (data.source.droppableId === data.destination.droppableId) {
                let item = data.source.droppableId.split('-')
                let num = Number(item[1]);
                handleDragWithinList(num, data.source.index, data.destination.index);
            } else if (data.source.droppableId && data.destination.droppableId) {
                let item = data.source.droppableId.split('-'), item2 = data.destination.droppableId.split('-');
                let num1 = Number(item[1]), num2 = Number(item2[1]);
                handleDragOutsideList(num1, num2, data.source.index)
            }
    };

    return <div className="col-11 nt-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap:'wrap' }}>
            <h4 className="h">Plan</h4>
            <div style={{ marginLeft: 'auto' }} />
            <div className="input-group col-lg-3 col-12 p-0 mTHS" style={{ marginTop: '12px', marginRight: '6px' }}>
                <input type={'text'} className="form-control" value={text} disabled={true} />
            </div>
            <h6 className={`order mTHS`} style={{ padding: '10px 8px 8px 8px', position: 'relative', marginTop: '14px', borderRadius: '6px' }} onClick={e => setAct(!active)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                    <h6 className='s-l' style={bS} onClick={e => setTP(true)}>Edit Plan</h6>
                    <h6 className='s-l' style={bS} onClick={e => setDel(true)}>Delete Plan</h6>
                </div>
            </h6>
        </div>
        <Tabnav items={[Plan.name]} i={tabNav} setI={setTN} icons={icons} />
        <div className="card-box" style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                {[0, 1, 2, 3, 4, 5, 6].map((i, k) => {
                    return <Droppable droppableId={`drop-${i}`} key={k} >
                        {(provided) => (
                            <div className="cards col-lg-3 col-6">
                                <div className="col-12 card" style={{ backgroundColor: Colors[i] }} {...provided.droppableProps} ref={provided.innerRef}>

                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <h2 className="title">{Days[i]}</h2>
                                        <span className="add" onClick={e => {
                                            setTPN(i);
                                            setMDLA(true);
                                        }}></span>
                                    </div>

                                    {getList(i) && getList(i).length > 0 && getList(i).map((j, n) => {
                                        return <Draggable key={n} draggableId={`drag-${i}-${j.order}`} index={j.order}>
                                            {(provided) => (
                                                <div className={`task ${j.isComplete ? 'complete' : ''}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <span className="iconDs edit" onClick={e => {
                                                            setTPN(i);
                                                            setObj(j);
                                                            setMDLE(true);
                                                        }}></span>
                                                        <span className="iconDs del" onClick={e => handleDelete(j, i)}></span>
                                                        {!j.isComplete && <span className="iconDs check" onClick={e => handleComplete(j, i)}></span>}
                                                    </div>
                                                    <p style={{ whiteSpace: 'pre-wrap' }}>{j.text}</p>
                                                </div>)}
                                        </Draggable>
                                    })}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}

                    </Droppable>
                })}
            </DragDropContext>
        </div>

        {del && <DeleteModal handleModalDel={e => setDel(false)} handleDelete={async e => {
            let data = { _id: id, org: org, uId: _id };
            deletePlan(data);
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {mDLA && tempNum !== '' && <ModalAdd onhandleAdd={data => {
            handleAdd(data, tempNum);
            setMDLA(false);
            setTPN('');
        }} onhandleModal={e => {
            setMDLA(false);
            setTPN('');
        }} order={getList(tempNum).length} />}

        {mDLE && tempNum !== '' && object !== '' && <ModalUpt object={object} onhandleAdd={data => {
            handleUpdate(data, tempNum);
            setMDLE(false);
            setTPN('');
            setObj('');
        }} onhandleModal={e => {
            setMDLE(false);
            setTPN('');
            setObj('');
        }} />}

        {tempPlan && <EditPlan isUpt={true} getList={getListA} Plan={Plan} onhandleModal={e => setTP(false)} />}

    </div>

}

const mapStateToProps = state => {
    return {
        setting: state.setting.data
    }
}

export default connect(mapStateToProps, { updatePlan, updatePlanList, deletePlan })(Details);