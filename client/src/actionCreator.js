const dragCard = (dragCard) => {
    return dispatch => {
        dispatch({
            type: "DRAG_CARD",
            dragCard
        })
    };
}

const dropCategory = (dropCategory) => {
    return dispatch => {
        dispatch({
            type: "DROP_CATEGORY",
            dropCategory
        })
    };
}


export { dragCard, dropCategory }