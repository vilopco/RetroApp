import React, { Component } from "react";
import axios from 'axios';
import { connect } from 'react-redux';
import { dragCard,dropCategory } from "../actionCreator";
import socketIOClient from 'socket.io-client';
import Comment from './Comment';


class Column extends Component {

	constructor(){
		super();
		this.state={
			cards:[],
			classCreateCard:"hidden",
			category:null,
			targetbox:null,
			categorycolor:null,
			categoryName:"",
			editLabelCategory:true,
			userAction:[]
		}
		this.cardName = React.createRef();
		this.catName = React.createRef();
	}

	// sending sockets
	send = (action,cards,catid) => {
		switch(action){
			case 'updateCards':
				socket.emit('updateCards', {cards:cards,catid:catid}) // change cards
			break;
			case 'updateColor':
				socket.emit('updateColor', {cards:cards,catid:catid}) // change cards
			break;
			case 'updateCategory':
				socket.emit('updateCategory', {cards:cards,catid:catid}) // change cards
			break;
			
			default:
		}		
	}

	componentDidMount(){

		socket.on('updateCards', ({cards,catid}) => {
			if(this.props.category_id===catid){
				this.setState({
					cards:cards
				})
			}
		})
		socket.on('updateColor', ({cards,catid}) => {
			if(this.props.category_id===catid){
				this.setState({
					categorycolor:cards
				})
			}
		})
		socket.on('updateCategory', ({cards,catid}) => {
			if(this.props.category_id===catid){
				this.setState({
					categoryName:cards
				})
			}
		})

		axios.post('http://localhost:3001/api/getCards', {
			category: this.props.category_id
		}).then(response => {
			const cards=response.data.data;
			this.setState({
				cards,
				category:this.props.category_id,
				categorycolor:this.props.bgColor,
				categoryName:this.props.name
			})
		})
		.catch(error => {
			console.log(error);
		});

		
		
	}
	

	pickColor = (colorID,category) => {
		axios.post('http://localhost:3001/api/updateCategoryColor', {
			category: category,
			colorID: colorID,
		}).then(response => {
			this.setState({
				categorycolor:colorID
			});

			//Socket.io
			this.send("updateColor",colorID,category);
		})
		.catch(error => {
			console.log(error);
		});
	}

	addCard = (e) => {
		e.preventDefault();
		if(this.cardName.current.value){
			axios.post('http://localhost:3001/api/addCard', {
				category: this.props.category_id,
				name: this.cardName.current.value
			}).then(response => {
				const newcard=response.data.data;
				newcard.totalComments=0;
				newcard.totalLikes=0;
				newcard.bgColor="";
				var cards = [...this.state.cards, newcard];
				this.setState({
					cards,
					classCreateCard:"hidden"
				})
				//Socket.io
				this.send("updateCards",this.state.cards,this.props.category_id);
			})
			.catch(error => {
				console.log(error);
			});
		}
	}

	showAddCard = (e) => {
		var nClass = (this.state.classCreateCard === "hidden") ? "show" : "hidden";
		this.setState({
			classCreateCard:nClass
		});
		this.cardName.current.value="";
	}

	openComments = (card) => {
		if(typeof card.showComment===undefined){
			card.showComment=true;
			card.commentActive=true;
		}

		var nStatus = (card.commentActive === true) ? false : true;
		var cards=this.state.cards.filter(element => {
			if(element._id===card._id){
				card.showComment=true;
				element.commentActive=nStatus;
			}
			return element;
		});
		this.setState({
			cards
		});
	}


	filterPosts = (card, keyword) => {		
		if (card.name.toLowerCase().includes(keyword.toLowerCase())) {
			return (
				<div key={card._id} onDragStart={()=>{this.dragStart(card)}} onDragEnd={()=>{this.dragEnd(card,this.props.category_id)}} draggable className={"draggable custom-card mt-2 b-" + this.state.categorycolor}>
					<div className="container pt-2 pb-1">
						<div className="custom-card-title">
							<div className="row customBordered">
								<div className={"col-12 w-100 " +card.bgColor}></div>
								<h4 className="col-9 h5 mb-0">{card.name}</h4>
								<div className="col-3 text-right"><i className={"fas fa-arrows-alt c-" + this.state.categorycolor}></i></div>
							</div>
						</div>
						<div className="action-card-row">
							<div className="row">
								<div className="col-3">
									<button type="button" className={"btn action-card c-"+this.state.categorycolor} onClick={()=>{this.removeCard(card._id)}}><i className="fas fa-trash-alt"></i></button>
								</div>
								<div className="col-9 text-right">
									<button type="button" className={"btn action-card c-"+this.state.categorycolor} onClick={()=>{this.updateCardLikes(card._id)}}><i className="far fa-thumbs-up"></i> {card.totalLikes?card.totalLikes:0}</button>
									
									<button type="button"  className={"btn action-card c-"+this.state.categorycolor} onClick={()=>{this.openComments(card)}}><i className={"fa"+ (card.commentActive?"s":"r") +" fa-comments"}></i> {card.totalComments?card.totalComments:0}</button>
								</div>
							</div>
						</div>
						
							{card.showComment?
							<div className={"action-comment-row " +(card.commentActive?"show":"d-none")}>
								<div className="row pt-2">
									<Comment action={this.updateCommentNumber} id_card={card._id}/>
								</div>
							</div>
							:""}
						
					</div>
				</div>
			)
		}
	}

	dragStart = (card) => {
		this.props.dragCard(card); //Save Dragged Card
	}

