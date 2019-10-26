import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

const dragCard = (state=[],action)=>{
    
    if(action.type==="DRAG_CARD"){
        return action.dragCard;
    }
    return state;
}


const dropCategory = (state=[],action)=>{
    
    if(action.type==="DROP_CATEGORY"){
        return action.dropCategory;
    }
    return state;
}


const logger = store => next => action => {
    //console.log('dispatching',action);
    let result = next(action);
    //console.log('next state', store.getState());
    return result;
}

export default createStore(combineReducers({ dragCard, dropCategory}), applyMiddleware(logger,thunk));