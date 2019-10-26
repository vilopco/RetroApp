import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import socketIOClient from 'socket.io-client';
import Column from './components/Column';

class App extends Component {
	
	constructor(){
		super();
		this.state={
			categories:[],
			keyword:"",
			classaddColumn:"show",
			colorID:"color-pick-1",
			color: 'white'
		}
		this.keyword = React.createRef();
		this.columnName = React.createRef();
		
	}

	// sending sockets
	send = (action,categories) => {
		switch(action){
			case 'updateCategories':
				socket.emit('updateCategories', categories)
			break;
			
			default:
		}		
	}

	componentDidMount() {
		socket.on('updateCategories', (categories) => {
			this.setState({
				categories
			})
		})

		axios.get('http://localhost:3001/api/getCategories').then(response => {
			this.setState({
				categories:response.data.data
			})
		})
		.catch(error => {
			console.log(error);
		});
	}

	filter = () => {
		this.setState({
			keyword:this.keyword.current.value
		});
	}

	addColumn = (e) => {
		e.preventDefault();
		if(this.columnName.current.value){
			axios.post('http://localhost:3001/api/addCategory', {
				name: this.columnName.current.value,
				bgColor: this.state.colorID
			}).then(response => {
				const column=response.data.data;
				this.columnName.current.value="";
				var categories = [...this.state.categories, column];
				this.setState({
					categories,
					classaddColumn:"show"
				})

				//Socket.io
				this.send("updateCategories",this.state.categories);
			})
			.catch(error => {
				console.log(error);
			});
		}
		
	}

	pickColor = (colorID) =>{
		this.setState({
			colorID
		})
	}	
	
	showAddColumn = (e) => {
		var nClass = (this.state.classaddColumn === "hidden") ? "show" : "hidden";
		this.setState({
			classaddColumn:nClass
		});
	}

	render(){
	return (
		<div className="app">
			<div className="row bg-primary full-width">
				<div className="container">
					<div className="row">
						<div className="col-3 align-middle align-self-center">
							<h1 className="h3 mb-0 mt-0 text-white app-title">RetroApp</h1>
						</div>
						<div className="col-3 align-middle align-self-center">
							<input type="text" className="w-100 mb-0 mt-0 input-gen" placeholder="Filter" onChange={this.filter} ref={this.keyword}/>
						</div>
					</div>
				</div>	
			</div>
			<div className="row full-width">
				<div className="container">
					<div className="row">
					{
						this.state.categories.map(category => 
							<Column key={category._id} category_id={category._id} name={category.name} keyword={this.state.keyword} bgColor={category.bgColor} />
						)}
						{this.state.categories.length<3?(
						<>
							<div className={"col-4  full-height custom-col-design "+this.state.classaddColumn}>
								<button className="btn-styled w-100" onClick={this.showAddColumn}>
									<i className="fas fa-plus"></i><br/>
									<span>Add Column</span>
								</button>
							</div>
							
							<div className={"col-4 mt-3 "+(this.state.classaddColumn==="hidden"?"show":"hidden")}>	
								<form id="newColumn" onSubmit={this.addColumn}>
									<span className={"color-box " +this.state.colorID}>
										<ul className="color-picker">
											<li className="color-pick-1" onClick={()=>{this.pickColor("color-pick-1")}}></li>
											<li className="color-pick-2" onClick={()=>{this.pickColor("color-pick-2")}}></li>
											<li className="color-pick-3" onClick={()=>{this.pickColor("color-pick-3")}}></li>
											<li className="color-pick-4" onClick={()=>{this.pickColor("color-pick-4")}}></li>
											<li className="color-pick-5" onClick={()=>{this.pickColor("color-pick-5")}}></li>
											<li className="color-pick-6" onClick={()=>{this.pickColor("color-pick-6")}}></li>
										</ul>
									</span>
									
									<textarea name="name" className={"addColumn b-"+this.state.colorID} placeholder="Type the column name" ref={this.columnName} rows="1"></textarea>
									
									<div className="action">
										<button className="btn btn-danger  text-white" type="button" onClick={this.showAddColumn}><i className="fas fa-times"></i> Cancel</button>
										<button className="btn btn-primary text-white" type="submit"><i className="fas fa-plus"></i> Add</button>
									</div>
								</form>
							</div>
						</>
						):""}
					</div>
				</div>
			</div>
		</div>
	);
}
}

const mapStateToProps = state => {
	return {
		
	};
};

const mapDipatchToProps = dispatch =>{
	return {
		
	}
}

const socket = socketIOClient("http://localhost:3001");

export default connect(mapStateToProps, mapDipatchToProps)(App);