	dragEnd = (card,category_id) => {
		let movingCat=""+this.props.movingCategory;
		if(movingCat && card.category!==category_id){
			var cards=this.state.cards.filter(element => {
				if(element===this.props.movingCard){
					element=null;
				}
				return element;
			});
			this.setState({
				cards
			});
			this.props.dropCategory(null); //Reset Category
		}
	}
	
	drop = (category) => {
		if(this.props.movingCard.category!==category){
			this.props.movingCard.category=category;
			var newCards = [...this.state.cards, this.props.movingCard];
			//Se actualiza el valor de la tarjeta en la base de datos
			this.setState({
				cards:newCards
			})
			this.props.dropCategory(category);

			axios.post('http://localhost:3001/api/updateCard', {
				_id: this.props.movingCard._id,
				category: category,
			}).then(response => {
			})
			.catch(error => {
				console.log(error);
			});	
		}
	}

	dragOver = (event,catid) =>{
		event.preventDefault();
		if(catid!==oldCat){
			oldCat=catid;
		}
		
	}

	updateCommentNumber = (card_id,quantity) => {
		var cards=this.state.cards.filter(element => {
			if(element._id===card_id){
				element.totalComments=quantity;
			}
			return element;
		});
		this.setState({
			cards
		});
		//Socket.io
		this.send("updateCards",this.state.cards,this.props.category_id);
	}

	updateCardLikes = (card_id) => {
		axios.post('http://localhost:3001/api/updateCardLike', {
			_id: card_id
		}).then(response => {
			var cards=this.state.cards.filter(element => {
				if(element._id===card_id){
					if(!element.totalLikes){
						element.totalLikes=0;
					}
					element.totalLikes++;
				}
				return element;
			});
			this.setState({
				cards
			});
			
			//Socket.io
			this.send("updateCards",this.state.cards,this.props.category_id);
		})
	}


	editCategory = () => {
		if(this.state.editLabelCategory===false){
			axios.post('http://localhost:3001/api/updateCategory', {
				name: this.state.categoryName,
				_id: this.props.category_id
			}).then(response => {
				//Socket.io
				this.send("updateCategory",this.state.categoryName,this.props.category_id);
			})
		}
		var nStatus = (this.state.editLabelCategory === true) ? false : true;
		this.setState({
			editLabelCategory:nStatus
		});
		
	}

	editCategoryLabel = (e) => {
		this.setState({
			categoryName:this.catName.current.value
		})
	}
	
	removeCard = (card_id) => {
		axios.post('http://localhost:3001/api/removeCard', {
			_id: card_id
		}).then(response => {
			var cards=this.state.cards.filter(element => {
				if(element._id===card_id){
					element=null;
				}
				return element;
			});
			this.setState({
				cards
			});
			//Socket.io
			this.send("updateCards",this.state.cards,this.props.category_id);
		})
		
	}
	

	render() {
		return (
			<div onDragOver={(event) => {this.dragOver(event,this.props.category_id)}} onDrop={()=>{this.drop(this.state.category)}} className={"col-4 full-height custom-col-design main-"+this.state.categorycolor}>
				<div className="row title-row">
					<h2 className="h4 col-9 font-weight-bold mb-0"><span className={"color-box "+this.state.categorycolor}>
						<ul className="color-picker">
						<li className="color-pick-1" onClick={()=>{this.pickColor("color-pick-1",this.props.category_id)}}></li>
						<li className="color-pick-2" onClick={()=>{this.pickColor("color-pick-2",this.props.category_id)}}></li>
						<li className="color-pick-3" onClick={()=>{this.pickColor("color-pick-3",this.props.category_id)}}></li>
						<li className="color-pick-4" onClick={()=>{this.pickColor("color-pick-4",this.props.category_id)}}></li>
						<li className="color-pick-5" onClick={()=>{this.pickColor("color-pick-5",this.props.category_id)}}></li>
						<li className="color-pick-6" onClick={()=>{this.pickColor("color-pick-6",this.props.category_id)}}></li>
						</ul>
					</span>
					<input type="text" className="inputColumnTitle" value={this.state.categoryName} readOnly={this.state.editLabelCategory} onChange={(e)=>{this.editCategoryLabel(e)}} onKeyDown={(event) => event.keyCode===13&&this.editCategory()} ref={this.catName}/></h2>
					
					<div className="actionsBar col-3 text-right">

						<button type="button" className={"btn editCategoryBtn "+(!this.state.editLabelCategory?"btn-success active":"btn-warning") } onClick={this.editCategory}></button>

						<button type="button" className={"btn btn-primary "+(this.state.classCreateCard==="hidden"?"addCard":"remCard")} onClick={this.showAddCard}></button>


					</div>
				</div>
				<div className={"newCard mt-2 "+this.state.classCreateCard}>
					<form onSubmit={this.addCard}>
						<textarea name="name" placeholder="Type the card name" ref={this.cardName} rows="1" className={"b-"+this.state.categorycolor}></textarea>
						<input name="category" type="hidden" value={this.props.category_id}/>
						<button className="btn btn-primary text-white" type="submit"><i className="fas fa-plus"></i> Add</button>
					</form>
				</div>
				{this.state.cards.map((card, index) => this.filterPosts(card, this.props.keyword))}
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		movingCard: state.dragCard,
		movingCategory: state.dropCategory
	};
};

const mapDipatchToProps = dispatch =>{
	return {
		dragCard(card) {
			dispatch(dragCard(card));
		},
		dropCategory(category) {
			dispatch(dropCategory(category));
		}
	};
};

const socket = socketIOClient("http://localhost:3001");
let oldCat="";

export default connect(mapStateToProps, mapDipatchToProps)(Column);