module.exports = {

    createPlans: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc && doc.key) return doc.key;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllPlanCount: async (_id, type, due, collection) => {
        try {
            let date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            if (type === 'Name') {
                doc = await collection.find().filter({ postedby: _id }).count();
            } else {
                if (due === 'Due') {
                    doc = await collection.find().filter({ postedby: _id, time_due: { $gt: date } }).count();
                } else if (due === 'Due Today') {
                    doc = await collection.find().filter({ postedby: _id, time_due: date }).count();
                } else if (due === 'Due This Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(-23.90 * (7 - dateL.getDay()));
                    dateR.setHours(0, 0, 0, 0);
                    dateR.addHours(24 * (7 - dateR.getDay()));
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateR, $gte: dateL } }).count();
                } else if (due === 'Due Next Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(24 * (14 - date.getDay()))
                    dateR.addHours(24 * (7 - date.getDay()));
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateL, $gte: dateR } }).count();
                }
                else if (due === 'Due This Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(1);
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateR, $gte: dateL } }).count();
                }
                else if (due === 'Due Next Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(31);
                    dateR.setMonth(dateR.getMonth() + 0);
                    dateL.setMonth(dateL.getMonth() + 1)
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateL, $gte: dateR } }).count();
                } else {
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lt: date } }).count();
                }
            }

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllPlanLimit: async (_id, limit, type, due, collection) => {
        try {
            let plans = [], doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            if (type === 'Name') {
                doc = await collection.find().filter({ $query: { postedby: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (due === 'Due') {
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $gt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else if (due === 'Due Today') {
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: date }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else if (due === 'Due This Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(-23.90 * (7 - dateL.getDay()));
                    dateR.setHours(0, 0, 0, 0);
                    dateR.addHours(24 * (7 - dateR.getDay()));
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateR, $gte: dateL } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else if (due === 'Due Next Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(24 * (14 - date.getDay()))
                    dateR.addHours(24 * (7 - date.getDay()));
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
                else if (due === 'Due This Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(1);
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateR, $gte: dateL } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
                else if (due === 'Due Next Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(31);
                    dateR.setMonth(dateR.getMonth() + 0);
                    dateL.setMonth(dateL.getMonth() + 1)
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else {
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
            }

            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                plans.push(tempDoc);
            });
            return plans;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllPlanQueryCount: async (_id, string, type, due, collection) => {
        try {
            let date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            if (type === 'Name') {
                doc = await collection.find().filter({ postedby: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            } else {
                if (due === 'Due') {
                    doc = await collection.find().filter({ postedby: _id, time_due: { $gt: date }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                } else if (due === 'Due Today') {
                    doc = await collection.find().filter({ postedby: _id, time_due: date, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                } else if (due === 'Due This Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(-23.90 * (7 - dateL.getDay()));
                    dateR.setHours(0, 0, 0, 0);
                    dateR.addHours(24 * (7 - dateR.getDay()));
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateR, $gte: dateL }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                } else if (due === 'Due Next Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(24 * (14 - date.getDay()))
                    dateR.addHours(24 * (7 - date.getDay()));
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateL, $gte: dateR }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                }
                else if (due === 'Due This Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(1);
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateR, $gte: dateL }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                }
                else if (due === 'Due Next Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(31);
                    dateR.setMonth(dateR.getMonth() + 0);
                    dateL.setMonth(dateL.getMonth() + 1)
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateL, $gte: dateR }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                } else {
                    doc = await collection.find().filter({ postedby: _id, time_due: { $lt: date }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                }
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllPlanQueryLimit: async (_id, limit, string, type, due, collection) => {
        try {
            let plans = [], doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            if (type === 'Name') {
                doc = await collection.find().filter({ $query: { postedby: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (due === 'Due') {
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $gt: date }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else if (due === 'Due Today') {
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: date, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else if (due === 'Due This Week') {   
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateL.setHours(0,0,0,0);
                    dateL.addHours(-23.90 * (7 - dateL.getDay()));
                    dateR.setHours(0, 0, 0, 0);
                    dateR.addHours(24 * (7 - dateR.getDay()));
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateR, $gte: dateL }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else if (due === 'Due Next Week') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateL.addHours(24 * (14 - date.getDay()))
                    dateR.addHours(24 * (7 - date.getDay()));
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateL, $gte: dateR }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
                else if (due === 'Due This Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(1);
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateR, $gte: dateL }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
                else if (due === 'Due Next Month') {
                    let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                    dateR.setHours(0, 0, 0, 0);
                    dateL.setHours(0, 0, 0, 0);
                    dateR.setDate(31);
                    dateL.setDate(31);
                    dateR.setMonth(dateR.getMonth() + 0);
                    dateL.setMonth(dateL.getMonth() + 1)
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lte: dateL, $gte: dateR }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                } else {
                    doc = await collection.find().filter({ $query: { postedby: _id, time_due: { $lt: date }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
            }

            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                plans.push(tempDoc);
            });
            return plans;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getPlanById: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();
                tempDoc._id = doc.key;
                return tempDoc;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findPlanByName: async (value, org, _id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ name: value, postedby: _id, org: org }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deletePlan: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deletePlanUser: async (_id, collection) => {
        try {
            await collection.find().filter({ postedby: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePlan: async (_id, type, num, value, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();

                if (type === 0) {
                    switch (num) {
                        case 0:
                            tempDoc.day1.push(value);
                            break;
                        case 1:
                            tempDoc.day2.push(value);
                            break;
                        case 2:
                            tempDoc.day3.push(value);
                            break;
                        case 3:
                            tempDoc.day4.push(value);
                            break;
                        case 4:
                            tempDoc.day5.push(value);
                            break;
                        case 5:
                            tempDoc.day6.push(value);
                            break;
                        case 6:
                            tempDoc.day7.push(value);
                            break;
                    }
                } else if (type === 1) {
                    switch (num) {
                        case 0:
                            tempDoc.day1 = tempDoc.day1.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day1 = tempDoc.day1.filter(i => i.id !== value.id);
                            break;
                        case 1:
                            tempDoc.day2 = tempDoc.day2.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day2 = tempDoc.day2.filter(i => i.id !== value.id);
                            break;
                        case 2:
                            tempDoc.day3 = tempDoc.day3.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day3 = tempDoc.day3.filter(i => i.id !== value.id);
                            break;
                        case 3:
                            tempDoc.day4 = tempDoc.day4.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day4 = tempDoc.day4.filter(i => i.id !== value.id);
                            break;
                        case 4:
                            tempDoc.day5 = tempDoc.day5.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day5 = tempDoc.day5.filter(i => i.id !== value.id);
                            break;
                        case 5:
                            tempDoc.day6 = tempDoc.day6.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day6 = tempDoc.day6.filter(i => i.id !== value.id);
                            break;
                        case 6:
                            tempDoc.day7 = tempDoc.day7.map(i => {
                                if (i.order > value.order) i.order -= 1;
                                return i;
                            });
                            tempDoc.day7 = tempDoc.day7.filter(i => i.id !== value.id);
                            break;
                    }
                } else if (type === 2) {
                    switch (num) {
                        case 0:
                            tempDoc.day1 = tempDoc.day1.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                        case 1:
                            tempDoc.day2 = tempDoc.day2.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                        case 2:
                            tempDoc.day3 = tempDoc.day3.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                        case 3:
                            tempDoc.day4 = tempDoc.day4.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                        case 4:
                            tempDoc.day5 = tempDoc.day5.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                        case 5:
                            tempDoc.day6 = tempDoc.day6.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                        case 6:
                            tempDoc.day7 = tempDoc.day7.map(i => {
                                if (i.id === value.id) i = value;
                                return i;
                            });
                            break;
                    }
                } else if (type === 3) {
                    switch (num) {
                        case 0:
                            tempDoc.day1 = value;
                            break;
                        case 1:
                            tempDoc.day2 = value;
                            break;
                        case 2:
                            tempDoc.day3 = value;
                            break;
                        case 3:
                            tempDoc.day4 = value;
                            break;
                        case 4:
                            tempDoc.day5 = value;
                            break;
                        case 5:
                            tempDoc.day6 = value;
                            break;
                        case 6:
                            tempDoc.day7 = value;
                            break;
                    }
                }

                await collection.find().fetchArraySize(0).key(_id).replaceOne(tempDoc);
                tempDoc._id = _id;
                return tempDoc;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePlanDetails: async (_id, name, date, isTrue, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();

                if (!isTrue) {
                    tempDoc.name = name;
                }
                tempDoc.started = date;
                tempDoc.time_due = new Date(tempDoc.started);

                await collection.find().fetchArraySize(0).key(_id).replaceOne(tempDoc);
                tempDoc._id = _id;
                return tempDoc;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePlanList: async (_id, num1, num2, value1, value2, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();

                switch (num1) {
                    case 0:
                        tempDoc.day1 = value1;
                        break;
                    case 1:
                        tempDoc.day2 = value1;
                        break;
                    case 2:
                        tempDoc.day3 = value1;
                        break;
                    case 3:
                        tempDoc.day4 = value1;
                        break;
                    case 4:
                        tempDoc.day5 = value1;
                        break;
                    case 5:
                        tempDoc.day6 = value1;
                        break;
                    case 6:
                        tempDoc.day7 = value1;
                        break;
                };

                switch (num2) {
                    case 0:
                        tempDoc.day1 = value2;
                        break;
                    case 1:
                        tempDoc.day2 = value2;
                        break;
                    case 2:
                        tempDoc.day3 = value2;
                        break;
                    case 3:
                        tempDoc.day4 = value2;
                        break;
                    case 4:
                        tempDoc.day5 = value2;
                        break;
                    case 5:
                        tempDoc.day6 = value2;
                        break;
                    case 6:
                        tempDoc.day7 = value2;
                        break;
                };

                await collection.find().fetchArraySize(0).key(_id).replaceOne(tempDoc);
                tempDoc._id = _id;
                return tempDoc;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    }

}