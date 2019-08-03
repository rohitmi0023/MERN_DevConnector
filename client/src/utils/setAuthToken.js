import axios from 'axios';

//Reason for doing it is that when we have a token which you we're just going to send it with every request instead
//of picking and choosing which request to send it with
const setAuthToken = token => {
	if (token) {
		axios.defaults.headers.common['x-auth-token'] = token;
	} else {
		delete axios.defaults.headers.common['x-auth-token'];
	}
};

export default setAuthToken;
