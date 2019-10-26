import React, { Component } from "react";
import axios from 'axios';
import socketIOClient from 'socket.io-client';

class Comment extends Component {
	
	constructor(){
		super();
		this.state = {
			comments: []
		}
		this.refComment = React.createRef();
	}

	// sending sockets
	send = (action,comments,id_card) => {
		switch(action){
			case 'updateComments':
				socket.emit('updateComments', {comments,id_card}) // change cards
			break;
			default:
		}		
	}
	
	componentDidMount() {
		//consulta DB
		const params = {
			id: this.props.id_card
		};

		socket.on('updateComments', ({comments,id_card}) => {		
			if(this.props.id_card===id_card){
				this.setState({
					comments
				})
			}
		})

		axios.post(`http://localhost:3001/api/getComments`,{params})
      	.then(res => {
			const result = res.data;
			if(result.success){
				const comments=result.comments
				this.setState({ comments });
			}
		})
	}
	
	addComment = (e) => {
		e.preventDefault();
		if(this.refComment.current.value){

			axios.post('http://localhost:3001/api/addComment', {
				content: this.refComment.current.value,
				id_card: this.props.id_card
			}).then(response => {
				
				const newComment=response.data.data;
				var comments = [...this.state.comments, newComment];
				this.setState({
					comments
				})
				this.refComment.current.value="";

				//Update comments
				this.props.action(this.props.id_card,this.state.comments.length);

				//Socket.io
				this.send("updateComments",this.state.comments,this.props.id_card);
			})
			.catch(error => {
				console.log(error);
			});
		}
	}

	render() {	
		return (
			<>
			<div className="col-12 relativeContent">
				<form onSubmit={this.addComment}>
					<textarea className="w-100 commentTextarea" ref={this.refComment} placeholder="Add a comment" rows="1"></textarea>
					<button className="btn btn-primary text-white" type="submit"><i className="fas fa-plus"></i> Add</button>
				</form>
			</div>
			<div className="commentsContainer">
			{this.state.comments.map ((comment) => {
			return (<div className="col-12" key={comment._id}>
				<textarea className="w-100 hCommentTextarea" defaultValue={comment.content} readOnly></textarea>
			</div>)})}
			</div>
			</>
		);
	}
}
	
const socket = socketIOClient("http://localhost:3001");

export default Comment;
	
	