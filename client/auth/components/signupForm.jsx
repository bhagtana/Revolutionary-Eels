import React from 'react';
import classnames from 'classnames';
import {Link} from 'react-router'


class SignupForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			firstname:'',
			lastname:'',
			username:'',
			email:'',
			password:'',

		}
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	onChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	onSubmit(e) {
		// this.setState({errors: {} });
		e.preventDefault();

		this.props.userSignupRequest(this.state).then(

			(res) => {
				if (res !== 'A user with that username already exists.') {
					console.log('response', res);
					this.props.addFlashMessage({
						type: 'success',
						text: 'you signed up successfully. Welcome'
					})
					this.context.router.push('/documentlist');
				} else {
					
			  		this.setState({username: 'A user with that username already exists.'});
			  		return;
  					

				}
			},
		).catch(
			(err) => {
				console.log('err ', err);
			}
		)
	}

	render() {
		const {errors} = this.state;
		return (
			<div className="main-login main-center"> 
			<form className="form-horizontal" 
				method="post" 
				action="#"
				
				onSubmit={this.onSubmit}>


				<div className="form-group1" >
					<label for="name" 
						className="cols-sm-2 control-label">Firstname</label>
					<div className="cols-sm-10">
						<div className="input-group">
							<span className="input-group-addon">
							<i className="fa fa-user fa" 
								aria-hidden="true">
							</i></span>	
							<input 
								value={this.state.firstname}
								onChange={this.onChange}
								type="text"

								name="firstname"
								className="form-control"
								placeholder="Clara" required
							/>
					    </div>
				    </div>
				</div>

							
				<div className="form-group1">
					<label for="email" 
						className="cols-sm-2 control-label">Lastname</label>
					<div className="cols-sm-10">
						<div className="input-group">
							<span className="input-group-addon">
							<i className="fa fa-user fa" 
								aria-hidden="true">
							</i></span>
							<input 
								value={this.state.lastname}
								onChange={this.onChange}
								type="text"
								name="lastname"
								className="form-control"
								placeholder="Bell" required
							/>
						</div>
					</div>
				</div>

				<div className="form-group1">
					<label for="username" 
						className="cols-sm-2 control-label">Username</label>
					<div className="cols-sm-10">
						<div className="input-group">
							<span className="input-group-addon">
							<i className="fa fa-users fa" 
								aria-hidden="true">
							</i></span>
							<input 
								value={this.state.username}
								onChange={this.onChange}
								type="text"
								name="username"
								placeholder="Mike123"
								className="form-control" required
							/>
						</div>
					</div>
				</div>

				<div className="form-group1">
					<label for="email" 
						className="cols-sm-2 control-label">Email</label>
					<div className="cols-sm-10">
						<div className="input-group">
							<span className="input-group-addon">
							<i className="fa fa-envelope fa" 
								aria-hidden="true">
							</i></span>
							<input 
								value={this.state.email}
								onChange={this.onChange}
								type="email"
								name="email"
								placeholder="Email" 
								className="form-control" required
							/>
						</div>
					</div>
				</div>

				<div className="form-group1">
					<label for="email" 
						className="cols-sm-2 control-label">Password</label>
					<div className="cols-sm-10">
						<div className="input-group">
							<span className="input-group-addon">
							<i className="fa fa-lock fa-lg" 
								aria-hidden="true">
							</i></span>
							<input 
								value={this.state.password}
								onChange={this.onChange}
								type="password"
								data-minlength="6"
								name="password"
								className="form-control" 
								placeholder="Password" required
							/>

						</div>
					</div>
				</div>
	

				<div className="form-group1">
					<button type="button" className="btn btn-primary btn-lg
					 btn-block login-button">
					 Register
					</button>
				</div>
				<div className="form-group1">
		          Already have an account? <Link to="/login">Sign in</Link>
		        </div>
		        <div className="form-group1">
		          <a className="btn btn-primary btn-lg btn-block login-button" href="/auth/facebook">Sign Up With Facebook</a>
		        </div>
			</form>
			</div>
		);
	}
}

SignupForm.propTypes = {

	userSignupRequest: React.PropTypes.func.isRequired, 
	addFlashMessage: React.PropTypes.func.isRequired 
}

SignupForm.contextTypes = {
	router: React.PropTypes.object.isRequired
}
export default SignupForm;